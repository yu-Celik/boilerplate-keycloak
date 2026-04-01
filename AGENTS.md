<!-- Generated: 2026-04-01 | Updated: 2026-04-01 -->

# boilerplate-keycloak

## Purpose
A production-ready SaaS B2B boilerplate combining Keycloak (nightly) for identity management with Next.js 16 for the application layer. Features multi-tenant organization management, team switching, OIDC authentication with NextAuth v5, and demonstrates Keycloak 26+ Technology Preview features (Passkeys, DPoP, Workflows, Fine-Grained Permissions V2).

## Key Files

| File | Description |
|------|-------------|
| `docker-compose.yml` | Orchestrates Keycloak, PostgreSQL, Next.js, and Mailpit services |
| `.env` | Environment variables: KC hostname, DB credentials, OIDC config, feature flags |
| `Makefile` | Common commands for development workflow |
| `README.md` | Project documentation and setup guide |

## Subdirectories

| Directory | Purpose |
|-----------|---------|
| `app/` | Next.js 16 application — auth, dashboard, org management, demo modules (see `app/AGENTS.md`) |
| `configs/` | Keycloak realm export, init scripts, and declarative workflow YAML definitions (see `configs/AGENTS.md`) |
| `keycloakify/` | Custom Keycloak login/account themes built with React (see `keycloakify/AGENTS.md`) |
| `docs/` | Feature documentation and architecture notes (see `docs/AGENTS.md`) |
| `backups/` | Database backup scripts and snapshots |

## For AI Agents

### Working In This Directory
- Run `docker compose up -d` to start all services
- Keycloak runs on port 3991, Next.js on 3990, Mailpit on 3992
- Keycloak is in **production mode** (`start` not `start-dev`) with `--http-enabled=true` and `--proxy-headers=xforwarded`
- `revokeRefreshToken: true` in realm config prevents token reuse attacks
- `sslRequired: "external"` allows HTTP on localhost, enforces HTTPS for external access
- Access via Tailscale HTTPS: `https://finanssor-data-center-v1.tail446cc0.ts.net:3991`
- Admin Console: username `admin`, password `admin`

### Architecture
- **Keycloak stays pure IAM** — no custom Java SPI plugins. All business logic lives in Next.js.
- **Multi-tenant via KC Organizations** — each workspace is a KC org, users can belong to multiple orgs
- **Token downscoping** — `scope=organization:*` for global view, `scope=organization:<alias>` for single org
- **Post-login org provisioning** — onboarding wizard creates org via KC Admin API after registration
- **signIn() for re-auth** — after org creation, force re-authentication (not refresh token) because KC omits `organization` scope for zero-org users
- **Security**: JWT verification with `jose`, httpOnly cookies, cookie validation in server actions, security headers (HSTS, CSP, X-Frame-Options)

### Key Discovery (Spike)
- KC nightly `organization:*` scope returns `null` claim for zero-org users (not an error)
- Refresh token cannot add `organization` scope after org creation — must re-signIn
- `?search=<domain>&exact=true` searches both org name AND domains
- `manage-realm` role is sufficient for org operations (no `manage-organizations` role needed)

## Dependencies

### External
- Keycloak nightly (999.0.0-SNAPSHOT) — Identity provider with Organizations
- Next.js 16.2 with Turbopack — React framework, fast local dev
- NextAuth v5 beta — Authentication library with OIDC support
- React 19.2 — UI library
- TypeScript 6.0 with `verbatimModuleSyntax` — Type safety
- Tailwind CSS v4 (CSS-first, no tailwind.config.ts) — Styling
- jose ^6.2.2 — JWT verification
- PostgreSQL 16 — Database for Keycloak
- Mailpit — Email testing
- Tailscale — Secure networking / HTTPS proxy

<!-- MANUAL: -->
