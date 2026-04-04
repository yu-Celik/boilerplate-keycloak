<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-04-04 -->

# settings

## Purpose
Organization settings page. Display org details (name, alias, ID), manage domain ownership and verification, configure auto-join, and access member management. Only visible when a specific organization is selected.

## Key Files

| File | Description |
|------|-------------|
| `page.tsx` | Server Component — reads active org, fetches org details and member count, renders org info card, `DomainManager`, `AutoJoinToggle`, and members link |
| `domain-manager.tsx` | Client component — displays current domain, verification status, and verification token with copy button |
| `auto-join-toggle.tsx` | Client component — toggle to enable/disable auto-join (Admin only, requires verified domain) |
| `actions.ts` | Server Actions: `toggleAutoJoin(enabled)` — calls `assertOrgRole()` to verify Admin role |

## Access Control

| Role | View Settings | Manage Domain | Toggle Auto-Join | View Member Count |
|------|---|---|---|---|
| Admin | Yes | Yes | Yes | Yes |
| Manager | Yes | Yes (read-only) | No | Yes |
| Member | Yes | Yes (read-only) | No | Yes |
| Public | Redirected to `/login` | N/A | N/A | N/A |

## For AI Agents

### Working In This Directory
- Page shows "Sélectionnez une organisation" message when in `__all__` mode (no orgId)
- Org details card displays: name, alias, ID (ID shown in monospace for clarity)
- Domain verification requires: domain ownership claim + DNS TXT record validation
- Auto-join only available when domain is verified (checkbox disabled otherwise)
- Member management link navigates to `/members` page
- Welcome banner shown when `searchParams.welcome === "true"` (e.g., after org creation)
- Graceful handling of Admin API failures

### Domain Manager Pattern
- Displays current domain (from `org.domains?.[0]`)
- Shows verification status badge
- Displays verification token for DNS record setup
- Copy button for token (client-side)
- Admin only: view/interact with domain info

### Auto-Join Logic
- Enabled when: domain verified AND admin toggles it on
- Disabled UI when: domain not verified OR user not admin
- Avoids spam: prevents auto-join to public domains (auto-join only set during org creation for verified domains)

### Key Patterns
- Wrapped in `(dashboard)` layout — sidebar always visible
- No sidebar visible in `__all__` mode since settings are org-scoped
- Using `Promise.allSettled()` for parallel org and member count fetch
- Domain info part of org attributes: `org.domains?.[0]` and `org.attributes?.domainVerifyToken?.[0]`
- Welcome query param set on successful org creation redirect

## Dependencies
- `@/features/auth/lib/auth` — `auth()` for session and role claim
- `@/features/organization/lib/active-org` — `getActiveOrgId()`
- `@/features/organization/lib/organization-admin` — `getOrganization()`, `isAutoJoinEnabled()`, `hasVerifiedDomain()`
- `@/features/members/lib/members-admin` — `listOrgMembers()` for member count
