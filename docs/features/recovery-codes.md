# Recovery Codes

## Enable

Uncomment in `.env`:

```env
KC_FEATURE_RECOVERY_CODES=enabled
```

Restart Keycloak: `make reset`

## What it does

Provides backup codes that users can use if they lose their OTP device (phone, authenticator app). Users generate recovery codes from the Account Console and store them securely.

## User flow

1. User goes to Account Console > Signing In
2. Sets up OTP (authenticator app)
3. Generates recovery codes
4. Stores codes safely (printed, password manager)
5. If OTP device is lost, uses a recovery code to log in

## KC Configuration

No additional KC configuration needed beyond enabling the feature flag. The Account Console automatically shows the recovery codes option.
