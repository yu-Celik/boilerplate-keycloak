<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-04-04 -->

# features/admin

## Purpose
Platform administration feature for super-admin operations. List all organizations with member statistics, suspend/reactivate organizations. Restricted to platform-admin realm role.

## Key Files

| File | Description |
|------|-------------|
| `lib/platform-admin.ts` | Admin operations: `getAllOrganizationsWithStats()` returns list of orgs with member counts, `setOrganizationEnabled(orgId, enabled)` to suspend/reactivate. |

## For AI Agents

### Working In This Directory
- All operations require `platform-admin` realm role (checked in app routes that import these functions)
- Uses shared `adminFetch` from `@/features/organization/lib/keycloak-client.ts`
- Member counts are fetched in parallel via `Promise.all()` for performance

### Super-Admin Capabilities
- View all organizations in realm with member statistics
- Suspend organizations (set `enabled: false`) — suspends all members
- Reactivate suspended organizations
- No tenant scoping — sees cross-org data

### Implementation Pattern
```typescript
// In app route (must check platform-admin role first):
const result = await getAllOrganizationsWithStats();
// Returns: Array<Organization & { memberCount: number }>
```
