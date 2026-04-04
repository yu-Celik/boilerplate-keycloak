<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-04-04 -->

# login

## Purpose
Login page that redirects users to Keycloak for OIDC authentication or handles error states from failed authentication attempts.

## Key Files

| File | Description |
|------|-------------|
| `page.tsx` | Server Component — checks session state; if already authenticated with valid org redirects to `/`, if authenticated without org redirects to `/onboarding`, else renders `LoginRedirect` component |
| `login-redirect.tsx` | Client component (`"use client"`) — wraps `signIn("keycloak")` call for browser-side KC redirect |

## For AI Agents

### Working In This Directory
- Page checks for session errors via `session?.error` or `searchParams.error` and clears the session before attempting login
- Already-authenticated users with an organization are redirected to `/` (root)
- Already-authenticated users without an organization are redirected to `/onboarding`
- No sidebar layout — uses root `layout.tsx` only
- Route is in `PUBLIC_PATHS` in `src/proxy.ts`

### Authentication Flow
```
User visits /login → page.tsx checks session
  → Has valid org? → redirect /
  → Has no org? → redirect /onboarding
  → No session or error? → render LoginRedirect
LoginRedirect renders KC sign-in button → signIn("keycloak")
  → Redirects to KC login form
  → After auth → KC redirects with OIDC code
  → NextAuth exchanges code for tokens
  → Proxy redirects based on org claim
```

### Key Patterns
- Do NOT redirect to `/api/auth/logout` from this page — creates infinite loop
- Session errors are cleared with `signOut({ redirect: false })` before rendering login UI
- `LoginRedirect` is a separate client component to allow RSC page to handle server-side redirects first
