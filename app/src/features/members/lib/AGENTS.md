<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-04-04 -->

# features/members/lib

## Purpose
Member management library — list members, manage organization groups, and role-based authorization enforcement.

## Key Files

| File | Description |
|------|-------------|
| `members-admin.ts` | Member CRUD operations: `listOrgMembers(orgId)`, `addMemberToGroup(userId, orgId, groupId)`, `removeMemberFromGroup(userId, orgId, groupId)`, `getUserByEmail(email)`. Authorization function: `assertOrgRole(orgId, userEmail, requiredGroups)` throws error if user lacks required role. All functions use shared `adminFetch` from `@/features/shared/lib/keycloak-client.ts`. |

## For AI Agents

### Working In This Directory
- All operations use KC Admin API via service account authentication
- Group structure: `/Admin`, `/Managers`, `/Members` (and custom sub-groups)
- Member list returns Keycloak User objects with id, username, email, firstName, lastName, enabled
- `assertOrgRole()` must be called in Server Actions before any mutation

### Role-Based Authorization Pattern
```typescript
// In Server Action: verify user has required role before mutation
await assertOrgRole(orgId, session.user.email, ["admin"]);

// Or check for multiple roles (OR logic):
await assertOrgRole(orgId, session.user.email, ["admin", "manager"]);

// Throws: "Accès refusé : rôle insuffisant" if user lacks role
```

### Member List Pattern
```typescript
// Fetch all members of organization
const members = await listOrgMembers(orgId);
// Returns: Array<{
//   id: string,
//   username: string,
//   email: string,
//   firstName: string,
//   lastName: string,
//   enabled: boolean
// }>
```

### Group Management Pattern
```typescript
// Add user to organization group
await addMemberToGroup(userId, orgId, groupId);

// Remove user from group
await removeMemberFromGroup(userId, orgId, groupId);

// Groups are identified by KC UUID; use org-groups constants
import { ORG_GROUPS } from '@/features/shared/constants/org-groups';
// ORG_GROUPS.ADMIN, ORG_GROUPS.MANAGERS, ORG_GROUPS.MEMBERS
```

### KC Admin API Endpoints Used
- `GET /admin/realms/{realm}/organizations/{orgId}/members` — list members
- `PUT /admin/realms/{realm}/users/{userId}/groups/{groupId}` — add to group
- `DELETE /admin/realms/{realm}/users/{userId}/groups/{groupId}` — remove from group
- `GET /admin/realms/{realm}/users?email={email}` — find user by email
