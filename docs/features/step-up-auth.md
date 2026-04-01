# Step-up Authentication

## Enable

Uncomment in `.env`:

```env
KC_FEATURE_STEP_UP_AUTHENTICATION=enabled
```

Restart Keycloak: `make reset`

## What it does

Allows your app to request a higher Level of Assurance (LoA) for critical actions. For example, a user logged in with password (LoA 1) can be prompted for 2FA (LoA 2) before making a payment.

## How to trigger from Next.js

```typescript
// Redirect to KC with acr_values to demand higher LoA
signIn("keycloak", {
  redirectTo: "/payment",
  authorizationParams: {
    acr_values: "gold"  // or a numeric LoA level
  }
});
```

KC will automatically prompt for the additional authentication step (OTP, Passkey, etc.) if the current session doesn't meet the required LoA.

## KC Configuration

1. Authentication > Flows > Browser
2. Configure step-up authentication with conditional OTP/WebAuthn
3. Map ACR values to LoA levels in Realm Settings
