<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-04-04 | Updated: 2026-04-04 -->

# docs

## Purpose
Feature documentation for advanced Keycloak 26+ Technology Preview capabilities integrated into the boilerplate. Each doc describes a specific feature: implementation, configuration, security considerations, and integration patterns with Next.js and the SaaS application layer.

## Key Files

| File | Description |
|------|-------------|
| `features/passkeys.md` | WebAuthn/Passkeys (FIDO2) passwordless authentication. Covers KC setup, browser support matrix, fallback flows, user registration/login, security best practices. |
| `features/token-exchange.md` | Token Exchange (RFC 8693) for inter-service authentication. Describes server-to-server token exchange, multi-microservice topologies, security implications. |
| `features/recovery-codes.md` | Recovery codes for account recovery after losing second factor or passkeys. Generation, storage, redemption flows. |
| `features/dpop.md` | DPoP (Demonstration of Proof-of-Possession, RFC 9449) for token binding. Prevents token theft/replay attacks. Implementation in Next.js client + Keycloak. |
| `features/step-up-auth.md` | Step-up authentication (context-aware multi-factor) for sensitive operations. Trigger re-authentication conditionally based on action/role. |

## Subdirectories

| Directory | Purpose |
|-----------|---------|
| `features/` | Individual feature documentation (Markdown files for each advanced KC capability) |

## For AI Agents

### Working In This Directory
- Each `.md` file documents a specific Keycloak 26+ Technology Preview feature
- Files are written for developers implementing or integrating the feature
- Include concrete code examples, configuration snippets, security warnings
- Reference the corresponding realm configuration in `configs/realm-export.json`
- Link to Keycloak official docs for upstream context

### Documentation Structure
Each feature doc should include:
1. **Overview** — what the feature does, why it matters
2. **Prerequisites** — Keycloak version, feature flags, client/realm config
3. **Configuration** — realm-export.json settings, scope mappers, client settings
4. **Integration** — Next.js implementation (lib/keycloak-admin.ts, server actions, etc.)
5. **Security** — threats mitigated, best practices, common pitfalls
6. **Testing** — manual test flows, validation steps
7. **Troubleshooting** — common issues, debugging tips

### Feature Flags

All Technology Preview features require explicit KC feature flags:

| Feature | Flag | Status |
|---------|------|--------|
| Passkeys/WebAuthn | `--features=passkeys` or `KC_FEATURE_PASSKEYS=enabled` | Technology Preview (Keycloak 26+) |
| Token Exchange | `--features=token_exchange_standard` or `KC_FEATURE_TOKEN_EXCHANGE_STANDARD=enabled` | Technology Preview (RFC 8693) |
| Recovery Codes | `--features=recovery_codes` | Technology Preview (Keycloak 26+) |
| DPoP | `--features=dpop` or `KC_FEATURE_DPOP=enabled` | Technology Preview (RFC 9449) |
| Workflows | `--features=preview` or `KC_FEATURE_WORKFLOWS=enabled` | Technology Preview (Keycloak 26.5+) |

Flags are set in docker-compose.yml via environment variables or KC startup command.

### Keycloak 26+ Architecture

These features are built on:
- **Flows & Authenticators** — pluggable auth steps (password → OTP → WebAuthn)
- **Required Actions** — user-facing setup tasks (verify email, configure passkey, etc.)
- **Scope Mappers** — add claims to tokens (e.g., acr, authenticators list)
- **Token Exchange** — service-to-service token generation
- **Workflows** — declarative event automation (YAML DSL)
- **Fine-Grained Permissions V2** — resource-based RBAC with scopes

### Integration Patterns

**Passkeys (WebAuthn)**
- KC provides registration/login pages (custom theme in keycloakify/)
- User authenticates with platform authenticator (Face ID, Touch ID, security key)
- Next.js receives passkey assertion in token; no password stored

**Token Exchange**
- Microservice A exchanges its token for a service-specific token (scoped to service B)
- Uses `urn:ietf:params:oauth:grant-type:token-exchange` grant
- Server-to-server, requires KC_SERVICE_ACCOUNT_CLIENT_SECRET

**DPoP (Proof-of-Possession)**
- Client creates ephemeral keypair, signs each HTTP request with `DPoP` header
- KC validates signature; token becomes bound to client's key
- Prevents stolen tokens from being usable (token + key replay protection)

**Step-Up Auth**
- Action requires re-authentication (e.g., sensitive data export, billing change)
- Next.js Server Action calls KC Admin API to prompt re-auth
- User completes additional challenge (password, passkey, MFA)
- KC re-issues token with fresh `auth_time` claim

**Recovery Codes**
- Generated during passkey setup or MFA enrollment
- User stores codes securely offline
- If user loses device, uses recovery code to bypass 2FA temporarily
- Single-use codes; one code = one login

### Security Considerations

**Passkeys**
- Browser/device stores private key (never shared with KC)
- Public key stored in KC userbase
- No password fallback; plan for recovery codes + backup authenticators

**Token Exchange**
- Service tokens are scoped to specific resource (KC resource server)
- Cannot be used interchangeably; each service gets dedicated token
- Requires strong client credentials (KC_SERVICE_ACCOUNT_CLIENT_SECRET)

**DPoP**
- Ephemeral public key bound to token
- Stolen token unusable without corresponding private key
- Requires JWT signed with RS256 (cryptographic cost; use sparingly)

**Step-Up Auth**
- Use for high-risk operations only (payment, data export, role changes)
- Set `max_age=0` in re-auth request to force fresh login
- Track `auth_time` claim to ensure re-auth happened recently

## Dependencies

### Internal
- `../app/` — Next.js implements features via Server Actions, keycloak-admin.ts
- `../keycloakify/` — custom login theme pages (passkey setup, organization selection)
- `../configs/realm-export.json` — realm configuration enabling features

### External
- **Keycloak** 26.0+ (nightly)
- **Next.js** 16.2.2 with Server Actions
- **jose** 6.2.2 — JWT signing/verification (for DPoP signatures)
- **@simplewebauthn/browser**, **@simplewebauthn/server** (optional, for DPoP client library)

