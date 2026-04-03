<!-- Generated: 2026-04-03 -->

# boilerplate-keycloak

## Purpose
A production-ready SaaS B2B boilerplate combining Keycloak (nightly) for identity management with Next.js 16 for the application layer. Features multi-tenant organization management via Keycloak Organizations, OIDC authentication with NextAuth v5, a shadcn/ui sidebar-07 pattern, and demonstrates Keycloak 26+ Technology Preview features (Workflows, identity-first login, Passkeys, DPoP, Fine-Grained Permissions V2).

## Key Files

| File | Description |
|------|-------------|
| `docker-compose.yml` | Orchestrates four services: Keycloak (port 3991), PostgreSQL 16, Next.js (port 3990), Mailpit (port 3992). Keycloak runs in production mode with `--import-realm` and `--hostname-backchannel-dynamic=true`. |
| `.env` | Environment variables: `KC_ISSUER` (public URL for browser + token issuer validation), `KC_ISSUER_INTERNAL` (Docker-internal URL for server-side API calls), `KC_CLIENT_ID/SECRET`, `KC_SERVICE_ACCOUNT_CLIENT_ID/SECRET`, `NEXTAUTH_SECRET` |
| `Makefile` | Common development commands |
| `README.md` | Project documentation and setup guide |

## Subdirectories

| Directory | Purpose |
|-----------|---------|
| `app/` | Next.js 16 application — auth pages, dashboard, organization management, API routes (see `app/AGENTS.md`) |
| `configs/` | Keycloak realm export JSON, init shell script, and declarative workflow YAML definitions (see `configs/AGENTS.md`) |
| `keycloakify/` | Custom Keycloak login and account themes built with React (Keycloakify) |
| `docs/` | Feature documentation and architecture notes |
| `backups/` | Database backup scripts and snapshots |

## For AI Agents

### Working In This Directory
- Run `docker compose up -d` to start all services; Next.js waits for Keycloak healthcheck before starting
- Keycloak: port 3991 — Next.js: port 3990 — Mailpit UI: port 3992
- Keycloak runs in **production mode** (`start`, not `start-dev`) with `--http-enabled=true` for local HTTP and `--proxy-headers=xforwarded` for reverse-proxy header trust
- Admin Console: `http://localhost:3991` — username `admin`, password `admin`
- **Two URLs for Keycloak**: `KC_ISSUER` (public, used by browser and for `iss` validation) vs `KC_ISSUER_INTERNAL` (Docker-internal `http://keycloak:8080/realms/boilerplate`, used for all server-side fetch calls to avoid DNS round-trips)

### Architecture Decisions
- **Keycloak stays pure IAM** — no custom Java SPI plugins. All business logic lives in Next.js Server Actions.
- **Multi-tenant via KC Organizations** — each workspace is a Keycloak Organization; users can belong to multiple organizations simultaneously
- **`organization:*` scope** — JWT access token carries an `organization` claim (map of alias → `{id, groups}`) for all user memberships. Scope returns `null` for zero-org users (not an error).
- **Post-login org provisioning** — onboarding wizard creates org via KC Admin API after first login; then forces re-`signIn()` because the refresh token cannot add the `organization` scope retroactively
- **Token dual-URL pattern** — `authorization.url` and `jwks_endpoint` use `KC_PUBLIC`; `token.url` and `userinfo.url` use `KC_INTERNAL` to avoid container DNS issues
- **In-memory `sessionStore`** for backchannel logout — must be replaced with Redis/KV in multi-instance production deployments

### Key Discoveries (Spike)
- KC nightly `organization:*` scope returns `null` for zero-org users — check `Object.keys(org).length > 0`
- Refresh token cannot add `organization` scope after org creation — must call `signIn("keycloak")` again
- `?search=<domain>&exact=true` in KC Admin API searches both org name AND domain list simultaneously
- `manage-realm` role is sufficient for org operations — no separate `manage-organizations` role needed
- `revokeRefreshToken: true` in realm config prevents refresh token reuse (security best practice)
- `sslRequired: "external"` allows HTTP on `127.0.0.1` while enforcing HTTPS for external access

## Dependencies

| Dependency | Version | Purpose |
|------------|---------|---------|
| Keycloak | nightly (999.0.0-SNAPSHOT) | Identity provider with Organizations |
| Next.js | ^16.2.2 | React framework with App Router and Turbopack |
| NextAuth | ^5.0.0-beta.25 | OIDC authentication with JWT strategy |
| React | ^19.2.4 | UI library |
| TypeScript | 6.0 | Type safety with `verbatimModuleSyntax` |
| Tailwind CSS | v4 | CSS-first styling (no `tailwind.config.ts`) |
| PostgreSQL | 16 | Keycloak database |
| Mailpit | latest | Email testing for invitations |
| jose | ^6.2.2 | JWT verification |
