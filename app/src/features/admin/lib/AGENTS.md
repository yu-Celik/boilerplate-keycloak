<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-04-04 -->

# features/admin/lib

## Purpose
Platform administration library — super-admin operations for managing all organizations across the realm.

## Key Files

| File | Description |
|------|-------------|
| `platform-admin.ts` | Super-admin operations: `getAllOrganizationsWithStats()` fetches all orgs from KC and parallelizes member count queries. `setOrganizationEnabled(orgId, enabled)` suspends/reactivates orgs via PATCH. Uses shared `adminFetch` from `@/features/shared/lib/keycloak-client.ts`. |

## For AI Agents

### Working In This Directory
- All functions use shared `adminFetch` with service account credentials
- Requires `platform-admin` realm role (enforced in app routes, not in lib)
- Performs cross-tenant operations — no org scoping
- Member counts fetched in parallel via `Promise.all()` for performance

### Super-Admin Operations
```typescript
// Fetch all orgs with member statistics
const orgs = await getAllOrganizationsWithStats();
// Returns: Array<Organization & { memberCount: number }>

// Suspend/reactivate organization (affects all members)
await setOrganizationEnabled(orgId, false);  // Suspend
await setOrganizationEnabled(orgId, true);   // Reactivate
```

### KC Admin API Endpoints Used
- `GET /admin/realms/{realm}/organizations` — list all organizations
- `GET /admin/realms/{realm}/organizations/{orgId}/members` — list members per org
- `PATCH /admin/realms/{realm}/organizations/{orgId}` — update org enabled status

### Performance Notes
- `getAllOrganizationsWithStats()` makes N+1 API calls (1 to list orgs, N to count members)
- For realms with 100+ orgs, consider pagination or caching
- Member counts are point-in-time — not cached; call only when fresh data is needed
