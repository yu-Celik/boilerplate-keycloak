<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-04-03 -->

# configs

## Purpose
Keycloak configuration files: the realm export JSON for reproducible realm setup, an init shell script for post-import bootstrapping, and declarative Workflow YAML files for identity lifecycle automation (Keycloak 26.5+ Technology Preview).

## Key Files

| File | Description |
|------|-------------|
| `realm-export.json` | Full Keycloak realm configuration. Imported at container startup via `--import-realm`. Defines clients, scopes, organization settings, SMTP, token policies, and theme. Import strategy: `IGNORE_EXISTING` — changes only apply on fresh realm creation, not to existing realms. |
| `init-realm.sh` | Post-import shell script run automatically by Docker. Creates a demo organization and assigns the service account (`boilerplate-service`) the required Admin API roles: `manage-users`, `view-users`, `manage-realm`, `view-realm`, `manage-clients`, `view-clients`. |

## Subdirectories

| Directory | Purpose |
|-----------|---------|
| `workflows/` | Keycloak Workflow YAML definitions (KC 26.5+ Technology Preview). Mounted into the KC container at `/opt/keycloak/data/import/workflows/` |

## For AI Agents

### Working In This Directory
- `realm-export.json` uses `IGNORE_EXISTING` import strategy — editing this file has **no effect** on an already-running Keycloak instance
- To apply realm changes to an existing instance: use the Admin Console UI or `kcadm.sh` CLI inside the Keycloak container
- Workflows are mounted read-only at container start — changes require `docker compose restart keycloak`
- The `init-realm.sh` script runs once on first start; it is idempotent but tied to the initial import

### Key Realm Configuration

| Setting | Value | Significance |
|---------|-------|-------------|
| `organizationsEnabled` | `true` | Enables KC Organizations feature (multi-tenancy) |
| `registrationEmailAsUsername` | `true` | Email address is the unique username |
| `verifyEmail` | `true` | Email verification required after registration |
| `revokeRefreshToken` | `true` | Refresh tokens are single-use — prevents token reuse attacks |
| `sslRequired` | `"external"` | HTTP allowed on `127.0.0.1`/`::1`; HTTPS enforced for all other clients |
| `accountTheme` | `keycloak.v3` | Modern account management UI |
| `loginTheme` | `keycloakify-starter` | Custom React-based login theme from `keycloakify/` |

### OIDC Clients

**`boilerplate-app`** — Next.js application client
- Confidential OIDC client with PKCE (`checks: ["pkce", "state"]`)
- Backchannel logout enabled (posts to `NEXTAUTH_URL/api/auth/backchannel-logout`)
- Default scopes: `openid profile email organization:*`
- Valid redirect URIs: `http://localhost:3990/api/auth/callback/keycloak`, `https://*/api/auth/callback/keycloak`

**`boilerplate-service`** — Admin API service account
- Client credentials grant (no user session)
- Service account roles: `manage-users`, `view-users`, `manage-realm`, `view-realm`, `manage-clients`, `view-clients`
- Used by `keycloak-admin.ts` for all Admin REST API calls

### Organization Scope Mappers
- **Organization Membership mapper** — adds `organization` claim to tokens with org metadata
- **Organization Group Membership mapper** — includes group paths (e.g., `/Admin`, `/Managers`) in the `organization` claim; used by `auth.ts` to derive `orgRole`

### Workflows

| File | Trigger | Action |
|------|---------|--------|
| `welcome-onboarding.yaml` | `user-created` event | Sends welcome email via `notify-user` step |
| `inactive-cleanup.yaml` | Daily schedule, `user-last-login-before(180d)` | Warns user, then disables account after 7 more days |
| `join-request-approval.yaml` | `user-attribute-updated` with `join-request-org` attribute | Notifies org admin of join request |
| `password-rotation.yaml` | Daily schedule, `user-attribute-equals(passwordRotationEnabled, true)` | Warns user, then sets `UPDATE_PASSWORD` required action after 7 days |

Workflows use KC template variables: `${user.firstName}`, `${user.lastName}`, `${user.email}`, `${realm.displayName}`, `${user.attributes.*}`.

### Workflow Limitations (Technology Preview)
- Workflows require `--features=preview` or specific feature flags in KC startup command
- Email delivery requires SMTP configuration in the realm (uses Mailpit in development: `mailpit:1025`)
- `batch-size` on scheduled workflows controls how many users are processed per run
