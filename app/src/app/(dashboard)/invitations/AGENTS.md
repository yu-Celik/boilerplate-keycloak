<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-04-04 -->

# invitations

## Purpose
Organization invitation management page. List pending invitations, send new invitations (with role selection), and revoke pending invitations. Role-based access: only Admin/Managers can invite and revoke.

## Key Files

| File | Description |
|------|-------------|
| `page.tsx` | Server Component — reads session and active org, checks user role, fetches pending invitations, enriches with stored roles, renders invite form (Admin/Manager only) and invitations table with revoke buttons |
| `actions.ts` | Server Actions: `inviteUser(email, role)` and `revokeInvitation(invitationId)` — both call `assertOrgRole()` to verify Admin/Manager role before proceeding |

## Access Control

| Role | Send Invitations | Revoke Invitations | View Invitations |
|------|---|---|---|
| Admin | Yes (all roles) | Yes | Yes |
| Manager | Yes (Member, Manager only) | Yes | Yes |
| Member | No | No | Yes (read-only) |
| Public | Redirected to `/login` | N/A | N/A |

## For AI Agents

### Working In This Directory
- Invite form only shown when `orgId` is set (single-org mode) AND user is Admin or Manager
- Role field dropdown: Manager cannot invite as Admin (filtered conditionally)
- Invitation role is stored in a separate role store file (not KC attributes) for fast lookup
- Revoke actions use `RevokeForm` client component to wrap server action
- Admin API failure is handled gracefully (empty invitation list shown)
- In `__all__` mode: aggregates invitations from all orgs, no invite form shown

### Invitation Enrichment
```typescript
// Fetch raw invitations from KC
const rawInvitations = await listOrgInvitations(orgId);

// Enrich with stored roles (single file read, faster than KC attributes)
const roleMap = await getInvitationRolesBatch(rawInvitations.map(...));
const invitations = rawInvitations.map(inv => ({
  ...inv,
  role: roleMap.get(key) ?? ORG_GROUPS.MEMBERS
}));
```

### Server Action Authorization
```typescript
// All mutations use assertOrgRole() to verify Admin or Manager
await assertOrgRole(orgId, session.user.email, ["Admin", "Managers"]);
// Throws "Accès refusé : rôle insuffisant" if check fails
```

### Key Patterns
- Invitation role separate from group membership (set on invite, stored in file)
- Role dropdown filters Admin option for Managers (cannot invite as Admin)
- Revoke button disabled in multi-org mode (`__all__` shows invitations read-only)
- Email field required, role defaults to `MEMBERS`
- Invitations display: email, role, status (PENDING or EXPIRED), sent date, revoke action

## Dependencies
- `@/features/auth/lib/auth` — `auth()` for session, role claim
- `@/features/organization/lib/active-org` — `getActiveOrgId()`, `getAllOrgIds()`
- `@/features/invitations/lib/invitations-admin` — `listOrgInvitations()`, `inviteUser()`, `revokeInvitation()`
- `@/features/invitations/lib/role-store` — `getInvitationRolesBatch()` for role enrichment
