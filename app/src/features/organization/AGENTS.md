<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-04-04 -->

# features/organization

## Purpose
Organization management — multi-tenancy core. CRUD organizations via Keycloak Admin API, active org resolution from cookie, email domain utilities (public vs professional), team switcher component. Contains the shared `keycloak-client.ts` that provides service account authentication and admin API utilities for all features.

## Key Files

| File | Description |
|------|-------------|
| `lib/keycloak-client.ts` | Shared Keycloak service account client. Caches service account token (30s expiry buffer). Exports `getServiceAccountToken()` and `adminFetch(path, init)` helper (auto-injects Bearer token). Used by all features. |
| `lib/organization-admin.ts` | Organization CRUD functions: `listOrganizations()`, `getOrganization(orgId)`, `updateOrganization()`, `getOrgByAlias()`, `createOrganization()`, `deleteOrganization()`. Helpers: `isAutoJoinEnabled()`, `hasVerifiedDomain()`. |
| `lib/active-org.ts` | Active org resolution from `active-org` cookie + session. `getActiveOrgId()` returns KC org ID or `null` for `__all__` mode. `getAllOrgIds()` returns all org IDs for cross-org aggregation. |
| `lib/email-domain.ts` | Public vs professional email domain detection using `free-email-domains` package. `extractDomain(email)`, `isPublicDomain(domain)`, `suggestOrgName(email)`. |
| `types.ts` | Organization interface: `id`, `name`, `alias`, `enabled`, `domains[]`, `attributes`. `OrgRole = "admin" | "manager" | "member"`. |
| `components/team-switcher.tsx` | Client component — dropdown showing "Tous" (`__all__` cross-org), individual org list by alias, "Créer une organisation" link. Uses `useTransition()` for optimistic update + `router.refresh()`. |

## For AI Agents

### Working In This Directory
- `lib/keycloak-client.ts` is imported by other features (invitations, members, admin) — it is the single source of Admin API authentication
- `keycloak-admin.ts` is an alias for `organization-admin.ts` in the old codebase; use `organization-admin.ts` for new work
- Token caching: check `Date.now() < expiresAt - 30s` before each call to avoid expired tokens

### Team Switcher Pattern
```typescript
function handleSwitch(alias: string) {
  setCurrentOrg(alias)                  // 1. Optimistic UI update (instant)
  startTransition(async () => {
    await switchOrg(alias)              // 2. Server Action sets httpOnly cookie
    router.refresh()                    // 3. RSC re-render with new org context
  })
}
```
- `isPending` state shows spinner on button
- `useTransition()` keeps UI responsive during async server round-trip

### Active Org Resolution Logic
- Falls back to `orgAliases[0]` if cookie is missing or invalid (prevents cookie-stuffing)
- Returns `null` (not `undefined`) for `__all__` mode — dashboard pages check `if (orgId)` to branch behavior
- Cross-org queries use `getAllOrgIds()` to get all org IDs when active org is `__all__`

### Email Domain Classification
- Public domains (Gmail, Yahoo, Hotmail, etc.) detected via `free-email-domains` package
- `suggestOrgName(email)` returns capitalized domain prefix or `null` for public domains
- Used during onboarding to auto-suggest org name from email domain

### Admin API Search Pattern
- `getOrgByAlias(alias)` uses `?search=<alias>` — KC search covers both org name and alias
- `searchOrgByDomain(domain)` uses `?search=<domain>&exact=true` then filters by `org.domains[].name`
