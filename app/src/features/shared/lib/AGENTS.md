<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-04-04 -->

# features/shared/lib

## Purpose
Shared library utilities for multiple features — Keycloak service account client and Keycloak user utilities.

## Key Files

| File | Description |
|------|-------------|
| `keycloak-client.ts` | **Alias/re-export of `@/features/organization/lib/keycloak-client.ts`** — shared service account authentication for Admin API. Provides `getServiceAccountToken()` and `adminFetch(path, init)`. Used by invitations, members, admin features. |
| `keycloak-user.ts` | User utility functions: `getCurrentUser()` retrieves current authenticated user from session. Returns `{ id, email, firstName, lastName, username }` or `null` if not authenticated. |

## For AI Agents

### Working In This Directory
- `keycloak-client.ts` is a re-export — the source of truth is `@/features/organization/lib/keycloak-client.ts`
- `keycloak-user.ts` wraps the `auth()` function from NextAuth
- Both utilities are used across multiple features to avoid duplication

### Shared User Utility Pattern
```typescript
// Get current authenticated user in Server Component or Server Action
const user = await getCurrentUser();
if (!user) {
  redirect('/login');
}

// User object: { id, email, firstName, lastName, username }
```

### Admin API Access
```typescript
// In any feature that needs Admin API:
import { adminFetch } from '@/features/shared/lib/keycloak-client.ts';

// Automatically authenticated with service account token
const data = await adminFetch('/organizations');
```

### Centralization Benefits
- Single source of truth for service account token management
- Consistent user object interface across codebase
- Prevents token re-authentication in multiple places
- Simplifies unit testing by centralizing mock points
