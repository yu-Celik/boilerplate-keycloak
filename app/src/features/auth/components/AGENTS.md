<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-04-04 -->

# features/auth/components

## Purpose
Authentication UI components — login redirect and logout button for use across the application.

## Key Files

| File | Description |
|------|-------------|
| `login-redirect.tsx` | Server Component that conditionally redirects: authenticated users → `/members`, unauthenticated users → `/login`. Reads session from `auth()` function. |
| `logout-button.tsx` | Client Component button that calls `signOut()` server action. Used in navigation components and auth dialogs. Handles error states gracefully. |

## For AI Agents

### Working In This Directory
- `login-redirect.tsx` is a Server Component — no client-side state or hooks
- `logout-button.tsx` has `"use client"` directive — can use useState, useTransition, etc.
- Both components import from `@/features/auth/lib/auth.ts`

### Login Redirect Pattern
```typescript
// Returns JSX that either redirects or renders null
const session = await auth();
if (session) redirect('/members');
if (!session) redirect('/login');
```

### Logout Button Pattern
```typescript
// Client component with optimistic UI feedback
const [isPending, startTransition] = useTransition();

const handleLogout = () => {
  startTransition(async () => {
    await signOut({ redirectTo: '/login' });
  });
};
```

### Placement Guidelines
- Use `login-redirect.tsx` at app layout or page boundary to enforce auth flow
- Use `logout-button.tsx` in header/navbar components for user-initiated logout
- Both handle auth state changes gracefully without user seeing multiple redirects
