<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-04-03 -->

# lib

## Purpose
Server-side shared libraries: Keycloak OIDC authentication config, Admin REST API client, active-org resolver, email domain classifier, and multi-tenant scope filter. All files in this directory are server-only — they run exclusively in Node.js RSC or Server Actions contexts.

## Key Files

| File | Description |
|------|-------------|
| `auth.ts` | NextAuth v5 config — Keycloak OIDC provider with `organization:*` scope, JWT callback for token refresh and org/role extraction, session callback for serializing org claim, in-memory `sessionStore` Map for backchannel logout. Exports `{ handlers, signIn, signOut, auth, unstable_update, sessionStore }`. |
| `keycloak-admin.ts` | Service account client for the Keycloak Admin REST API. Caches the service account token (with 30s expiry buffer). `adminFetch()` helper auto-injects Bearer token. Covers: org CRUD, member management, group operations, invitation send/list/delete, user search by email, role assertion. |
| `active-org.ts` | Resolves the active organization from the `active-org` cookie + session. `getActiveOrgId()` returns the KC org ID or `null` for `__all__` mode. `getAllOrgIds()` returns all org IDs for the current user (for cross-org aggregation). |
| `email-domain.ts` | Public vs professional email domain detection using `free-email-domains` package. `extractDomain(email)`, `isPublicDomain(domain)`, `suggestOrgName(email)` (returns first part of domain, capitalized; returns `null` for public domains). |
| `scope-filter.ts` | Framework-agnostic multi-tenant data filter. `buildScopeFilter(ctx)` returns `{ orgIds, assignedTo? }` based on active org and user role. `filterRecords(records, filter)` applies the filter. Members see only their own records; admins/managers see all org records. |
| `utils.ts` | Shared utility functions (e.g., `cn()` for Tailwind class merging via `clsx` + `tailwind-merge`). |

## Subdirectories

| Directory | Purpose |
|-----------|---------|
| `demo/` | In-memory demo data stores for Contacts and Tasks modules — simulates a database with per-org scoping |

## For AI Agents

### Working In This Directory
- **Server-only**: do not import browser APIs, do not add `"use client"`. These files run in Node.js only.
- `auth.ts` uses two KC URLs: `KC_PUBLIC` (`KC_ISSUER` env var) for `authorization.url` and `jwks_endpoint`; `KC_INTERNAL` (`KC_ISSUER_INTERNAL`) for `token.url`, `userinfo.url`, and all token refresh calls
- `keycloak-admin.ts` uses only `KC_ISSUER_INTERNAL` — all Admin API calls go Docker-internal
- Token caching in `keycloak-admin.ts`: module-level `cachedToken` object, checks `Date.now() < expiresAt` before each call

### auth.ts Key Behaviors
- JWT callback: stores tokens on first login (when `account` is present); on subsequent calls refreshes if `accessTokenExpiresAt` has passed; returns `{ error: "RefreshTokenError" }` on refresh failure (caught by `proxy.ts`)
- Session callback: decodes the access token JWT payload (base64, no verification needed — already verified by NextAuth); extracts `organization` claim, derives `activeOrg` (first org alias) and `orgRole` from group membership paths (`/Admin`, `/Managers`)
- `idToken` is attached to the session object server-side only — it is NOT included in the serialized client session cookie (intentional, used only for KC OIDC logout `id_token_hint`)
- `sessionStore` Map: maps `providerAccountId` → `token.sub`; used by `backchannel-logout` route to find and invalidate sessions. **Not cluster-safe** — replace with Redis in production.

### keycloak-admin.ts Key Behaviors
- `getOrgByAlias(alias)` uses `?search=<alias>` (KC search covers both org name AND alias/domain)
- `searchOrgByDomain(domain)` uses `?search=<domain>&exact=true` then filters by `org.domains[].name`
- `getPendingInvitationsForUser()` is domain-scoped (not a full realm scan) to limit Admin API calls
- `assertOrgRole(orgId, userEmail, requiredGroups)` throws `"Accès refusé : rôle insuffisant"` — always call this in Server Actions that mutate org data
- `sendOrgInvitation()` uses form-encoded body (KC requires `application/x-www-form-urlencoded` for this endpoint)

### active-org.ts Key Behaviors
- Falls back to `orgAliases[0]` when cookie is missing or not in the user's org list (prevents cookie-stuffing attacks)
- Returns `null` (not `undefined`) when in `__all__` mode — dashboard pages check `if (orgId)` to branch behavior

### scope-filter.ts Usage
```typescript
const filter = buildScopeFilter({
  activeOrg: "my-org",   // or "__all__"
  userId: session.user.id,
  userRole: session.orgRole,   // "admin" | "manager" | "member"
  userOrgIds: ["org-id-1"],
});
const visible = filterRecords(allRecords, filter);
```

## Dependencies
- `next-auth` — `NextAuth`, `JWT` type
- `next/headers` — `cookies()` (async in Next.js 15+)
- `@/types` — `Organization`, `OrgMember`, `OrgInvitation`, `OrgGroup`, `OrgRole`
- `free-email-domains` — public domain list
- Environment variables: `KC_ISSUER`, `KC_ISSUER_INTERNAL`, `KC_CLIENT_ID`, `KC_CLIENT_SECRET`, `KC_SERVICE_ACCOUNT_CLIENT_ID`, `KC_SERVICE_ACCOUNT_CLIENT_SECRET`
