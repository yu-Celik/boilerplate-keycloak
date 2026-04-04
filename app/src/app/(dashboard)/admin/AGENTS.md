<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-04-04 -->

# admin

## Purpose
Platform admin dashboard. Manage all organizations across the platform: view organization stats, member counts, billing plans, and suspend/reactivate orgs. Platform-admin role required (checked in layout).

## Key Files

| File | Description |
|------|-------------|
| `layout.tsx` | Server Component — checks `session.platformRole === "platform-admin"`, redirects to `/` if access denied |
| `page.tsx` | Server Component — fetches all organizations with stats (member count, plan, enabled status), renders stats cards (total orgs, total users, active orgs) and organization management table |
| `actions.ts` | Server Actions: `suspendOrg(orgId)` and `reactivateOrg(orgId)` — platform admin only |

## Access Control

| Role | View Admin | Suspend Org | Reactivate Org |
|------|---|---|---|
| Platform Admin | Yes | Yes | Yes |
| Org Admin | No (redirected to `/`) | No | No |
| Others | No (redirected to `/`) | No | No |

## For AI Agents

### Working In This Directory
- Layout acts as a guard: non-platform-admins are immediately redirected to `/`
- Page fetches all organizations in parallel via `getAllOrganizationsWithStats()`
- Stats cards show: total organizations, total users across all orgs, count of active (non-suspended) orgs
- Organization table displays: name, alias, member count, plan (from attributes), status badge (active/suspended), actions (suspend or reactivate)
- Plan read from `org.attributes?.plan?.[0]` (defaults to "free" if not set)
- Admin API failure is handled gracefully (empty org list shown)
- Suspend/Reactivate actions use server actions bound to org ID

### Organization Stats Pattern
```typescript
const orgs = await getAllOrganizationsWithStats();
const totalUsers = orgs.reduce((sum, o) => sum + o.memberCount, 0);
const activeOrgs = orgs.filter((o) => o.enabled !== false).length;
```

### Status Computation
```typescript
const enabled = org.enabled !== false;
const plan = org.attributes?.plan?.[0] ?? "free";
```

### Key Patterns
- Not wrapped in `(dashboard)` sidebar layout (has its own minimal layout in admin/)
- Suspend/Reactivate buttons use server actions with form submission
- Status badge green for active, red for suspended
- Button styling: destructive red for suspend, green for reactivate
- No org switcher or user dropdown — platform-wide view
- Graceful degradation if Admin API unavailable

## Dependencies
- `@/features/auth/lib/auth` — `auth()` for session and platform role claim
- `@/features/admin/lib/platform-admin` — `getAllOrganizationsWithStats()`, `suspendOrg()`, `reactivateOrg()`
