<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-04-01 | Updated: 2026-04-01 -->

# app

## Purpose
Next.js App Router directory containing all pages, layouts, API routes, and error boundaries. Organized into route groups: `(auth)` for login/logout/onboarding, `(dashboard)` for protected org-scoped pages. Middleware moved to `src/proxy.ts` (Next.js 16 convention).

## Key Files

| File | Description |
|------|-------------|
| `layout.tsx` | Root layout — HTML shell, global styles, fonts |
| `page.tsx` | Root page — redirects to `/dashboard` |
| `globals.css` | Tailwind CSS v4 (`@import "tailwindcss"`, `@theme`, `@plugin`, `@variant`) + custom sidebar theme tokens |
| `error.tsx` | Dashboard error boundary — displays error UI for failed operations |
| `global-error.tsx` | Root-level error boundary — catches layout.tsx errors |
| `(dashboard)/loading.tsx` | Loading skeleton for dashboard pages |
| `(dashboard)/actions.ts` | Server actions: `switchOrg(alias)` sets `active-org` cookie with httpOnly flag |

## Subdirectories

| Directory | Purpose |
|-----------|---------|
| `(auth)/` | Auth-related pages: login, logout, onboarding (no dashboard layout) |
| `(dashboard)/` | Protected pages: dashboard, members, invitations, roles, settings, contacts, tasks (with sidebar layout) |
| `api/` | API routes: NextAuth handlers, backchannel logout |

## For AI Agents

### Working In This Directory
- Middleware is in `../proxy.ts` (Next.js 16 convention, moved from `middleware.ts`)
- Route groups `(auth)` and `(dashboard)` have separate layouts
- `(dashboard)/layout.tsx` includes the TeamSwitcher sidebar component
- `(dashboard)/actions.ts` exports `switchOrg(alias)` — server action that sets httpOnly cookie
- Error boundaries: `error.tsx` for route-level, `global-error.tsx` for layout errors

### Middleware Logic (src/proxy.ts)
```
Request → is public path? → pass through
        → not authenticated? → NextAuth handles redirect to /login
        → session.error === "RefreshTokenError"? → redirect to /login
        → has organization claim (not null, not empty)? → pass through
        → no organization → redirect to /onboarding
```

### Security
- httpOnly cookies prevent XSS access to session tokens
- Server actions validate cookies and user permissions server-side
- NextAuth handles JWT verification with `jose` library

<!-- MANUAL: -->
