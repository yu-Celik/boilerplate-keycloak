<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-04-03 -->

# (dashboard)

## Purpose
Protected route group containing all authenticated dashboard pages. Every page in this group is rendered inside the `layout.tsx` sidebar shell (AppSidebar + SidebarInset). Multi-tenant data isolation is enforced by reading the `active-org` cookie and resolving it to a Keycloak organization ID via the Admin API.

## Key Files

| File | Description |
|------|-------------|
| `layout.tsx` | Dashboard shell — Server Component. Reads session + `active-org` cookie, checks for pending invitations (domain-scoped), renders `AppSidebar` + `PendingInvitationsBanner` + page content area |
| `actions.ts` | Server Actions: `switchOrg(alias)` sets httpOnly `active-org` cookie and calls `revalidatePath("/")` |
| `accept-invitation-action.ts` | Server Action: `acceptInvitation()` — validates invitation, adds user to org, deletes invitation, forces re-auth |
| `members/page.tsx` | Lists org members. In `__all__` mode: fetches all org IDs, runs `listOrgMembers()` in parallel with `Promise.allSettled()`, deduplicates by user ID |
| `invitations/page.tsx` | Lists pending invitations for the active org with revoke button |
| `invitations/actions.ts` | Server Actions: `inviteUser()` and `revokeInvitation()` — both call `assertOrgRole()` to verify Admin or Manager role before proceeding |
| `roles/page.tsx` | Lists org groups (Admin, Managers, Members) and their members |
| `settings/page.tsx` | Shows org details (name, alias, ID, domains). Reads active org via `getActiveOrgId()`. Shows "Sélectionnez une organisation" when in `__all__` mode |
| `contacts/page.tsx` | Demo contacts module with multi-tenant scope filtering |
| `tasks/page.tsx` | Demo tasks module with role-based visibility (admins/managers see all, members see only their own) |

## Subdirectories

| Directory | Purpose |
|-----------|---------|
| `members/` | Organization member list page |
| `invitations/` | Invitation management — list, send, revoke |
| `roles/` | Organization group/role management |
| `settings/` | Organization settings — name, alias, domains, danger zone |
| `contacts/` | Demo contacts module (in-memory data from `lib/demo/`) |
| `tasks/` | Demo tasks module (in-memory data from `lib/demo/`) |

## For AI Agents

### Working In This Directory
- All pages are Server Components that call `getActiveOrgId()` or `getAllOrgIds()` from `@/lib/active-org`
- `getActiveOrgId()` returns `null` when `active-org` cookie is `__all__` — pages must handle the null case gracefully
- Server Actions in `actions.ts` and `invitations/actions.ts` use `assertOrgRole()` for authorization — never skip this check
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
- `@/lib/active-org` — `getActiveOrgId()`, `getAllOrgIds()`
- `@/lib/keycloak-admin` — member, invitation, group, org operations
- `@/lib/scope-filter` — `buildScopeFilter()`, `filterRecords()` for demo modules
- `@/components/app-sidebar` — sidebar shell
- `@/components/pending-invitations-banner` — top banner for pending org invitations
