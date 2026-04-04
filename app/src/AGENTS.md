<!-- Parent: ../../AGENTS.md -->
<!-- Generated: 2026-04-04 -->

# src

## Purpose
Application source code organized by feature-based architecture. Next.js 16 App Router with TypeScript strict mode, Tailwind CSS v4 CSS-first styling, React 19 Server Components by default. Each feature is self-contained with its own lib, components, and types. Shared layout components and server-side utilities in dedicated directories.

## Key Files

| File | Description |
|------|-------------|
| `proxy.ts` | Next.js 16+ route proxy (renamed from `middleware.ts`). Enforces authentication, handles `RefreshTokenError` session expiry, redirects unauthenticated users to `/login` and zero-org users to `/onboarding`. |

## Subdirectories

| Directory | Purpose |
|-----------|---------|
| `app/` | Next.js App Router — pages, layouts, API routes, error boundaries (see `app/AGENTS.md`) |
| `features/` | Feature-based modules — auth, organization, invitations, members, admin, onboarding, settings. Each self-contained with lib, components, types (see `features/AGENTS.md`) |
| `components/` | Shared layout components — AppSidebar, NavMain, NavUser, ThemeToggle, SubmitButton, PendingInvitationsBanner. UI primitives in `ui/` subdir (see `components/AGENTS.md`) |
| `lib/` | Shared server-side utilities — auth config, Admin API client, active org resolver, email domain utils (see `lib/AGENTS.md`) |
| `types/` | TypeScript definitions — NextAuth augmentations, global type exports (see `types/AGENTS.md`) |
| `hooks/` | Custom React hooks — `useIsMobile()` for responsive mobile detection (see `hooks/AGENTS.md`) |
| `styles/` | Shared CSS and theme tokens — Tailwind v4 CSS-first, theme-tokens.css with light/dark mode variables (see `styles/AGENTS.md`) |
| `public/` | Static assets — empty (see `public/AGENTS.md`) |

## For AI Agents

### Working In This Directory
- `@/` import alias resolves to this `src/` directory
- **Server-only rule**: files in `lib/` must not import browser APIs. Do not add `"use client"` to any `lib/` file.
- Client components require `"use client"` as the first line
- Server Actions require `"use server"` as the first line
- `proxy.ts` is Next.js 16+ convention — do not create or rename to `middleware.ts`

### Feature-Based Architecture Pattern
Each feature (e.g., `auth`, `organization`, `invitations`) follows this structure:
- `lib/` — server-side utilities, Admin API calls, business logic (no `"use client"`)
- `components/` — React components (client `"use client"` or server RSC)
- `types.ts` — feature-scoped TypeScript interfaces
- Feature utilities are imported by app routes and other features using absolute paths (`@/features/[feature]/`)

### Common Patterns
- Server Components fetch data directly (no useEffect/fetch in RSC)
- Server Actions validate org membership and role server-side before mutations
- `Promise.allSettled()` for parallel Admin API calls to avoid cascading failures
- Cookie `active-org` stores the currently selected org alias (`__all__` for cross-org view)
- Icons from `lucide-react` only; never emoji or custom SVG
