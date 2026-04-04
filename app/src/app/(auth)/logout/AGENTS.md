<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-04-04 -->

# logout

## Purpose
Post-logout landing page displayed after Keycloak OIDC logout completes. Provides user feedback and initiates NextAuth session cleanup.

## Key Files

| File | Description |
|------|-------------|
| `page.tsx` | Client component (`"use client"`) — shows "Déconnexion..." loading text and calls `signOut({ callbackUrl: "/login" })` via `useEffect` |

## For AI Agents

### Working In This Directory
- This is a client component because it must call the NextAuth `signOut` hook
- The page is displayed after KC OIDC logout endpoint redirect completes
- Page shows minimal UI (loading state) while NextAuth session is destroyed
- After signOut completes, user is redirected to `/login`
- No sidebar layout — uses root `layout.tsx` only
- Route is in `PUBLIC_PATHS` in `src/proxy.ts`

### Logout Flow
```
User initiates logout → nav-user.tsx calls /api/auth/logout
  → Returns JSON with kcLogoutUrl
  → Client redirects to kcLogoutUrl (KC OIDC logout endpoint)
  → KC clears its session and redirects to /logout
  → logout/page.tsx renders with useEffect
  → signOut({ callbackUrl: "/login" }) destroys NextAuth cookie
  → Redirects to /login
```

### Key Patterns
- Client component allows `useEffect` hook for async session cleanup
- `callbackUrl: "/login"` ensures redirect after session destruction
- No data passing required — logout is stateless
