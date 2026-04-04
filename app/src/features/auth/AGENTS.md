<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-04-04 -->

# features/auth

## Purpose
Authentication feature. NextAuth v5.0.0-beta.25 configuration with Keycloak OIDC provider, JWT token refresh callback, session extraction of org/role claims, and login redirect component.

## Key Files

| File | Description |
|------|-------------|
| `lib/auth.ts` | NextAuth config — OIDC strategy with Keycloak, JWT callback for token refresh + org/role extraction, session callback for serializing org claim, in-memory `sessionStore` Map for backchannel logout. Exports `{ handlers, signIn, signOut, auth, unstable_update, sessionStore }`. |
| `types.ts` | Auth-scoped types (if any) |
| `components/login-redirect.tsx` | Server Component that redirects authenticated users to `/members` and unauthenticated users to `/login` |
| `components/logout-button.tsx` | Client component for logout button (used standalone outside NavUser) |

## For AI Agents

### Working In This Directory
- `lib/auth.ts` is server-only — no `"use client"`
- Components are in `components/` subdirectory (mark client components with `"use client"`)

### Auth Flow Overview
1. Unauthenticated user → `/login` page (auth-only route)
2. NextAuth redirects to Keycloak OIDC endpoint
3. Keycloak authenticates, redirects to callback `/api/auth/callback/keycloak`
4. JWT callback extracts tokens, stores in NextAuth session
5. Session callback decodes JWT, extracts `organization` claim (map of org alias → {id, groups})
6. If user has zero orgs, `proxy.ts` redirects to `/onboarding`
7. If user has orgs, `activeOrg` set to first org alias; `orgRole` derived from group membership (`/Admin`, `/Managers`, `/Members`)

### Key Constants
- `KC_PUBLIC = process.env.KC_ISSUER` — public URL for browser (OIDC `iss` validation)
- `KC_INTERNAL = process.env.KC_ISSUER_INTERNAL` — Docker-internal URL for server token calls

### Token Refresh Strategy
- JWT callback checks if `accessTokenExpiresAt` has passed
- If expired, calls KC token endpoint with `refresh_token` (via `KC_INTERNAL`)
- On refresh failure, returns `{ error: "RefreshTokenError" }` — caught by `proxy.ts` to redirect to signout
- `sessionStore` Map: stores `providerAccountId` → `token.sub` for backchannel logout (NOT cluster-safe; replace with Redis in production)

### Important Notes
- `idToken` is attached to session server-side only — NOT serialized to client cookie (used only for KC OIDC logout `id_token_hint`)
- Service account credentials (KC_SERVICE_ACCOUNT_CLIENT_ID, KC_SERVICE_ACCOUNT_CLIENT_SECRET) are used by other features to call Admin API
