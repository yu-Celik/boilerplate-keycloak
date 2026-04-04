<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-04-04 -->

# features/invitations/components

## Purpose
UI components for displaying and managing pending organization invitations across the application.

## Key Files

| File | Description |
|------|-------------|
| `pending-invitations-banner.tsx` | Server component that renders a green banner for each pending org invitation. Form submits `acceptInvitation` server action. Returns `null` when no pending invitations. Loads pending invites via `getPendingInvitationsForUser()`. |
| `pending-invitations-loader.tsx` | Async wrapper component that fetches pending invitations for current user (domain-scoped) and passes list to banner. Handles loading state gracefully. |
| `revoke-form.tsx` | Client component — form to revoke an invitation (admin action). Submits `revokeInvitation` server action. Shows confirmation dialog before revoke. |

## For AI Agents

### Working In This Directory
- `pending-invitations-banner.tsx` is a Server Component — fetches data directly
- `pending-invitations-loader.tsx` is an Async Server Component — wraps banner with data loading
- `revoke-form.tsx` has `"use client"` directive — client-side form state and transitions

### Pending Invitations Banner Pattern
```typescript
// Server Component that fetches data
export async function PendingInvitationsBanner(props: { invitations: OrgInvitation[] }) {
  if (!props.invitations.length) return null;
  
  return (
    <div className="banner">
      {props.invitations.map(inv => (
        <form action={acceptInvitation}>
          <input type="hidden" name="invitationId" value={inv.id} />
          <button type="submit">Accept</button>
        </form>
      ))}
    </div>
  );
}
```

### Revoke Form Pattern
```typescript
// Client component with confirmation
const handleRevoke = () => {
  if (confirm("Revoke invitation?")) {
    startTransition(async () => {
      await revokeInvitation(invitationId);
    });
  }
};
```

### Placement in App
- Dashboard layout renders `PendingInvitationsLoader` at top of page
- Banner shown above main content, dismissed after accept
- Revoke form appears in admin invitations management page

### Domain Scoping
- `getPendingInvitationsForUser()` filters invites by user's org domains
- Prevents showing unrelated org invites (multi-tenant isolation)
- Limits Admin API calls to relevant domains only
