<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-04-04 -->

# features/auth/lib

## Purpose
Authentication library — NextAuth configuration, JWT token refresh, session management with org/role claims extraction, and Keycloak backchannel logout session store.

## Key Files

| File | Description |
|------|-------------|
| `auth.ts` | NextAuth v5 configuration with Keycloak OIDC provider. JWT callback handles token refresh via `KC_INTERNAL` endpoint, org/role claim extraction. Session callback decodes JWT and maps org claims to `{ id, groups }` structure. Exports `{ handlers, signIn, signOut, auth, unstable_update, sessionStore }`. In-memory `sessionStore` Map for backchannel logout (NOT cluster-safe — use Redis in production). |

## For AI Agents

### Working In This Directory
- `auth.ts` is server-only configuration — never use `"use client"` directive
- Service account token refresh uses `KC_INTERNAL` (Docker-internal URL) for server-to-server calls
- Token caching: implements 30s buffer before expiry to avoid expired token errors

### Token Refresh Logic
- JWT callback triggered on every session access
- Checks `accessTokenExpiresAt` against current time
- On expiry: exchanges `refresh_token` with Keycloak for new access/ID tokens
- Failure returns `{ error: "RefreshTokenError" }` — caught by upstream middleware to redirect to logout

### Session Storage Pattern
```typescript
// Backchannel logout: store providerAccountId → token.sub mapping
sessionStore.set(account.providerAccountId, token.sub);

// On logout event from Keycloak: retrieve stored sub to identify session
const sub = sessionStore.get(providerAccountId);
```

### Important Notes
- `idToken` is stored in JWT session server-side only — NOT serialized to client cookie
- Used only for Keycloak OIDC logout via `id_token_hint` parameter
- Organization claim structure: `{ [orgAlias]: { id: string, groups: string[] } }`
- Session does NOT contain user password or private keys — only encrypted JWT
