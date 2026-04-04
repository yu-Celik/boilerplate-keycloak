<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-04-04 -->

# (auth)

## Purpose
Authentication route group containing pages that are accessible without a full dashboard session: the login redirect page, the post-registration onboarding wizard for organization creation, and the logout page. These routes are explicitly listed in the `PUBLIC_PATHS` array of `src/proxy.ts` so they bypass the auth middleware.

## Key Files

| File | Description |
|------|-------------|
| `page.tsx` (implicitly no page here) | (See subdirectories below) |

## Subdirectories

| Directory | Purpose |
|-----------|---------|
| `login/` | Login page with KC redirect (see `login/AGENTS.md`) |
| `onboarding/` | Post-registration org creation wizard (see `onboarding/AGENTS.md`) |
| `logout/` | Post-logout landing page (see `logout/AGENTS.md`) |

## For AI Agents

### Working In This Directory
- No sidebar layout — these pages use only the root `layout.tsx` (full-page centered forms)
- All routes are in `PUBLIC_PATHS` in `src/proxy.ts` — they must remain publicly accessible
- Do not add `"use client"` to page files; use a separate client component for interactive elements (see `login/login-redirect.tsx` pattern)

### Onboarding Flow
```
User registers in KC → KC redirects to Next.js with OIDC code
→ NextAuth exchanges code for tokens
→ session.organization is null (zero orgs) → proxy.ts redirects to /onboarding
→ onboarding/page.tsx loads with getOnboardingState():
    - Checks for pending invitations (domain-scoped KC search, not full realm scan)
    - Checks if org with matching email domain already exists
    - Suggests org name from email domain (skipped for public domains like gmail.com)
→ User submits form → createOrganizationAndRefresh():
    1. Create KC org via Admin API
    2. Add creator as member (rollback: delete org if this fails)
    3. Seed default groups: Admin, Managers, Members
    4. Add creator to Admin + Members groups
    5. Call signIn("keycloak") to force re-authentication with organization scope
→ User lands on /members with org in JWT
```

### Invitation Acceptance Flow
```
User has pending invitation → shown on onboarding page
→ acceptInvitationFromOnboarding():
    1. Validate invitation belongs to this user (email match + PENDING status)
    2. addOrgMember() — ignore 409 (already member)
    3. deleteOrgInvitation() — cleanup
    4. signIn("keycloak") — re-auth to get fresh token with new org
```

### Key Patterns
- `suggestOrgName(email)` uses `free-email-domains` to detect public domains and returns `null` for them (no suggestion for gmail.com users)
- Org alias is auto-generated: lowercase, non-alphanumeric chars replaced with `-`, leading/trailing dashes stripped
- Domain ownership: first org on a domain claims it; subsequent orgs for the same domain are created without a domain association
- Default groups seeded: `Admin`, `Managers`, `Members` — creator is added to `Admin` and `Members`

## Dependencies
- `@/features/auth/lib/auth` — `auth()`, `signIn()`
- `@/features/organization/lib/organization-admin` — org CRUD, member management, invitation operations
- `@/features/organization/lib/email-domain` — `extractDomain()`, `isPublicDomain()`, `suggestOrgName()`
