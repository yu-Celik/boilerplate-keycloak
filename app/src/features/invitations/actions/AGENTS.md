<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-04-04 -->

# features/invitations/actions

## Purpose
Server actions for invitation workflows — accepting pending invitations and triggering session refresh.

## Key Files

| File | Description |
|------|-------------|
| `accept-invitation.ts` | Server action: `acceptInvitation(invitationId)`. Adds user to organization and assigned role group via `addMemberToGroup()`. Re-authenticates user via `unstable_update()` to refresh session with new org claim. Returns error message on failure. |

## For AI Agents

### Working In This Directory
- All server actions use `"use server"` directive
- Access user session via `auth()` from `@/features/auth/lib/auth.ts`
- Call `assertOrgRole()` for permission checks if needed
- Throws errors that are caught by client components and displayed as toasts

### Acceptance Flow
```typescript
// 1. Get invitation details (invitationId passed from client)
// 2. Retrieve role assigned to invitation via getInvitationRole()
// 3. Add user to org with role group (e.g., /Admin, /Managers, /Members)
// 4. Call unstable_update() to refresh session JWT
// 5. Session now includes new org in organization claim
```

### Error Handling
- Invalid invitation ID → error message returned to client
- User already in org → handled gracefully (idempotent)
- Role not found → defaults to /Members group
- Session refresh failure → caught and logged; user redirected to re-auth

### KC Admin API Usage
- Uses `addMemberToGroup()` from `@/features/members/lib/members-admin.ts`
- Requires service account token (auto-handled via `adminFetch`)
- No explicit permission check needed — KC group membership is the auth mechanism
