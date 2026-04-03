<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-04-03 -->

# app

## Purpose
Next.js 16 application providing the SaaS dashboard, OIDC authentication via NextAuth v5 + Keycloak, multi-tenant organization management, team switching, and demo modules (Contacts, Tasks) with role-based data filtering. Uses Turbopack for fast local development.

## Key Files

| File | Description |
|------|-------------|
| `package.json` | Dependencies: next ^16.2.2, react ^19.2.4, next-auth ^5.0.0-beta.25, @radix-ui/*, lucide-react, jose ^6.2.2, free-email-domains, @tailwindcss/postcss ^4.2.2 |
| `tsconfig.json` | TypeScript 6.0 with `verbatimModuleSyntax: true`, strict mode, `@/` path alias resolving to `src/` |
| `next.config.ts` | Security headers (HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy) |
| `postcss.config.js` | PostCSS config with `@tailwindcss/postcss` for Tailwind CSS v4 |
| `src/app/globals.css` | Tailwind CSS v4 (CSS-first): `@import "tailwindcss"`, `@theme`, `@plugin`, `@variant` — no `tailwind.config.ts` |
| `Dockerfile` | Multi-stage production Docker build using `output: 'standalone'` |

## Subdirectories

| Directory | Purpose |
|-----------|---------|
| `src/` | Application source code (see `src/AGENTS.md`) |
| `public/` | Static assets served at root |

## For AI Agents

### Working In This Directory
- Run `npm install` after modifying `package.json`
- TypeScript strict mode with `verbatimModuleSyntax: true` — use `import type` for type-only imports
- Path alias `@/` resolves to `src/` — use `@/lib/auth`, `@/components/...`, etc.
- **Tailwind CSS v4**: CSS-first config in `src/app/globals.css` — no `tailwind.config.ts`, do not create one
- Dev server: `npm run dev` uses `--turbopack` for near-instant HMR

### Testing Requirements
- `npx tsc --noEmit` must pass with 0 errors before committing
- `npm run build` for production build verification
- No dedicated test suite — verify behavior through the running app

### Common Patterns
- Server Components by default — add `"use client"` only when browser APIs or React hooks are needed
- Server Actions (`"use server"`) for all mutations — never expose Admin API calls to the client
- `useTransition()` for optimistic UI feedback on server action calls
- shadcn/ui component pattern: Radix UI primitives + Tailwind utility classes in `src/components/ui/`
- Lucide React for all icons

## Dependencies

### Internal
- `../configs/realm-export.json` — Keycloak realm configuration applied at startup
- `../configs/workflows/` — KC Workflow YAML definitions mounted into the Keycloak container

### External
- `next` ^16.2.2 with Turbopack
- `next-auth` ^5.0.0-beta.25 (Auth.js)
- `jose` ^6.2.2 — JWT parsing and verification
- `free-email-domains` — public domain blocklist for org name suggestion
- `@radix-ui/*` — unstyled accessible UI primitives
- `lucide-react` — icon library
- `@tailwindcss/postcss` ^4.2.2 — Tailwind CSS v4 PostCSS plugin
