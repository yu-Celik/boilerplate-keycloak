<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-04-04 -->

# features/settings

## Purpose
Organization settings feature — manage auto-join configuration and domain verification.

## Key Files

| File | Description |
|------|-------------|
| `auto-join-toggle.tsx` | Client component — toggle switch for auto-join setting. Shows enabled/disabled state and error messages. Calls server action to persist change. |
| `domain-manager.tsx` | Client component — form to add/remove verified domains for organization. Domain verification required for auto-join functionality. Shows list of current domains with removal controls. |
| `page.tsx` | Settings page layout — renders org-scoped settings UI including auto-join toggle and domain manager. Protected by org admin role. |

## For AI Agents

### Working In This Directory
- All components have `"use client"` directive — client-side state and forms
- Settings are org-scoped — displayed only for active organization
- Changes require org admin role (checked in app route)

### Auto-Join Configuration
- When enabled, users with verified domain are auto-added to org during login
- Requires at least one verified domain to be effective
- Reduces manual invitation workflow for organization members

### Domain Verification Pattern
```typescript
// Add domain to org (must be verified)
await addVerifiedDomain(orgId, domain);

// Remove domain
await removeVerifiedDomain(orgId, domain);

// Check if org has auto-join enabled
const isEnabled = await isAutoJoinEnabled(orgId);

// Check if specific domain is verified
const isVerified = await hasVerifiedDomain(orgId, domain);
```

### UI Patterns
- Auto-join toggle shows spinner while async operation in progress
- Domain form shows validation errors (e.g., invalid domain format)
- Confirmation dialog before removing domain from organization
- Toast notifications for success/failure
