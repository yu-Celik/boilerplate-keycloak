# Token Exchange (RFC 8693)

## Enable

Uncomment in `.env`:

```env
KC_FEATURE_TOKEN_EXCHANGE_STANDARD=enabled
```

Restart Keycloak: `make reset`

## What it does

Allows exchanging one token for another targeting a different audience (microservice). The new token has downscoped permissions — it can never exceed the original token's access.

## Use case

Your Next.js backend receives a user token and needs to call another microservice. Instead of forwarding the user's full token, it exchanges it for a scoped token targeting only that service.

## KC Configuration

1. Create the target client (the microservice)
2. Configure token exchange permissions between clients via KC Admin Console
