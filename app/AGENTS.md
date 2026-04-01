<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-04-01 | Updated: 2026-04-01 -->

# app

## Purpose
Next.js 16 application providing the SaaS dashboard, authentication via NextAuth v5 + Keycloak OIDC, organization management, team switching, and demo modules (Contacts, Tasks) with multi-tenant data filtering. Uses Turbopack for fast local development.

## Key Files

| File | Description |
|------|-------------|
| `package.json` | Dependencies: next 16.2, react 19.2, next-auth v5 beta, radix-ui, lucide-react, jose, tailwind v4 |
| `tsconfig.json` | TypeScript 6.0 config with `verbatimModuleSyntax: true`, `@/` path alias to `src/` |
| `next.config.ts` | Next.js configuration with security headers (HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy) |
| `postcss.config.js` | PostCSS config with `@tailwindcss/postcss` for Tailwind CSS v4 |
| `src/app/globals.css` | Tailwind CSS v4 (CSS-first): `@import "tailwindcss"`, `@theme`, `@plugin`, `@variant` — NO tailwind.config.ts |
| `Dockerfile` | Production Docker build for the Next.js app |

## Subdirectories

| Directory | Purpose |
|-----------|---------|
| `src/` | Application source code (see `src/AGENTS.md`) |
| `public/` | Static assets |

## For AI Agents

### Working In This Directory
- Run `npm install` after modifying `package.json`
- TypeScript strict mode with `verbatimModuleSyntax: true` — run `npx tsc --noEmit` to check
- Uses `@/` path alias mapping to `src/`
- **Tailwind CSS v4**: CSS-first config in `globals.css` (no `tailwind.config.ts`)
- Dev server: `npm run dev` uses `--turbopack` for instant refresh

### Testing Requirements
- `npx tsc --noEmit` must pass with 0 errors
- `npm run build` for production build verification (Turbopack)

### Common Patterns
- Server Components by default (no `"use client"` unless needed)
- Server Actions for mutations (`"use server"`) with `httpOnly` cookies
- Radix UI primitives for interactive components
- Lucide React for icons
- `useTransition()` for instant UI feedback on server actions

## Dependencies

### Internal
- `../configs/realm-export.json` — Keycloak realm configuration (revokeRefreshToken: true, sslRequired: "external")
- `../configs/workflows/` — KC workflow YAML definitions (Technology Preview)

### External
- `next` ^16.2.2 — React framework with Turbopack
- `react` ^19.2.4 — UI library
- `react-dom` ^19.2.4 — DOM rendering
- `next-auth` ^5.0.0-beta.25 — OIDC authentication
- `jose` ^6.2.2 — JWT verification
- `free-email-domains` — Public email domain detection
- `@radix-ui/*` — UI primitives
- `lucide-react` — Icons
- `@tailwindcss/postcss` ^4.2.2 — Tailwind CSS v4

<!-- MANUAL: -->
