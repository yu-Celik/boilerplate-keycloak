<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-04-01 | Updated: 2026-04-01 -->

# configs

## Purpose
Keycloak configuration files: realm export (organizations, clients, scopes, mappers), init scripts for bootstrapping, and declarative workflow YAML definitions for identity lifecycle automation.

## Key Files

| File | Description |
|------|-------------|
| `realm-export.json` | Full realm config: clients (boilerplate-app, boilerplate-service), scopes (organization, roles with mappers), default roles, SMTP, organizations enabled, accountTheme=keycloak.v3, **revokeRefreshToken: true**, **sslRequired: "external"** |
| `init-realm.sh` | Post-import script: creates demo org, assigns service account roles (manage-users, view-users, manage-realm, view-realm, manage-clients, view-clients) |

## Subdirectories

| Directory | Purpose |
|-----------|---------|
| `workflows/` | Keycloak Workflow YAML files (KC 26.5+ Technology Preview) for identity lifecycle automation |

## For AI Agents

### Working In This Directory
- `realm-export.json` uses `IGNORE_EXISTING` import strategy — changes only apply on fresh realm creation
- To apply changes to an existing realm, use `kcadm.sh` CLI commands in Keycloak container
- `init-realm.sh` runs automatically via `docker compose up` after realm import
- Workflows are mounted to `/opt/keycloak/data/import/workflows/` in the container at startup

### Key Realm Config
- `organizationsEnabled: true` — multi-tenant org support
- `registrationEmailAsUsername: true` — email as unique username
- `verifyEmail: true` — email verification required
- `accountTheme: keycloak.v3` — modern account management UI
- **`revokeRefreshToken: true`** — invalidate refresh tokens on logout (security best practice)
- **`sslRequired: "external"`** — allows HTTP on localhost (127.0.0.1), enforces HTTPS for external access
- `organization` scope with Organization Membership + Organization Group Membership mappers
- `roles` scope with realm roles, client roles, audience resolve mappers

### Clients
- `boilerplate-app` — OIDC client for Next.js
  - PKCE flow (confidential)
  - Backchannel logout enabled
  - Scopes: `openid profile email organization:*`
  - Valid redirect URIs: `http://localhost:3990/api/auth/callback/keycloak`, `https://*/api/auth/callback/keycloak`
- `boilerplate-service` — Service account for Admin API
  - Client credentials flow
  - Scopes: manage-users, view-users, manage-realm, view-realm, manage-clients, view-clients

<!-- MANUAL: -->
