<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-04-04 -->

# features/members

## Purpose
Member management — list members, manage organization groups (Admin/Managers/Members), role-based authorization. Provides `assertOrgRole()` for server-side RBAC enforcement.

## Subdirectories

| Directory | Purpose |
|-----------|---------|
| `lib/` | Member management and role-based authorization |

## Key Files

| File | Description |
|------|-------------|
| `lib/members-admin.ts` | Member operations: `listOrgMembers(orgId)`, `addMemberToGroup()`, `removeMemberFromGroup()`, `getUserByEmail()`, `assertOrgRole(orgId, userEmail, requiredGroups)`. |
| `types.ts` | OrgMember interface: `id`, `username`, `email`, `firstName`, `lastName`, `enabled`. OrgGroup interface: `id`, `name`, `path`, `subGroups[]`. |

## For AI Agents

### Working In This Directory
- `members-admin.ts` uses shared `adminFetch` from `@/features/organization/lib/keycloak-client.ts`
- All member operations require the user to have org admin role

### Role-Based Authorization Pattern
```typescript
// In Server Action before mutating org data:
await assertOrgRole(orgId, session.user.email, ["admin"]);
// Or check for multiple roles:
await assertOrgRole(orgId, session.user.email, ["admin", "manager"]);
```
- Throws error `"Accès refusé : rôle insuffisant"` if user lacks required role
- Always call this in Server Actions that modify org members, settings, or data

### Group Structure
- `/Admin` — org admins (can create invitations, manage members, settings)
- `/Managers` — org managers (limited admin permissions)
- `/Members` — regular org members (can view own org data)
- Sub-groups are supported for future departmental scoping

### Member List Pattern
```typescript
const members = await listOrgMembers(orgId);
// Returns: OrgMember[] with id, username, email, firstName, lastName, enabled
```
