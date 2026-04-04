# Business Rules

> Comprehensive reference of all business rules governing the Next.js + Keycloak multi-tenant SaaS boilerplate.

---

## Table of Contents

1. [Authentication](#1-authentication)
2. [Token & Session Lifecycle](#2-token--session-lifecycle)
3. [Organization Lifecycle](#3-organization-lifecycle)
4. [Membership & Roles](#4-membership--roles)
5. [Invitations](#5-invitations)
6. [Onboarding](#6-onboarding)
7. [Multi-Tenancy](#7-multi-tenancy)
8. [Domain Management](#8-domain-management)
9. [Platform Administration](#9-platform-administration)
10. [Cross-Cutting Concerns](#10-cross-cutting-concerns)

---

## 1. Authentication

| ID | Rule | Source |
|----|------|--------|
| AUTH-1 | Sole identity provider is Keycloak (OIDC). OAuth security uses both PKCE and state verification. Requested scope: `openid profile email organization:*`. | `features/auth/lib/auth.ts` |
| AUTH-2 | Sessions use JWT strategy (no database). An in-memory `sessionStore` tracks active sessions for backchannel logout — requires Redis/KV for multi-instance production. | `features/auth/lib/auth.ts` |
| AUTH-3 | Unauthenticated users are redirected to `/login`. Public paths bypass auth: `/login`, `/logout`, `/onboarding`, `/api/auth`, `/_next`, `/favicon.ico`. | `proxy.ts` |
| AUTH-4 | If a session has `RefreshTokenError`, the proxy destroys it and redirects to sign-out to force re-login. | `proxy.ts` |
| AUTH-5 | Authenticated users with zero organizations are redirected to `/onboarding`. | `proxy.ts` |
| AUTH-6 | Logout is two-phase: (1) destroy NextAuth session server-side, (2) redirect to Keycloak logout URL with `id_token_hint` to skip the KC confirmation page. CSRF is validated via `Origin` header. | `api/auth/logout/route.ts` |
| AUTH-7 | Keycloak can push backchannel logout via `logout_token` JWT. Token is verified against KC JWKS with issuer + audience validation. | `api/auth/backchannel-logout/route.ts` |
| AUTH-8 | The `idToken` is NEVER exposed to the client — it is only accessible server-side via `auth()`. | `features/auth/lib/auth.ts` |

---

## 2. Token & Session Lifecycle

| ID | Rule | Source |
|----|------|--------|
| TOK-1 | Access token expiry is set from `account.expires_at`, falling back to `now + 5 min`. | `features/auth/lib/auth.ts` |
| TOK-2 | Token refresh uses `grant_type: refresh_token`. New `refresh_token` from response is used if present; otherwise the old one is retained. | `features/auth/lib/auth.ts` |
| TOK-3 | Service account token (for admin API) uses `grant_type: client_credentials` with a separate client ID/secret. Cached in-memory with a 30-second safety margin before expiry. | `features/shared/lib/keycloak-client.ts` |
| TOK-4 | Dual issuer config: `KC_ISSUER` (public, browser-facing) and `KC_ISSUER_INTERNAL` (Docker-internal, server-to-server). | `features/auth/lib/auth.ts` |
| TOK-5 | Re-authentication is triggered (transparent to user) after: org creation, invitation acceptance, auto-join — to refresh the `organization:*` scope in the JWT. | `onboarding/actions.ts` |

### Session Data Exposed to Client

| Field | Content |
|-------|---------|
| `session.user` | `{ id, email, name }` from KC access token |
| `session.organization` | Map of org aliases to `{ id, groups[] }` |
| `session.activeOrg` | First org alias from the organization map |
| `session.orgRole` | Derived: `"admin"` / `"manager"` / `"member"` |
| `session.platformRole` | `"platform-admin"` or `undefined` |
| `session.error` | Error string (e.g., `"RefreshTokenError"`) |

---

## 3. Organization Lifecycle

| ID | Rule | Source |
|----|------|--------|
| ORG-1 | Orgs are created via KC admin API. Alias is derived from name: lowercase, non-alphanumeric → `-`, strip leading/trailing dashes. | `onboarding/actions.ts` |
| ORG-2 | Orgs are created **without a domain** — domain must be claimed and verified separately in settings. | `onboarding/actions.ts` |
| ORG-3 | If alias already exists (409), user is redirected to `/onboarding?error=org_exists`. | `onboarding/actions.ts` |
| ORG-4 | If adding the creator as member fails, the org is deleted (rollback). | `onboarding/actions.ts` |
| ORG-5 | Three default groups are seeded on creation: `Admin`, `Managers`, `Members`. Group seeding failures are logged but non-blocking. | `onboarding/actions.ts` |
| ORG-6 | The creator is added to both `Admin` and `Members` groups. | `onboarding/actions.ts` |
| ORG-7 | After creation, a forced re-sign-in redirects to `/settings?welcome=true`. | `onboarding/actions.ts` |

### Organization Data Model

| Field | Type | Notes |
|-------|------|-------|
| `id` | string | KC-generated UUID |
| `name` | string | Display name |
| `alias` | string | URL-safe identifier, max 63 chars |
| `enabled` | boolean? | Can be suspended by platform admin |
| `domains` | `{name, verified}[]` | At most one domain per org |
| `attributes` | `Record<string, string[]>` | Known keys: `autoJoin`, `domainVerifyToken`, `plan` |

---

## 4. Membership & Roles

| ID | Rule | Source |
|----|------|--------|
| ROLE-1 | Three org-level groups: `Admin`, `Managers`, `Members`. These are KC organization groups, not realm roles. | `shared/constants/org-groups.ts` |
| ROLE-2 | Session role derivation priority: group path contains `/Admin` → `"admin"`, `/Managers` → `"manager"`, else → `"member"`. | `features/auth/lib/auth.ts` |
| ROLE-3 | `assertOrgRole()` resolves the KC user by email, fetches org groups, checks if user is in ANY of the required groups. Throws on failure. | `members/lib/members-admin.ts` |

### Permission Matrix

| Action | Required Role |
|--------|--------------|
| Invite users | `Admin` or `Managers` |
| Revoke invitations | `Admin` or `Managers` |
| Toggle auto-join | `Admin` only |
| Add / verify / remove domain | `Admin` only |
| View members, roles, invitations | Any org member |
| Suspend / reactivate orgs | `platform-admin` (realm role) |

### Group Assignment by Join Method

| Join Method | Groups Assigned |
|-------------|----------------|
| Org creator | `Admin` + `Members` |
| Invitation acceptance | Invited role + `Members` (if different) |
| Auto-join | `Members` only |

---

## 5. Invitations

| ID | Rule | Source |
|----|------|--------|
| INV-1 | Only `Admin` or `Managers` can send invitations. | `invitations/actions.ts` |
| INV-2 | Invitation is sent via KC's `invite-user` endpoint with `application/x-www-form-urlencoded`. | `invitations/lib/invitations-admin.ts` |
| INV-3 | A role must be selected at send time. Valid values: `Admin`, `Managers`, `Members` (validated against `DEFAULT_GROUPS`). | `invitations/actions.ts` |
| INV-4 | The chosen role is persisted in a file-based store (`data/invitation-roles.json`) because KC's invite API has no role parameter. | `invitations/lib/role-store.ts` |
| INV-5 | Role store entries expire after **30 days** (TTL). Cleanup runs on every write. | `invitations/lib/role-store.ts` |
| INV-6 | Invitations can only be sent when a specific org is selected (not in "Tous" mode). | `invitations/page.tsx` |

### Acceptance Validations

All must pass for an invitation to be accepted:

1. User is authenticated with a valid email.
2. Both `orgId` and `invitationId` are provided.
3. Invitation exists in the org's invitation list.
4. Invitation email matches the authenticated user's email.
5. Invitation status is `PENDING`.

### Acceptance Flow

1. Add user to org (409/already-member silently ignored).
2. Look up stored role; default to `Members` if not found.
3. Add user to target group + `Members` group (if different).
4. Delete role store entry.
5. Delete invitation from Keycloak.
6. Trigger re-sign-in for fresh token.

### Revocation

- Only `Admin` or `Managers` can revoke.
- Deletes invitation from KC + cleans up role store entry.

---

## 6. Onboarding

| ID | Rule | Source |
|----|------|--------|
| ONB-1 | Triggered when an authenticated user has zero organizations. | `proxy.ts` |
| ONB-2 | Email domain is classified as public (free provider) or corporate using the `free-email-domains` package. | `organization/lib/email-domain.ts` |
| ONB-3 | For corporate domains, the system searches for an existing org with a matching domain. | `onboarding/actions.ts` |

### Onboarding Paths (Priority Order)

| Priority | Condition | Action |
|----------|-----------|--------|
| 1 | Pending invitations exist | Show invitations with "Accept" button (role displayed) |
| 2 | Matching org exists + auto-join available | Show "Rejoindre" (Join) button |
| 3 | Matching org exists + auto-join NOT available | Show "Contact an administrator" message |
| 4 | Always | Show "Create organization" form |

### Auto-Join Prerequisites

All must be true:
- An org exists with a domain matching the user's email domain.
- The org has `autoJoin` attribute set to `"true"`.
- The org has at least one **verified** domain.
- The user's email domain matches a verified domain on the org.

### Org Name Suggestion

- Corporate domain: capitalize first segment before `.` (e.g., `finanssor.fr` → `"Finanssor"`).
- Public domain: no suggestion; note explains org will be created without a domain.

---

## 7. Multi-Tenancy

| ID | Rule | Source |
|----|------|--------|
| MT-1 | Active org is stored in an `active-org` cookie (`httpOnly`, `secure` in prod, `sameSite: lax`, `maxAge: 365 days`). | `organization/actions/switch-org.ts` |
| MT-2 | Cookie value `"__all__"` represents "Tous" (all orgs) mode. `getActiveOrgId()` returns `null` in this mode. | `organization/lib/active-org.ts` |
| MT-3 | On resolution, cookie value is validated against the session's org aliases. Invalid values fall back to the first org or `"__all__"`. | `(dashboard)/layout.tsx` |
| MT-4 | Org alias validation regex: `/^[a-z0-9][a-z0-9-]{0,62}$/` or literal `"__all__"`. | `organization/actions/switch-org.ts` |

### "Tous" (All Orgs) Mode Behavior

| Feature | Behavior in "Tous" Mode |
|---------|------------------------|
| Members page | Aggregated from all orgs, deduplicated by member ID |
| Roles page | Aggregated from all orgs |
| Invitations page | Aggregated from all orgs, **invite form hidden** |
| Settings page | "Select an organization" message shown |

---

## 8. Domain Management

| ID | Rule | Source |
|----|------|--------|
| DOM-1 | Only `Admin` can add, verify, or remove domains. | `settings/actions.ts` |
| DOM-2 | An org can have **at most one domain**. Attempting to add a second throws an error. | `settings/actions.ts` |
| DOM-3 | Domains must contain a `.` character (basic validation). | `settings/actions.ts` |
| DOM-4 | Domains are added in an **unverified** state. | `settings/actions.ts` |

### DNS Verification Flow

1. A UUID verification token is generated and stored in `attributes.domainVerifyToken`.
2. The admin must add a DNS TXT record: `keycloak-verify={token}`.
3. Admin clicks "Verify now" to trigger verification.
4. System resolves TXT records via `dns/promises.resolveTxt()`.
5. If a TXT record matches `keycloak-verify={expected}`, domain is marked `verified: true`.
6. DNS propagation may take up to 48 hours.

### Domain Removal Side Effects

- Clears `domainVerifyToken` attribute.
- Forces `autoJoin` to `"false"`.
- Sets domains array to `[]`.

---

## 9. Platform Administration

| ID | Rule | Source |
|----|------|--------|
| PA-1 | A user is a platform admin if their KC id_token contains `"platform-admin"` in `realm_access.roles`. Detected on every login and token refresh. | `features/auth/lib/auth.ts` |
| PA-2 | The `/admin` route is protected: non-admins are redirected to `/`. Every admin server action calls `assertPlatformAdmin()`. | `(dashboard)/admin/layout.tsx` |
| PA-3 | Admin nav item only appears when `platformRole === "platform-admin"`. | `components/app-sidebar.tsx` |

### Platform Admin Capabilities

| Action | Description |
|--------|-------------|
| View all organizations | Lists every org with member counts, plan, and status |
| Suspend organization | Sets `enabled: false` |
| Reactivate organization | Sets `enabled: true` |
| View aggregate stats | Total orgs, total users, active org count |

---

## 10. Cross-Cutting Concerns

| ID | Rule | Source |
|----|------|--------|
| XC-1 | The session's `user.id` is the NextAuth ID, **not** the Keycloak user ID. KC user ID must be resolved via `getUserByEmail()`. | `shared/lib/keycloak-user.ts` |
| XC-2 | `getUserOrganizations()` uses a workaround: KC nightly's `memberUserId` filter returns false positives, so each candidate org's membership is verified by fetching the full members list. | `organization/lib/organization-admin.ts` |
| XC-3 | All member-add operations silently ignore HTTP 409 (already a member), making them idempotent. | Multiple files |
| XC-4 | The file-based role store (`data/invitation-roles.json`) is a development convenience. **Must be replaced with a database table in production.** | `invitations/lib/role-store.ts` |
| XC-5 | The in-memory session store for backchannel logout is **not shared across Edge isolates**. Must be replaced with Redis/KV for production multi-instance deployments. | `features/auth/lib/auth.ts` |
| XC-6 | UI language is primarily French. Server-side error messages are also in French. The Admin page is in English. | Multiple files |
