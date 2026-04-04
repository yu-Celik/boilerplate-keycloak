<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-04-04 -->

# features/invitations

## Purpose
Team invitations — send, revoke, and accept invitations. Pending invitations banner shown on dashboard. File-based role store (temporary; needs database in production). Tracks invitation role assignment for newly invited members.

## Key Files

| File | Description |
|------|-------------|
| `lib/invitations-admin.ts` | Invitation management: `listOrgInvitations()`, `sendOrgInvitation()`, `deleteOrgInvitation()`. Domain-scoped pending invitations: `getPendingInvitationsForUser(email, userOrgAliases)` returns pending invites across user's domains. |
| `lib/role-store.ts` | File-based temporary store for invitation roles. Maps invitation ID → assigned role (`"admin"`, `"manager"`, `"member"`). **Production warning**: replace with database. Exports `getInvitationRole(invitationId)`, `setInvitationRole(invitationId, role)`. |
| `types.ts` | OrgInvitation interface: `id`, `email`, `status` ("PENDING" | "EXPIRED"), `organizationId`, `sentDate`, `expiresAt`, `inviteLink`. |
| `components/pending-invitations-banner.tsx` | Client component — green banner above page content for each pending org invitation. Form submits `acceptInvitation` server action. Returns `null` when empty. |
| `components/revoke-form.tsx` | Client component — form to revoke an invitation, submits `revokeInvitation` server action. |

## For AI Agents

### Working In This Directory
- `invitations-admin.ts` uses shared `adminFetch` from `@/features/organization/lib/keycloak-client.ts`
- `sendOrgInvitation()` uses `application/x-www-form-urlencoded` body (KC requirement for this endpoint)
- `getPendingInvitationsForUser()` is domain-scoped, not a full realm scan, to limit Admin API calls

### File-Based Role Store
```typescript
// During invitation send
await sendOrgInvitation(orgId, email);
await setInvitationRole(invitationId, "manager");

// During acceptance
const role = await getInvitationRole(invitationId);
// ... add user to org with role group
```

### Pending Invitations Flow
1. User has pending invitations across multiple orgs
2. `getPendingInvitationsForUser(email, userOrgAliases)` returns pending invites for each org
3. Dashboard layout renders `PendingInvitationsBanner` component with the list
4. User accepts invitation via form → `acceptInvitation` server action
5. Action adds user to org + role group, then re-authenticates to refresh org claim

### Important Notes
- Invitations tied to email address, not Keycloak user ID (allows inviting non-registered users)
- Role assignment is optional — if not set, invited user joins with default role
- In production, migrate file-based store to database with proper TTL/cleanup
