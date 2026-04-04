<!-- Generated: 2026-04-04 | Updated: 2026-04-04 -->

# boilerplate-keycloak

## Purpose

Production-ready multi-tenant SaaS boilerplate combining Keycloak (nightly) for identity and access management with Next.js 16 + Turbopack for the application layer. Demonstrates:
- Multi-tenant organization management via Keycloak Organizations
- OIDC authentication with NextAuth v5.0.0-beta.25
- Role-based RBAC (roles mapped from Keycloak group memberships)
- shadcn/ui sidebar pattern with Tailwind CSS v4 (CSS-first, no config file)
- Keycloak 26+ Technology Preview features: Workflows, identity-first login, Passkeys, DPoP, Fine-Grained Permissions V2, recovery codes, step-up authentication, token exchange
- Fully containerized: Keycloak + PostgreSQL + Next.js + Mailpit via Docker Compose
- Custom login and account themes via Keycloakify v11 (React 19, Tailwind v4, no PatternFly)

## Key Files

| File | Description |
|------|-------------|
| `docker-compose.yml` | Four-service orchestration: Keycloak (3991), PostgreSQL 16, Next.js (3990), Mailpit (3992). Keycloak runs production mode with `--import-realm`, `--hostname-backchannel-dynamic=true`, `--http-enabled=true`, `--proxy-headers=xforwarded`. |
| `Makefile` | Commands: `up`, `down`, `logs`, `reset`, `build-theme`, `init-realm`, `export-realm`, `backup`. All services health-checked before marked ready. |
| `.env.example` | Template for local development. See README for required variables. |
| `README.md` | Setup, architecture, services, and features overview. |

## Subdirectories

| Directory | Purpose |
|-----------|---------|
| `app/` | Next.js 16 app with Turbopack, shadcn/ui, Tailwind v4, feature-based architecture, auth pages, multi-org dashboard, role-based RBAC. See `app/AGENTS.md`. |
| `keycloakify/` | Keycloakify v11 custom login + account themes (React 19, Tailwind v4, shadcn, no PatternFly). See `keycloakify/AGENTS.md`. |
| `configs/` | Realm JSON export, init shell script, Keycloak Workflows YAML. Mounted read-only into Keycloak container. See `configs/AGENTS.md`. |
| `shared/` | Shared theme tokens CSS (blue-gray glassmorphism palette). Imported by both app and keycloakify. See `shared/AGENTS.md`. |
| `docs/` | Feature documentation: passkeys, token-exchange, recovery-codes, DPoP, step-up-auth. See `docs/AGENTS.md`. |
| `backups/` | Database backup scripts and snapshots for Keycloak PostgreSQL. |

## For AI Agents

### Working In This Directory

**Start dev environment:**
```bash
make up
```
Waits for all services to be healthy, auto-runs `make init-realm`. Provides:
- Keycloak Admin Console: http://localhost:3991 (username: admin, password: admin)
- Next.js app: http://localhost:3990
- Mailpit (email viewer): http://localhost:3992
- PostgreSQL (internal, port 5432)

**Theme rebuild:**
```bash
make build-theme          # Compiles keycloakify/ to JAR
docker compose restart keycloak  # Reloads theme
```

**Export live realm:**
```bash
make export-realm         # Dumps current Keycloak state to configs/realm-export.json
```

**Database backup:**
```bash
make backup               # Creates snapshot in backups/
```

### Keycloak URLs

- **Public**: `KC_ISSUER=http://localhost:3991/realms/boilerplate` (used by browser, validates `iss` claim in JWT)
- **Docker-internal**: `KC_ISSUER_INTERNAL=http://keycloak:8080/realms/boilerplate` (used by server-side API calls)

### Architecture Decisions

1. **Keycloak is pure IAM** — no custom Java SPI plugins. All business logic in Next.js Server Actions + `keycloak-admin.ts`.

2. **Multi-tenant via KC Organizations** — each workspace is a Keycloak Organization. Users belong to multiple orgs simultaneously.

3. **Organization scope (`organization:*`)** — JWT token includes `organization` claim as a map: `alias → {id, groups}`. Returns `null` for zero-org users; check with `Object.keys(org).length > 0`.

4. **Post-login org provisioning** — onboarding wizard creates org via KC Admin API after first login, then forces `signIn("keycloak")` re-auth because refresh tokens cannot retroactively add the `organization` scope.

5. **Dual-URL token pattern**:
   - `authorization.url`, `jwks_endpoint` use `KC_ISSUER` (public, validated by browser)
   - `token.url`, `userinfo.url` use `KC_ISSUER_INTERNAL` (Docker-internal, for server-to-server)

6. **In-memory session store** for backchannel logout. Upgrade to Redis/KV for multi-instance production.

7. **Tailwind CSS v4 CSS-first** — no `tailwind.config.ts`. All configuration in `src/app/globals.css` using `@import`, `@theme`, `@plugin`, `@variant` directives.

8. **Keycloakify v11 no PatternFly** — `doUseDefaultCss=false`. Use Tailwind directly; never use `kcClsx()`.

9. **Feature-based module structure** in `app/src/features/`:
   - Each feature (`auth`, `organization`, `invitations`, `members`, `admin`, `onboarding`, `settings`) owns its own `lib/`, `components/`, and `types.ts`
   - Routes in `app/src/app/` consume features — they do not contain business logic
   - `keycloak-admin.ts` (service account integration) lives in `features/organization/lib/` as core integration
   - Types are co-located with their feature (no monolithic types file)

10. **Shared utilities** — `lib/utils.ts` is the only shared file (contains `cn()` for Tailwind merging)

11. **UI components** — `components/ui/` is shadcn/ui (untouched by features)

### Key Discoveries (Spikes)

- KC nightly `organization:*` scope returns `null` for zero-org users — must check `Object.keys(org).length > 0` before accessing
- Refresh token cannot add `organization` scope after org creation — must call `signIn("keycloak")` to re-authenticate
- `?search=<domain>&exact=true` in KC Admin API searches org name AND domain list simultaneously
- `manage-realm` role sufficient for org operations — no separate `manage-organizations` role
- `revokeRefreshToken: true` in realm prevents token reuse (security best practice)
- `sslRequired: "external"` allows HTTP on `127.0.0.1` while enforcing HTTPS externally

### Testing Workflow

1. **Type-check**: `cd app && npx tsc --noEmit` (must pass with 0 errors)
2. **Build**: `cd app && npm run build` (verifies production bundling)
3. **Manual auth flow**: login → onboarding (new user) → team switching → logout
4. **Role-based data filtering**: create org → assign users → verify data visibility
5. **Theme changes**: `make build-theme && docker compose restart keycloak` → test in browser

## Dependencies

| Dependency | Version | Purpose |
|------------|---------|---------|
| Keycloak | nightly (999.0.0-SNAPSHOT) | Identity provider with Organizations, Workflows, Passkeys, DPoP |
| Next.js | ^16.2.2 | React framework with App Router and Turbopack |
| NextAuth | ^5.0.0-beta.25 | OIDC authentication with JWT strategy, backchannel logout |
| React | ^19.2.4 | UI library with Server Components by default |
| TypeScript | 6.0 | Type safety with strict mode, `verbatimModuleSyntax` |
| Tailwind CSS | v4 | CSS-first styling, no config file (in globals.css) |
| Keycloakify | ^11.15.3 | Custom login/account themes (React, no PatternFly) |
| PostgreSQL | 16 | Keycloak persistent storage |
| Mailpit | latest | Email testing for invitations, workflows |
| jose | ^6.2.2 | JWT verification and parsing |
| Radix UI | various | Headless UI primitives (alert-dialog, avatar, collapsible, dialog, dropdown-menu, label, select, separator, slot, switch, tabs, toast, toggle, tooltip) |
| lucide-react | ^1.7.0 | Icon library (exclusive, no custom SVG) |
| class-variance-authority | 0.7.1 | Component variant composition |
| free-email-domains | 1.2.25 | Domain validation during registration |

## Project Structure

```
/
├── app/                          ← Next.js SaaS application (See app/AGENTS.md)
│   ├── src/
│   │   ├── app/                 ← Routes (auth, dashboard)
│   │   ├── features/            ← Feature modules (auth, organization, invitations, members, admin, onboarding, settings)
│   │   ├── components/          ← Reusable components (ui/, app-sidebar, nav-user, etc.)
│   │   └── lib/                 ← Utilities (auth.ts, keycloak-admin.ts, utils.ts)
│   ├── public/                  ← Static assets
│   ├── package.json
│   ├── tsconfig.json
│   ├── next.config.ts
│   ├── Dockerfile
│   └── components.json
│
├── keycloakify/                 ← Custom Keycloak themes (See keycloakify/AGENTS.md)
│   ├── src/
│   │   ├── login/              ← Login theme pages
│   │   ├── account/            ← Account management theme
│   │   ├── components/         ← Reusable theme components
│   │   ├── lib/                ← Theme utilities
│   │   └── globals.css         ← Tailwind v4 CSS-first config
│   ├── dist/                   ← Built theme JAR (git-ignored)
│   ├── .storybook/             ← Storybook config (port 6006)
│   ├── package.json
│   ├── vite.config.ts
│   └── tsconfig.json
│
├── configs/                     ← Keycloak configuration (See configs/AGENTS.md)
│   ├── realm-export.json        ← Full realm definition (imported at startup)
│   ├── init-realm.sh            ← Bootstrap script (runs once)
│   └── workflows/               ← Keycloak Workflow YAML (Technology Preview)
│
├── shared/                      ← Shared theme tokens (See shared/AGENTS.md)
│   └── theme-tokens.css        ← CSS custom properties (variables)
│
├── docs/                        ← Feature documentation (See docs/AGENTS.md)
│   └── features/               ← Passkeys, token-exchange, recovery-codes, DPoP, step-up-auth
│
├── docker-compose.yml           ← Service orchestration
├── Makefile                     ← Commands (up, down, logs, reset, build-theme, etc.)
├── .env.example                 ← Environment template
├── README.md                    ← Setup and feature overview
└── AGENTS.md                    ← This file
```

## Common Commands

| Command | Effect |
|---------|--------|
| `make up` | Start all services (Keycloak, PostgreSQL, Next.js, Mailpit), wait for health, init realm |
| `make down` | Stop all services, keep data |
| `make reset` | Destroy all data, rebuild images, start fresh |
| `make logs` | Tail logs from all services |
| `make build-theme` | Compile keycloakify to JAR in dist/ |
| `make init-realm` | Run init-realm.sh script (demo org, service account setup) |
| `make export-realm` | Dump current Keycloak state to realm-export.json |
| `make backup` | Create PostgreSQL snapshot in backups/ |
| `cd app && npm run dev --turbopack` | Start Next.js with Turbopack (hot reload) |
| `cd keycloakify && npm run dev` | Start Storybook for theme development (port 6006) |
| `cd app && npx tsc --noEmit` | Type-check app (0 errors required before commit) |
| `cd app && npm run build` | Production build (verifies bundling) |

## Debugging Tips

- **Keycloak admin**: http://localhost:3991 → Realm Settings, Clients, Organizations
- **Mailpit**: http://localhost:3992 → View emails sent during auth/invitations
- **Next.js errors**: `docker compose logs app` or browser DevTools
- **JWT claims**: Decode at https://jwt.io (copy token from browser network tab or cookies)
- **Theme issues**: Check `docker compose logs keycloak` for JAR load errors; verify `keycloakify/dist/` exists
- **Organization claim missing**: Check Keycloak Clients → boilerplate-app → Scope tab; ensure `organization:*` scope is assigned
- **Backchannel logout not working**: Verify `NEXTAUTH_URL` matches Keycloak `Redirect URIs` exactly

## Next Steps

1. Clone this repository
2. Copy `.env.example` to `.env` and set required variables
3. Run `make up`
4. Visit http://localhost:3990 and log in as user@demo.com / password
5. See `README.md` for detailed setup and feature documentation
6. See individual `AGENTS.md` files in each subdirectory for module-specific details
