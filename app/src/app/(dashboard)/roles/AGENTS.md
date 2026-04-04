<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-04-04 -->

# roles

## Purpose
Organization group/role management page. Display all members and their current group memberships (Admin, Managers, Members). Admins can reassign member roles. Read-only view for non-admins.

## Key Files

| File | Description |
|------|-------------|
| `page.tsx` | Server Component — reads session and active org, fetches members and groups, resolves group memberships in parallel, computes highest role per member, renders role table with `RoleSelect` for admins or static badge for others |
| `role-select.tsx` | Client component — dropdown to reassign member role (Admin, Manager, Member); calls `updateMemberRole()` server action |
| `actions.ts` | Server Actions: `updateMemberRole(userId, newRole)` — verifies Admin role via `assertOrgRole()`, updates group memberships |

## Access Control

| Role | Change Roles | View Roles |
|------|---|---|
| Admin | Yes | Yes |
| Manager | No (read-only) | Yes |
| Member | No (read-only) | Yes |
| Public | Redirected to `/login` | N/A |

## For AI Agents

### Working In This Directory
- Page resolves group memberships in parallel: `Promise.all()` for initial group/member fetch, then `Promise.allSettled()` for group member lists
- Highest role computed per member: Admin > Manager > Member (first match returned)
- In single-org mode: `RoleSelect` dropdown shown for admins to reassign roles
- In multi-org mode (`__all__`): static role badges shown (no mutations allowed)
- Admin API failure is handled gracefully (empty member list shown)
- Cannot change own role (isSelf flag prevents self-demotion)

### Role Resolution Pattern
```typescript
async function getMembersWithGroups(orgId: string) {
  const [members, groups] = await Promise.all([
    listOrgMembers(orgId),
    getOrgGroups(orgId),
  ]);

  const groupMembers = new Map<string, Set<string>>();
  const groupResults = await Promise.allSettled(
    groups.map(async (group) => {
      const gMembers = await listGroupMembers(orgId, group.id);
      return { name: group.name, memberIds: new Set(gMembers.map(m => m.id)) };
    })
  );
  
  return members.map((member) => ({
    ...member,
    groups: groups.filter(g => groupMembers.get(g.name)?.has(member.id)),
  }));
}
```

### Highest Role Computation
```typescript
function getHighestRole(groups: string[]): OrgGroupName {
  if (groups.includes(ORG_GROUPS.ADMIN)) return ORG_GROUPS.ADMIN;
  if (groups.includes(ORG_GROUPS.MANAGERS)) return ORG_GROUPS.MANAGERS;
  return ORG_GROUPS.MEMBERS;
}
```

### Key Patterns
- Default groups seeded on org creation: Admin, Managers, Members
- Member can belong to multiple groups simultaneously (highest role shown)
- RoleSelect prevents self-role change via `isSelf` flag
- Role badges use color coding: red (Admin), blue (Manager), gray (Member)
- Dark/light theme aware color scheme

## Dependencies
- `@/features/auth/lib/auth` — `auth()` for session, role claim, email
- `@/features/organization/lib/active-org` — `getActiveOrgId()`, `getAllOrgIds()`
- `@/features/members/lib/members-admin` — `listOrgMembers()`, `getOrgGroups()`, `listGroupMembers()`
- `@/features/shared/constants/org-groups` — `ORG_GROUPS` enum
