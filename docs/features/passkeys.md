# Passkeys / WebAuthn

## Enable

Uncomment in `.env`:

```env
KC_FEATURE_PASSKEYS=enabled
```

Restart Keycloak: `make reset`

## What changes

- Login page shows "Use a Passkey" option (Conditional UI or modal)
- Users can register Passkeys in Account Console > Signing In
- Passwordless authentication supported

## KC Configuration

After enabling, go to KC Admin Console:
1. Authentication > Policies > WebAuthn Passwordless Policy
2. Toggle "Enable Passkeys" to On

## Keycloakify

The `WebauthnAuthenticate.tsx` page renders automatically when KC requires Passkey authentication.
