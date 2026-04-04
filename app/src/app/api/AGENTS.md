<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-04-04 -->

# api

## Purpose
API routes for authentication, logout, and webhooks. Handles NextAuth middleware (OIDC code exchange), Keycloak OIDC logout flow, backchannel logout (server-initiated logout), and webhook ingestion (Stripe, etc.).

## Key Files

| File | Description |
|------|-------------|
| `auth/[...nextauth]/route.ts` | NextAuth catch-all route — exports `{ GET, POST }` handlers from `@/features/auth/lib/auth` |
| `auth/logout/route.ts` | POST endpoint — extracts `idToken` from server-side session, builds KC OIDC logout URL with `id_token_hint`, returns JSON with KC logout URL (CSRF validated) |
| `auth/backchannel-logout/route.ts` | POST endpoint — receives KC backchannel logout, verifies JWT signature, invalidates session in session store |

## Subdirectories

| Directory | Purpose |
|-----------|---------|
| `auth/` | Authentication and logout handlers |
| `webhooks/` | Webhook ingestion (Stripe, etc.) |

## For AI Agents

### Working In This Directory
- NextAuth route must be `[...nextauth]` catch-all (Next.js convention)
- Logout and backchannel-logout are explicit POST endpoints (not handled by NextAuth middleware)
- All endpoints use standard `NextRequest` / `NextResponse` from `next/server`
- Session store is in-memory Map for backchannel logout session lookup

### NextAuth Flow
```
Client calls signIn("keycloak")
→ Redirects to /api/auth/signin/keycloak
→ NextAuth middleware handles KC OAuth code exchange
→ Session stored with JWT claims (org, roles, idToken)
→ Redirects to callbackUrl (or / if not set)
```

### Logout Flow
```
Client calls /api/auth/logout (POST)
→ Server extracts idToken from session
→ Server destroys NextAuth cookie
→ Server builds KC OIDC logout URL with id_token_hint
→ Returns JSON { kcLogoutUrl }
→ Client redirects to kcLogoutUrl
→ KC clears session and redirects to post_logout_redirect_uri (/login)
```

### Backchannel Logout Flow
```
KC initiates logout (user logs out in KC admin, session revoked, etc.)
→ KC POSTs logout_token to /api/auth/backchannel-logout
→ Server verifies JWT signature against KC JWKS
→ Server extracts sid and sub from token payload
→ Server deletes session from in-memory store by sid or sub
→ Next request to NextAuth will use stale cookie, fail validation, redirect to /login
```

### Key Patterns
- `idToken` is server-side only — never exposed to client as raw JWT
- KC logout URL built server-side from environment variables
- CSRF validation on logout endpoint: Origin header must match NEXTAUTH_URL
- Backchannel logout uses cached JWKS set from KC (refreshes on first call)
- Session store keyed by session ID (sid) or subject (sub) for flexible invalidation
- JWKS cache is instance-scoped (per server instance, not global)

## Security Considerations

### Token Handling
- `idToken` attached to session server-side only
- KC OIDC logout URL includes `id_token_hint` to skip KC confirmation page
- No token exposure in client-side code or API responses

### CSRF Protection
- Logout endpoint validates Origin header against NEXTAUTH_URL
- Backchannel logout validates JWT signature (requires KC JWKS)
- Both endpoints reject invalid/missing tokens

### Session Invalidation
- Backchannel logout invalidates session by sid (KC session ID) or sub (user ID)
- Stale cookies detected on next request (JWT validation fails in NextAuth)
- Graceful fallback: invalid tokens redirect to /login

## Dependencies
- `@/features/auth/lib/auth` — NextAuth handlers, session store, `signOut()`
- NextAuth package — `handlers` export with GET/POST
- jose — JWT verification for backchannel logout
