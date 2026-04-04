<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-04-04 -->

# (dashboard)

## Purpose
Protected route group containing all authenticated dashboard pages. Every page in this group is rendered inside the `layout.tsx` sidebar shell (AppSidebar + SidebarInset). Multi-tenant data isolation is enforced by reading the `active-org` cookie and resolving it to a Keycloak organization ID via the Admin API.

## Key Files

| File | Description |
|------|-------------|
| `layout.tsx` | Dashboard shell — Server Component. Reads session + `active-org` cookie, checks for pending invitations (domain-scoped), renders `AppSidebar` + `PendingInvitationsBanner` + page content area |
| `actions.ts` | Server Actions: `switchOrg(alias)` sets httpOnly `active-org` cookie and calls `revalidatePath("/")` |
| `page.tsx` | Dashboard home page — shows org details (name, ID), member count, and JWT org claims (dev only) |

## Subdirectories

| Directory | Purpose |
|-----------|---------|
| `members/` | Organization member list (see `members/AGENTS.md`) |
| `invitations/` | Invitation management — list, send, revoke (see `invitations/AGENTS.md`) |
| `roles/` | Organization group/role management (see `roles/AGENTS.md`) |
| `settings/` | Organization settings — name, alias, domains, auto-join (see `settings/AGENTS.md`) |
| `admin/` | Platform admin dashboard — org stats, suspend/reactivate (see `admin/AGENTS.md`) |

## For AI Agents

### Working In This Directory
- All pages are Server Components that call `getActiveOrgId()` or `getAllOrgIds()` from `@/lib/active-org`
- `getActiveOrgId()` returns `null` when `active-org` cookie is `__all__` — pages must handle the null case gracefully
- Server Actions in subdirectories use `assertOrgRole()` for authorization — never skip this check
- `layout.tsx` reads the `active-org` cookie directly (same logic as `active-org.ts`) because layout must resolve it without an extra server round-trip

### Active-Org Resolution Logic
```
active-org cookie value:
  "__all__"               → getActiveOrgId() returns null (cross-org view)
  valid alias in session  → resolves to KC org ID via getOrgByAlias()
  missing / invalid       → falls back to first org alias in session
  no orgs in session      → returns null
```

### Multi-Tenant Data Pattern
```typescript
// Standard pattern for dashboard pages:
const orgId = await getActiveOrgId();

if (orgId) {
  // Single org view
  data = await listSomething(orgId);
} else {
  // "Tous" (all orgs) view — aggregate in parallel
  const orgIds = await getAllOrgIds();
  const results = await Promise.allSettled(orgIds.map(id => listSomething(id)));
  // merge and deduplicate results
}
```

### Authorization Pattern (Server Actions)
```typescript
// Always verify role before mutations:
await assertOrgRole(orgId, session.user.email, ["Admin", "Managers"]);
// Throws "Accès refusé : rôle insuffisant" if user lacks required group membership
```

### Org Switcher
- `switchOrg(alias)` server action sets `active-org` cookie with `httpOnly: true, path: "/", sameSite: "lax"`
- `TeamSwitcher` client component calls `switchOrg` then `router.refresh()` for instant UI update
- Special value `__all__` shows data across all user orgs (aggregated, deduplicated)

## Dependencies
- `@/features/auth/lib/auth` — `auth()` for session, roles, org claims
- `@/features/organization/lib/active-org` — `getActiveOrgId()`, `getAllOrgIds()`
- `@/features/organization/lib/organization-admin` — org operations
- `@/components/app-sidebar` — sidebar shell component
- `@/components/pending-invitations-banner` — top banner for pending org invitations
