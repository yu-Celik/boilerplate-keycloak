<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-04-04 (updated) -->

# features

## Purpose
Feature-based module structure for domain-driven design. Each feature is self-contained with its own server-side libraries, React components, and TypeScript types. Features implement business logic for authentication, organization management, team invitations, member management, platform administration, and onboarding.

## Subdirectories

| Directory | Purpose |
|-----------|---------|
| `auth/` | Authentication — NextAuth config, OIDC with Keycloak, JWT token refresh, types (see `auth/AGENTS.md`) |
| `auth/lib/` | NextAuth configuration and token management |
| `auth/components/` | Login redirect and logout button components |
| `admin/` | Platform administration — super-admin operations for org lifecycle (see `admin/AGENTS.md`) |
| `admin/lib/` | Super-admin operations for platform management |
| `invitations/` | Team invitations — send/revoke/accept invitations, pending banner, file-based role store (see `invitations/AGENTS.md`) |
| `invitations/lib/` | Invitation management and role store utilities |
| `invitations/actions/` | Server actions for accepting invitations |
| `invitations/components/` | UI components for invitation display and management |
| `members/` | Organization members — list members, manage groups, role-based RBAC (see `members/AGENTS.md`) |
| `members/lib/` | Member management and role-based authorization |
| `organization/` | Multi-tenancy core — org CRUD, active org resolution, email domain utils, shared keycloak-client (see `organization/AGENTS.md`) |
| `organization/lib/` | Organization CRUD, active org resolution, email domain utilities |
| `organization/actions/` | Server actions for organization operations |
| `organization/components/` | Team switcher and organization UI components |
| `shared/` | Shared utilities, constants, and components |
| `shared/lib/` | Keycloak client and user utilities |
| `shared/constants/` | Organization group definitions |
| `settings/` | Org settings — auto-join toggle, domain verification, email domain configuration |
| `onboarding/` | New user onboarding — org creation wizard, initial setup flow |

## For AI Agents

### Working In This Directory
- Each feature is independent — internal lib imports use `@/features/[feature]/lib/`
- Cross-feature imports are allowed and encouraged for code reuse
- Do not add `"use client"` to `lib/` files — they are server-only
- Feature `types.ts` should be lightweight and feature-specific
- Global types live in `@/types/index.ts`

### Feature Import Pattern
```typescript
// Within a feature (e.g., invitations)
import { adminFetch } from "@/features/organization/lib/keycloak-client";
import type { Organization } from "@/features/organization/types";

// From another feature (e.g., app route)
import { getPendingInvitationsForUser } from "@/features/invitations/lib/invitations-admin";
import { switchOrg } from "@/app/(dashboard)/actions";
```

### Shared Admin API
The `keycloak-client.ts` in organization/lib is shared across all features:
- Provides service account token caching with 30s expiry buffer
- `adminFetch(path, init)` helper injects Bearer token automatically
- Used by invitations, members, organization, and admin features
