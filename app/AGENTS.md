<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-04-04 | Updated: 2026-04-04 -->

# app

## Purpose
Next.js 16 app with Turbopack providing the SaaS dashboard, OIDC authentication via NextAuth v5.0.0-beta.25 + Keycloak, multi-tenant organization management, role-based RBAC, team switching, and demo modules (Contacts, Tasks) with granular data filtering. Tailwind v4 CSS-first styling (no config file), shadcn/ui components, React 19 Server Components by default.

## Key Files

| File | Description |
|------|-------------|
| `package.json` | Next.js 16.2.2, React 19.2.4, NextAuth 5.0.0-beta.25, Radix UI, Tailwind v4.2.2, jose 6.2.2, lucide-react, free-email-domains 1.2.25, CVA, clsx, tailwind-merge |
| `tsconfig.json` | TypeScript 6.0, strict mode, `verbatimModuleSyntax: true`, `@/` alias → `src/`, `types: ["node", "react", "react-dom"]` |
| `next.config.ts` | Security headers (HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy, CSP disabled for dev) |
| `postcss.config.js` | `@tailwindcss/postcss` v4.2.2, no Tailwind config file |
| `src/app/globals.css` | Tailwind CSS v4 (CSS-first): `@import "tailwindcss"`, `@import "@/lib/theme-tokens.css"`, `@theme`, `@plugin`, `@variant` directives |
| `src/lib/auth.ts` | NextAuth configuration, OIDC strategy with Keycloak, JWT verification using jose, org/role extraction from tokens |
| `src/lib/keycloak-admin.ts` | Service account client for Admin API: create orgs, manage users, assign roles, manage invitations |
| `src/types/index.ts` | Global types: Org, User, Role, Invitation, etc. |
| `Dockerfile` | Multi-stage build, Node.js 20-alpine, Next.js `output: 'standalone'` for slim Docker image |
| `components.json` | shadcn/ui configuration for component generation |

## Subdirectories

| Directory | Purpose |
|-----------|---------|
| `src/` | Application source: app routes, components, lib utilities (see `src/AGENTS.md`) |
| `src/app/(auth)/` | Auth-only routes: login, register, callback, onboarding (see `src/app/(auth)/AGENTS.md`) |
| `src/app/(dashboard)/` | Protected routes: dashboard, settings, admin, organizations (see `src/app/(dashboard)/AGENTS.md`) |
| `src/components/` | Reusable React components: UI, sidebar, app components (see `src/components/AGENTS.md`) |
| `src/lib/` | Utilities: auth, Keycloak admin, types (see `src/lib/AGENTS.md`) |
| `public/` | Static assets (favicon, images) served at root |

## For AI Agents

### Working In This Directory
- Install: `npm install`
- Dev: `npm run dev --turbopack` (Turbopack for near-instant HMR)
- Build: `npm run build`
- Type-check: `npx tsc --noEmit` (must pass before commit)
- Lint: `npm run lint`
- **Tailwind CSS v4 CSS-first** — all config in `src/app/globals.css` using `@import`, `@theme`, `@plugin`, `@variant`. **Never create `tailwind.config.ts`**.
- Path alias: `@/` → `src/`. Always use `@/lib/auth`, `@/components/Button`, etc.
- TypeScript strict mode enforced — use `import type` for type-only imports.

### Authentication Flow
1. User lands on login page (auth-only route)
2. NextAuth redirects to Keycloak OIDC endpoint
3. Keycloak authenticates user, redirects back to callback route
4. Callback extracts `organization` claim from JWT (map of org alias → {id, groups})
5. If user has zero orgs (new account), redirect to onboarding wizard
6. Onboarding creates org via `keycloak-admin.ts`, then forces `signIn()` re-auth to get `organization` claim
7. User lands on dashboard with active org selected
8. Team switcher allows switching between user's orgs
9. Role resolved from `organization[activeOrg].groups` → `orgRole` for RBAC

### Server Components & Actions
- **Server Components by default** — all files are RSC unless marked `"use client"`
- **`"use client"` only for**:
  - Browser APIs (localStorage, window, document)
  - React hooks (useState, useEffect, useTransition, etc.)
  - Event handlers (onChange, onClick, etc.)
- **Server Actions** (`"use server"`) for all mutations:
  - Never expose Keycloak Admin API calls to client
  - Always validate user's org membership and role server-side
  - Return serializable responses (no functions, dates, etc.)
  - Use `useTransition()` on client for optimistic UI feedback

### Common Patterns
- **Organization gating**: Check `user.orgs[activeOrg]` server-side before allowing mutations
- **Role-based RBAC**: Extract user's role from `organization[activeOrg].groups`, e.g., `/Admin` → "Admin"
- **Protected routes**: Middleware redirects unauthenticated users to login
- **Error handling**: `error.tsx`, `not-found.tsx`, `global-error.tsx` for error boundaries
- **shadcn/ui components**: Always in `src/components/ui/`, import from `@/components/ui/button`, etc.
- **Icons**: Use `lucide-react` exclusively; never use emoji or custom SVG
- **Form validation**: Radix UI Select, Input with Tailwind v4 utility classes

### Testing Requirements
- `npx tsc --noEmit` must pass with 0 errors before commit
- `npm run build` must succeed (verifies production bundling)
- Test auth flow manually: login, onboarding (new user), team switching, logout
- Test role-based data filtering: create org, assign users, verify data visibility

## Dependencies

### Internal
- `../../shared/theme-tokens.css` — imported by `src/app/globals.css` (blue-gray glassmorphism palette)
- `../../configs/realm-export.json` — Keycloak realm config mounted at container startup
- `../../keycloakify/` — custom login/account themes

### External
- **Framework**: `next` 16.2.2, `react` 19.2.4, `react-dom` 19.2.4
- **Auth**: `next-auth` 5.0.0-beta.25, `jose` 6.2.2
- **UI**: `@radix-ui/*` (alert-dialog, avatar, collapsible, dialog, dropdown-menu, label, select, separator, slot, switch, tabs, toast, toggle, tooltip), `lucide-react` 1.7.0
- **Styling**: `@tailwindcss/postcss` 4.2.2, `tailwindcss` 4.2.2, `class-variance-authority` 0.7.1, `clsx` 2.1.1, `tailwind-merge` 3.5.0
- **Utils**: `free-email-domains` 1.2.25
- **Dev**: TypeScript 6.0.2, `@types/node` 25.5.0, `@types/react` 19.2.14, `@types/react-dom` 19.2.3, `postcss` 8.5.8
