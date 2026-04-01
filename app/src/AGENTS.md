<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-04-01 | Updated: 2026-04-01 -->

# src

## Purpose
Application source code organized by Next.js App Router conventions with shared libraries for authentication, Keycloak Admin API, email domain detection, and multi-tenant scope filtering.

## Key Files

| File | Description |
|------|-------------|
| `proxy.ts` | Next.js 16+ middleware (formerly `middleware.ts`) — auth check, org claim validation, RefreshTokenError handling |

## Subdirectories

| Directory | Purpose |
|-----------|---------|
| `app/` | Next.js App Router — pages, layouts, API routes, middleware (see `app/AGENTS.md`) |
| `components/` | Shared React components — TeamSwitcher, UI primitives (see `components/AGENTS.md`) |
| `lib/` | Shared libraries — auth, keycloak-admin, email-domain, scope-filter, demo data (see `lib/AGENTS.md`) |
| `types/` | TypeScript type definitions and module augmentations (see `types/AGENTS.md`) |

## For AI Agents

### Working In This Directory
- `@/` import alias resolves to this `src/` directory
- Server-only code in `lib/` (no browser APIs)
- Client components must have `"use client"` directive
- Server actions must have `"use server"` directive
- `proxy.ts` is Next.js 16+ convention (replaces `middleware.ts` from earlier versions)

<!-- MANUAL: -->
