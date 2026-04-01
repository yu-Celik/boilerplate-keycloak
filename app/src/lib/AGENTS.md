<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-04-01 | Updated: 2026-04-01 -->

# lib

## Purpose
Server-side shared libraries: Keycloak OIDC authentication, Admin API client, email domain classification, and multi-tenant data access filtering.

## Key Files

| File | Description |
|------|-------------|
| `auth.ts` | NextAuth v5 config — Keycloak OIDC provider (with `organization:*` scope), JWT callbacks with `jose` verification, session parsing, token refresh with RefreshTokenError handling, org/role extraction |
| `keycloak-admin.ts` | Service account client for KC Admin API — org CRUD, member management, group operations, invitation management, search by domain; uses `KC_ISSUER_INTERNAL` for Docker-internal calls |
| `email-domain.ts` | Public vs professional email domain detection using `free-email-domains` package — `isPublicDomain()`, `suggestOrgName()`, `extractDomain()` |
| `scope-filter.ts` | Multi-tenant data filtering — `buildScopeFilter()` returns filter based on active org + user role (admin/manager/member), `filterRecords()` applies filter to data arrays |

## Subdirectories

| Directory | Purpose |
|-----------|---------|
| `demo/` | In-memory demo data stores for Contacts and Tasks modules |

## For AI Agents

### Working In This Directory
- All files are server-only (no `"use client"`)
- `auth.ts` exports `{ handlers, signIn, signOut, auth, sessionStore, unstable_update }` from NextAuth
- `auth.ts` uses `jose` ^6.2.2 for JWT verification and validation
- `keycloak-admin.ts` uses `KC_ISSUER_INTERNAL` (Docker-internal URL) for API calls
- Token caching in `keycloak-admin.ts` with 30s buffer before expiry
- `scope-filter.ts` is framework-agnostic — works with any data source

### Key Patterns
- `auth.ts` JWT callback handles token refresh, returns error if refresh fails (`error: "RefreshTokenError"`)
- `auth.ts` session callback parses JWT to extract `organization` claim, derives `activeOrg` and `orgRole`
- `auth.ts` uses in-memory `sessionStore` Map for backchannel logout (⚠️ not cluster-safe, replace with Redis in production)
- `keycloak-admin.ts` `adminFetch()` helper auto-injects service account Bearer token
- `searchOrgByDomain()` uses `?search=<domain>&exact=true` (KC `search` covers both org name AND domains)
- After org creation, must call `signIn("keycloak")` — refresh token cannot add `organization` scope
- Cookie validation in server actions: `(await cookies()).set()` with httpOnly flag

<!-- MANUAL: -->
