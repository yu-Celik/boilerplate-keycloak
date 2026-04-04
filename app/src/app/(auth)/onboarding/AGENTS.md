<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-04-04 -->

# onboarding

## Purpose
Post-registration organization creation and invitation acceptance wizard. Guides new users through three flows: accepting pending invitations, joining existing org (if auto-join enabled), or creating a new organization.

## Key Files

| File | Description |
|------|-------------|
| `page.tsx` | Server Component — reads session and onboarding state, renders conditional UI for pending invitations, existing org notice, or org creation form |
| `actions.ts` | Server Actions: `getOnboardingState()` (fetch invitations, check existing org, detect public domain), `createOrganizationAndRefresh()` (KC org creation with rollback), `acceptInvitationFromOnboarding()` (accept and re-auth), `joinOrganization()` (join existing org) |
| `error.tsx` | Error boundary for onboarding page |

## For AI Agents

### Working In This Directory
- No sidebar layout — uses root `layout.tsx` with centered card UI
- Route is in `PUBLIC_PATHS` in `src/proxy.ts` — must remain publicly accessible to unauthenticated users
- Org creation validates that org name is not taken (`org_exists` error)
- Org alias is auto-generated: lowercase, non-alphanumeric replaced with `-`, leading/trailing dashes stripped
- Domain ownership: first org on domain claims it; subsequent orgs for same domain have no domain association

### Onboarding State Machine
```
getOnboardingState() returns:
  - pendingInvitations: invitations with orgId, orgName, role
  - existingOrg: org with same email domain (if auto-join enabled)
  - alreadyMember: true if user is already member of multiple orgs
  - autoJoinAvailable: true if domain has auto-join enabled
  - isPublic: true if email is public domain (gmail, outlook, etc.)
  - email: user email from session
```

### Org Creation Flow
```
createOrganizationAndRefresh(orgName) →
  1. Create KC organization via Admin API
  2. Add creator as member → rollback org if fails
  3. Seed default groups: Admin, Managers, Members
  4. Add creator to Admin + Members groups
  5. signIn("keycloak") to re-auth with organization scope
  → User receives JWT with organization claim
  → Proxy redirects to /members
```

### Invitation Acceptance Flow
```
acceptInvitationFromOnboarding(orgId, invitationId) →
  1. Validate invitation belongs to this user (email match + PENDING status)
  2. addOrgMember() — ignore 409 Conflict (already member)
  3. deleteOrgInvitation() — cleanup
  4. signIn("keycloak") — re-auth with new org in JWT
  → User receives JWT with organization claim
  → Proxy redirects to /members
```

### Key Patterns
- `suggestOrgName(email)` uses `free-email-domains` to detect public domains — returns `null` for gmail, outlook, etc.
- Pending invitations are domain-scoped (fast lookup, not full realm scan)
- Existing org check also domain-scoped
- Form submission triggers server action; error query param shows `org_exists` alert
- User can have zero, one, or multiple orgs; `alreadyMember` flag indicates multi-org scenario

## Dependencies
- `@/features/auth/lib/auth` — `auth()`, `signIn()`
- `@/features/organization/lib/organization-admin` — org CRUD, member ops, group seeding
- `@/features/organization/lib/email-domain` — `suggestOrgName()`, domain utilities
- `@/features/invitations/lib/invitations-admin` — invitation operations
