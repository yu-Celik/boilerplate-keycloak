# Boilerplate Keycloak + Next.js

A production-ready boilerplate for **Keycloak + Next.js + Keycloakify**, fully containerized with Docker Compose. Clone, configure, and run — everything works out of the box.

## Quick Start

```bash
git clone <repo-url> my-project
cd my-project
cp .env.example .env

# Generate a secret for Next.js sessions
echo "NEXTAUTH_SECRET=$(openssl rand -base64 32)" >> .env

# Set the client secrets (must match realm-export.json)
echo "KC_CLIENT_SECRET=boilerplate-app-secret" >> .env
echo "KC_SERVICE_ACCOUNT_CLIENT_SECRET=boilerplate-service-secret" >> .env

# Start everything
make up
```

Once started:
- **Keycloak Admin**: http://localhost:3991 (admin / admin)
- **Next.js App**: http://localhost:3990
- **Mailpit** (email viewer): http://localhost:3992
- **Test user**: user@demo.com / password

## Architecture

```
Browser
  │
  ├── localhost:3990 ──► Next.js (App Router)
  │     │                  ├── Auth.js (OIDC consumer)
  │     │                  ├── Dashboard pages (shadcn/ui)
  │     │                  └── KC Admin API client (service account)
  │     │
  │     ▼ backchannel (Docker internal: keycloak:8080)
  │
  ├── localhost:3991 ──► Keycloak (nightly)
  │                        ├── Realm: boilerplate
  │                        ├── Organizations (demo-org)
  │                        ├── Keycloakify themes (Login + Account)
  │                        └── PostgreSQL 16 (internal)
  │
  └── localhost:3992 ──► Mailpit (captures KC emails)
```

**Next.js is a pure OIDC consumer.** It never handles login forms, passwords, or MFA. All authentication UI is rendered by Keycloak via Keycloakify themes.

## Services

| Service | URL | Purpose |
|---------|-----|---------|
| Keycloak | http://localhost:3991 | Identity provider, OIDC, organizations |
| Next.js | http://localhost:3990 | Application (dashboard, org management) |
| Mailpit | http://localhost:3992 | Email viewer (reset password, invitations) |
| PostgreSQL | internal only | Keycloak database |

## Auth Flow

1. User visits `localhost:3990` → redirected to KC login (Keycloakify themed)
2. User logs in → KC issues JWT with `organization` claims
3. Auth.js callback receives tokens → stores in encrypted cookie
4. Next.js reads JWT claims → displays org dashboard
5. Logout → KC sends backchannel POST to Next.js → session invalidated

## Organizations

Organizations are enabled by default. The demo realm includes:
- Organization **demo-org** with test user as member
- JWT claim structure:
```json
{
  "organization": {
    "demo-org": {
      "id": "uuid...",
      "groups": []
    }
  }
}
```

The `organization` scope uses two combined mappers:
- Organization Membership (includes org ID and attributes)
- Organization Group Membership (includes group paths)

## Modular Features

All features are **disabled by default**. Enable by uncommenting in `.env`:

| Feature | Env Variable | What it does |
|---------|-------------|-------------|
| Passkeys | `KC_FEATURE_PASSKEYS=enabled` | Passwordless login via WebAuthn |
| DPoP | `KC_FEATURE_DPOP=enabled` | Token proof-of-possession (anti-theft) |
| Token Exchange | `KC_FEATURE_TOKEN_EXCHANGE_STANDARD=enabled` | Service-to-service token exchange |
| Step-up Auth | `KC_FEATURE_STEP_UP_AUTHENTICATION=enabled` | Demand higher LoA for critical actions |
| Recovery Codes | `KC_FEATURE_RECOVERY_CODES=enabled` | Backup codes for lost OTP devices |
| JS Policies | `KC_FEATURE_SCRIPTS=enabled` | JavaScript-based auth policies |

See `docs/features/` for detailed guides on each feature.

## Makefile Commands

| Command | Description |
|---------|-------------|
| `make up` | Start all services + init realm data |
| `make down` | Stop all services |
| `make logs` | Follow all service logs |
| `make reset` | Delete volumes and restart fresh |
| `make build-theme` | Build Keycloakify JAR |
| `make init-realm` | Create demo org + test user membership |
| `make export-realm` | Export current KC realm to configs/ |
| `make backup` | Backup PostgreSQL database |

## Project Structure

```
boilerplate-keycloak/
├── docker-compose.yml          # 4 services: KC, PG, Next.js, Mailpit
├── .env.example                # All variables documented
├── Makefile                    # Dev commands
│
├── app/                        # Next.js (App Router)
│   ├── Dockerfile
│   ├── src/app/
│   │   ├── proxy.ts            # Auth middleware
│   │   ├── api/auth/           # Auth.js routes + backchannel logout
│   │   ├── (auth)/             # Login/logout redirects
│   │   └── (dashboard)/        # Protected pages (members, invitations, etc.)
│   └── src/lib/
│       ├── auth.ts             # Auth.js config (KC provider, refresh rotation)
│       └── keycloak-admin.ts   # KC Admin API client (service account)
│
├── keycloakify/                # KC themes in React
│   ├── src/login/pages/        # 14 login page components
│   ├── src/account/pages/      # 6 account page components (SPA)
│   └── dist/                   # Built JAR (gitignored)
│
├── configs/
│   ├── realm-export.json       # KC realm config (auto-imported)
│   └── init-realm.sh           # Creates demo org via Admin CLI
│
├── backups/
│   └── pg-backup.sh            # PostgreSQL backup script
│
└── docs/features/              # Feature activation guides
    ├── passkeys.md
    ├── dpop.md
    ├── token-exchange.md
    ├── step-up-auth.md
    └── recovery-codes.md
```

## Keycloakify Themes

The boilerplate includes custom React themes for Keycloak:

**Login theme** (14 pages): Login, LoginPassword, Register, Reset Password, Verify Email, Update Profile, Update Password, OTP, WebAuthn, Select Organization, IdP Review Profile, Terms, Error, Consent

**Account theme** (SPA): Personal Info, Signing In, Device Activity, Applications, Linked Accounts, Groups

To develop themes:
```bash
cd keycloakify
npm install
npm run storybook    # Visual development without KC
npm run build        # Build JAR
```

## Troubleshooting

**KC won't start?**
- Check logs: `docker compose logs keycloak`
- If realm import fails, the realm may already exist. Run `make reset` for a fresh start.

**Nightly image broke?**
- Pin a specific version in `.env`: `KC_IMAGE_TAG=nightly-2026-03-30`

**Emails not appearing in Mailpit?**
- Verify SMTP config in KC Admin: Realm Settings > Email tab
- Check that `host` is `mailpit` and `port` is `1025`

**Auth.js session issues?**
- Ensure `NEXTAUTH_SECRET` is set in `.env`
- Ensure `KC_CLIENT_SECRET` matches the secret in `realm-export.json`

## License

MIT
