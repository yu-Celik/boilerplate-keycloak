<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-04-04 -->

# features/shared/constants

## Purpose
Shared constants used across multiple features — organization group definitions and other common values.

## Key Files

| File | Description |
|------|-------------|
| `org-groups.ts` | Organization group constants: `ORG_GROUPS.ADMIN`, `ORG_GROUPS.MANAGERS`, `ORG_GROUPS.MEMBERS`. Maps to Keycloak group paths (`/Admin`, `/Managers`, `/Members`). Used in role assignment, authorization checks, and member management. |

## For AI Agents

### Working In This Directory
- All constants are immutable and exported as named exports
- Used to prevent hardcoding group names/paths in multiple places
- Single source of truth for org role/group structure

### Organization Group Constants
```typescript
// Import group constants
import { ORG_GROUPS } from '@/features/shared/constants/org-groups';

// Use in member management:
await addMemberToGroup(userId, orgId, ORG_GROUPS.ADMIN);

// Use in authorization:
await assertOrgRole(orgId, userEmail, [ORG_GROUPS.ADMIN]);

// Constants map to KC paths:
// ORG_GROUPS.ADMIN = "/Admin" (org admins)
// ORG_GROUPS.MANAGERS = "/Managers" (org managers)
// ORG_GROUPS.MEMBERS = "/Members" (regular members)
```

### Adding New Constants
- Add to `org-groups.ts` for role/group definitions
- Create new files as needed for feature-specific constants
- Export as named exports only (avoid default exports)
- Document the purpose and usage in comment headers
