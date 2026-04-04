<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-04-04 -->

# members

## Purpose
Organization member list page. Displays all members of the active organization or aggregates members across all user orgs in `__all__` mode. Members view only, no mutation actions.

## Key Files

| File | Description |
|------|-------------|
| `page.tsx` | Server Component — reads `active-org` cookie, fetches org members via Admin API, deduplicates in `__all__` mode, renders responsive member table with name, email, status badge |

## Access Control

| Role | Access |
|------|--------|
| Admin | Full access |
| Manager | Full access |
| Member | Full access (read-only) |
| Public | Redirected to `/login` |

## For AI Agents

### Working In This Directory
- Page calls `getActiveOrgId()` to determine single-org or multi-org mode
- In single-org mode: fetches members for that org
- In `__all__` mode (`active-org` cookie = `__all__`): aggregates members from all user orgs with `Promise.allSettled()`
- Deduplication by user ID using Set in `__all__` mode prevents duplicate entries
- Admin API failure is handled gracefully (empty member list shown)
- Table shows: member name, email, enabled/disabled status badge

### Data Pattern
```typescript
// Single org mode
const orgId = await getActiveOrgId(); // returns KC org ID
const members = await listOrgMembers(orgId);

// "Tous" (all orgs) mode
const orgIds = await getAllOrgIds();
const results = await Promise.allSettled(orgIds.map(id => listOrgMembers(id)));
// Merge and deduplicate by user ID
```

### Key Patterns
- Wrapped in `(dashboard)` layout — sidebar and org switcher always visible
- No form actions or mutations — purely read-only display
- Graceful error handling for Admin API unavailability
- Status badges use dark/light color scheme (green for active, red for disabled)
