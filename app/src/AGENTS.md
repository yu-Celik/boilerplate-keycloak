<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-04-03 -->

# src

## Purpose
Application source code organized by Next.js App Router conventions. Contains all pages, layouts, API routes, shared components, server-side libraries, and TypeScript type definitions.

## Key Files

| File | Description |
|------|-------------|
| `proxy.ts` | Next.js 16+ route proxy / middleware (renamed from `middleware.ts` in Next.js 16). Enforces authentication, handles `RefreshTokenError` session expiry, and redirects unauthenticated or zero-org users to `/onboarding`. |

## Subdirectories

| Directory | Purpose |
|-----------|---------|
| `app/` | Next.js App Router — pages, layouts, API routes, error boundaries (see `app/AGENTS.md`) |
| `components/` | Shared React components — AppSidebar, TeamSwitcher, NavUser, NavMain, PendingInvitationsBanner, SubmitButton, and shadcn/ui primitives (see `components/AGENTS.md`) |
| `lib/` | Server-side shared libraries — auth config, Keycloak Admin API client, active-org resolver, email domain classifier, scope filter (see `lib/AGENTS.md`) |
| `types/` | TypeScript type definitions and NextAuth module augmentations |
| `hooks/` | Custom React hooks (e.g., `use-mobile.tsx`) |
| `public/` | Static assets |

## For AI Agents

### Working In This Directory
- `@/` import alias resolves to this `src/` directory
- **Server-only rule**: files in `lib/` must not import browser APIs. Do not add `"use client"` to any `lib/` file.
- Client components require `"use client"` as the first line
- Server Actions require `"use server"` as the first line (either file-level or inline at the top of the function)
- `proxy.ts` is the Next.js 16+ convention — do not create or rename to `middleware.ts`

### proxy.ts Auth Flow
```
Request arrives
  → is public path (/login, /logout, /onboarding, /api/auth, /_next)? → pass through
  → no session? → redirect to /login
  → session.error === "RefreshTokenError"? → redirect to /api/auth/signout (clear session)
  → session.organization is null or empty? → redirect to /onboarding
  → pass through to requested route
```

### Common Patterns
- Server Components fetch data directly (no useEffect/fetch in RSC)
- `Promise.allSettled()` for parallel KC Admin API calls to avoid one failure blocking the whole page
- `try/catch` around KC Admin API calls — API may be temporarily unavailable; fail gracefully
- Cookie `active-org` stores the currently selected organization alias (`__all__` for cross-org view)
