# DPoP (Demonstrating Proof-of-Possession)

## Enable

Uncomment in `.env`:

```env
KC_FEATURE_DPOP=enabled
```

Restart Keycloak: `make reset`

## What it does

DPoP binds access and refresh tokens to a cryptographic key pair. Even if a token is stolen (e.g., via XSS), it cannot be used without the private key held by the client.

## KC Configuration

After enabling, in KC Admin Console:
1. Go to Clients > boilerplate-app > Settings
2. Under "Capability config", toggle "Require DPoP bound tokens"

## Impact on Next.js

Auth.js must send a DPoP proof header with token requests. This requires additional client-side configuration depending on your Auth.js version.
