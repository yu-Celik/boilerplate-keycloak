<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-04-04 | Updated: 2026-04-04 -->

# configs

## Purpose
Keycloak declarative configuration: realm export JSON for reproducible multi-tenant setup, initialization shell script for bootstrapping, and Keycloak Workflow YAML files for identity lifecycle automation (Keycloak 26.5+ Technology Preview). All mounted read-only into the Keycloak container.

## Key Files

| File | Description |
|------|-------------|
| `realm-export.json` | Full Keycloak realm definition. Imported at container startup via `--import-realm`. Defines: clients (boilerplate-app, boilerplate-service), scopes (openid, profile, email, organization:*), organizations, SMTP (Mailpit), token policies, themes, scope mappers, workflows. **Import strategy: IGNORE_EXISTING** — changes only apply on fresh realm creation, not to running instances. To modify existing realms: use Admin Console or `kcadm.sh` CLI inside container. |
| `init-realm.sh` | Bash script executed once by Docker after realm import. Creates demo organization, assigns service account roles (`manage-users`, `view-users`, `manage-realm`, `view-realm`, `manage-clients`, `view-clients`), seeds default data. Idempotent and tied to initial import. |

## Subdirectories

| Directory | Purpose |
|-----------|---------|
| `workflows/` | Keycloak Workflow YAML definitions (KC 26.5+ Technology Preview, feature-flagged). Mounted read-only to `/opt/keycloak/data/import/workflows/` at container start. Changes require `docker compose restart keycloak`. |

## For AI Agents

### Working In This Directory
- **realm-export.json editing**: Changes have **no effect** on existing Keycloak instances (uses `IGNORE_EXISTING` strategy)
  - For existing realm modifications: use Admin Console (http://localhost:3991) or exec `docker compose exec keycloak kcadm.sh` CLI
  - For fresh setup: modify realm-export.json, then `make reset` (destroys and recreates everything)
- **Workflow editing**: Changes are read-only mounted. To apply changes: edit YAML, then `docker compose restart keycloak`
- **init-realm.sh**: Runs once on first container startup. Safe to re-run manually: `docker compose exec -T keycloak bash /opt/keycloak/data/import/init-realm.sh`

### Key Realm Configuration

| Setting | Value | Significance |
|---------|-------|-------------|
| `organizationsEnabled` | `true` | Enables KC Organizations (multi-tenancy core feature) |
| `registrationEmailAsUsername` | `true` | Email = unique username (no separate username field) |
| `verifyEmail` | `true` | Mandatory email verification after registration |
| `revokeRefreshToken` | `true` | Refresh tokens single-use (prevents token replay attacks) |
| `sslRequired` | `"external"` | HTTP on 127.0.0.1/::1 allowed; HTTPS enforced for external clients |
| `accountTheme` | `keycloak.v3` | Modern KC built-in account management UI |
| `loginTheme` | `boilerplate-keycloak` | Custom React-based login theme from `keycloakify/dist/` |
| `smtpServer.from` | `noreply@boilerplate.local` | Email sender address (for Mailpit in dev) |
| `smtpServer.host` | `mailpit` | Docker service name (internal DNS) |
| `smtpServer.port` | `1025` | Mailpit SMTP port (non-TLS in dev) |

### OIDC Clients

**`boilerplate-app`** — Next.js application (confidential OIDC)
- Flow: Authorization Code with PKCE (`checks: ["pkce", "state"]`)
- Backchannel logout: POST to `${NEXTAUTH_URL}/api/auth/backchannel-logout` when user logs out in KC
- Scopes: `openid`, `profile`, `email`, `organization:*` (org scope returns map of memberships)
- Redirect URIs: `http://localhost:3990/api/auth/callback/keycloak`, `https://*/api/auth/callback/keycloak`
- Secret: stored in `KC_CLIENT_SECRET` env var, passed to Next.js at runtime

**`boilerplate-service`** — Admin API service account (confidential client credentials)
- Flow: Client Credentials (no user session)
- Service account roles (realm): `manage-users`, `view-users`, `manage-realm`, `view-realm`, `manage-clients`, `view-clients`
- Used by `app/src/lib/keycloak-admin.ts` for: create orgs, invite users, assign roles, manage groups
- Secret: stored in `KC_SERVICE_ACCOUNT_CLIENT_SECRET` env var

### Organization Scope Mappers
- **Organization Membership Mapper** — adds `organization` claim to JWT (map: alias → org metadata)
- **Organization Group Membership Mapper** — includes group paths (e.g., `/Admin`, `/Members`, `/Managers`) in `organization.{alias}.groups`; parsed by `app/src/lib/auth.ts` to derive user's `orgRole` for RBAC

### Keycloak Workflows (Technology Preview)

Declarative automation for identity lifecycle events (send emails, enforce policies, audit actions).

| File | Trigger | Action | Result |
|------|---------|--------|--------|
| `welcome-onboarding.yaml` | `user-created` event | Send welcome email via `notify-user` step | New user receives onboarding email |
| `inactive-cleanup.yaml` | Daily schedule + `user-last-login-before(180d)` filter | Warn user → 7d delay → disable account | Automatically deactivates 180+ day inactive accounts |
| `join-request-approval.yaml` | `user-attribute-updated` with `join-request-org` attribute | Notify org admins (group `/Admin`) | Org admins approve/reject join requests |
| `password-rotation.yaml` | Daily schedule + `user-attribute-equals(passwordRotationEnabled, true)` | Warn user → 7d delay → require password update | Enforces periodic password rotation |

**Workflow Features:**
- Template variables: `${user.firstName}`, `${user.lastName}`, `${user.email}`, `${realm.displayName}`, `${user.attributes.<name>}`, `${org.name}`
- Conditions: `user-last-login-before(Nd)`, `user-attribute-equals(key, value)`, `is-in-group(path)`
- Actions: `notify-user` (email), `set-user-attribute`, `log-message`, `add-to-group`, `set-required-action`
- Scheduling: cron syntax (daily, hourly, etc.) with `batch-size` for large user sets

**Workflow Requirements:**
- Feature flag: `--features=preview` or specific flags in KC startup command (defined in docker-compose.yml)
- SMTP: must be configured in realm (uses Mailpit at `mailpit:1025` in dev)
- Email templates: stored in KC theme (customizable via FTL)

### Scope Mappers
- **Audience Mapper** (for access token): adds `aud` claim (client ID)
- **Full Name Mapper** (for ID token): maps user's first + last name to `name` claim
- **User Attribute Mapper**: adds custom user attributes to tokens (e.g., `department`, `cost-center`)

### Realm Security Settings
- **Password Policy**: min 8 chars, at least one uppercase, one lowercase, one number
- **Session Timeout**: 30 min idle, 24h max
- **Login Timeout**: 5 min
- **OTP Policy**: enabled via WebAuthn/Passkeys (Keycloak 26+ technology preview)
- **Brute Force Protection**: max 30 failed login attempts, lockout 15 min
