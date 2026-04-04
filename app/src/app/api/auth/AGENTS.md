<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-04-04 -->

# auth

## Purpose
Authentication and logout API routes. Handles NextAuth OIDC flow, Keycloak logout with `id_token_hint`, and backchannel logout (server-initiated session revocation).

## Subdirectories

| Directory | Purpose |
|-----------|---------|
| `[...nextauth]/` | NextAuth catch-all handler — OIDC code exchange, session management |
| `logout/` | POST endpoint — destroy session and return KC logout URL |
| `backchannel-logout/` | POST endpoint — receive KC backchannel logout and invalidate session |

## For AI Agents

### Working In This Directory
- `[...nextauth]` is a Next.js catch-all route segment (handles all auth paths)
- Do not create `logout` or `backchannel-logout` as nested routes under `[...nextauth]`
- Each route handler is independent and uses standard `NextRequest` / `NextResponse`
- Session store is a module-level Map in `@/features/auth/lib/auth`

### Route Purposes
1. `[...nextauth]`: Standard NextAuth protocol routes (signin, callback, signout, etc.)
2. `logout`: Custom route for seamless KC logout (skips KC confirmation page via `id_token_hint`)
3. `backchannel-logout`: Webhook from KC to revoke user sessions on KC-initiated logout

### Key Differences from Standard NextAuth Logout
- Standard `signOut()` only destroys NextAuth cookie (doesn't notify KC)
- Custom `/api/auth/logout` destroys cookie AND redirects to KC logout endpoint
- KC OIDC logout with `id_token_hint` skips the KC confirmation page for better UX
