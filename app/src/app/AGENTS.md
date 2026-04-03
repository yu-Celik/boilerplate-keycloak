<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-04-03 -->

# app (App Router)

## Purpose
Next.js App Router directory containing all pages, layouts, API routes, and error boundaries. Organized into two route groups: `(auth)` for unauthenticated pages (login, logout, onboarding) and `(dashboard)` for protected org-scoped pages with the sidebar layout. Route protection is handled by `src/proxy.ts`.

## Key Files

| File | Description |
|------|-------------|
| `layout.tsx` | Root HTML shell — sets `lang="fr"`, dark mode class, Inter font via `next/font/google`, global CSS import |
| `page.tsx` | Root route `/` — Server Component that redirects authenticated users to `/members`, unauthenticated to `/login` |
| `globals.css` | Tailwind CSS v4 (CSS-first): `@import "tailwindcss"`, `@theme` for custom sidebar tokens, `@plugin`, `@variant` |
| `global-error.tsx` | Root-level error boundary — catches errors in `layout.tsx` itself |
| `(dashboard)/layout.tsx` | Dashboard shell — reads session + `active-org` cookie, renders `AppSidebar` + `PendingInvitationsBanner` + `SidebarInset` |
| `(dashboard)/actions.ts` | Server Actions: `switchOrg(alias)` sets httpOnly `active-org` cookie; `acceptInvitation()` adds user to org and re-auths |

## Subdirectories

| Directory | Purpose |
|-----------|---------|
| `(auth)/` | Auth route group — login redirect, onboarding wizard, logout page. No sidebar layout. (see `(auth)/AGENTS.md`) |
| `(dashboard)/` | Protected route group — members, invitations, roles, settings, contacts, tasks. Uses sidebar layout. (see `(dashboard)/AGENTS.md`) |
| `api/` | API routes — `[...nextauth]/route.ts` (NextAuth handlers), `auth/logout/route.ts` (KC OIDC logout with `id_token_hint`), `auth/backchannel-logout/route.ts` (KC server-initiated logout) |

## For AI Agents

### Working In This Directory
- Middleware lives in `src/proxy.ts` — do not create `middleware.ts` here (Next.js 16 renamed it)
- Route groups `(auth)` and `(dashboard)` share the root `layout.tsx` but each has its own nested layout
- `(dashboard)/layout.tsx` is a Server Component that passes org data and user info to client components
- `(dashboard)/actions.ts` uses `revalidatePath("/")` after cookie mutations to trigger RSC re-render

### Middleware Auth Flow (src/proxy.ts)
```
Request → public path? → pass through
        → no session? → redirect /login
        → RefreshTokenError? → redirect /api/auth/signout
        → no organization claim? → redirect /onboarding
        → pass through
```

### API Routes
- `api/auth/[...nextauth]/route.ts` — exports `{ GET, POST }` from `@/lib/auth` handlers
- `api/auth/logout/route.ts` — POST endpoint; reads `idToken` from server-side session (not serialized to client), builds KC OIDC `end_session_endpoint` URL with `id_token_hint` to skip KC confirmation page, returns JSON `{ kcLogoutUrl }`
- `api/auth/backchannel-logout/route.ts` — receives KC backchannel logout POST, looks up session in `sessionStore` Map, calls NextAuth `signOut`

### Security Notes
- `idToken` is attached to the session server-side only — not serialized to the client cookie
- httpOnly `active-org` cookie prevents client-side script access
- Server Actions validate org membership before any mutation (`assertOrgRole`)
- KC `id_token_hint` on logout skips the KC confirmation page for seamless UX
