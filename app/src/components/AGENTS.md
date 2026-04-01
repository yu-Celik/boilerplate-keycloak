<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-04-01 | Updated: 2026-04-01 -->

# components

## Purpose
Shared React components: the TeamSwitcher for multi-org navigation with instant UI feedback and Radix-based UI primitives.

## Key Files

| File | Description |
|------|-------------|
| `team-switcher.tsx` | Client component (`"use client"`) — dropdown showing "Tous" (cross-org view), org list, and "Créer une organisation" link. Uses `useTransition()` for instant UI feedback. Sets `active-org` cookie via server action. Single-org users see plain text (no dropdown). |

## Subdirectories

| Directory | Purpose |
|-----------|---------|
| `ui/` | Radix UI primitive wrappers (button, dialog, dropdown, toast, etc.) |

## For AI Agents

### Working In This Directory
- `team-switcher.tsx` is `"use client"` — uses React state + `useTransition()` for async operations
- Uses `switchOrg()` server action to set `active-org` cookie with httpOnly flag
- UI updates instantly via `setCurrentOrg()` (optimistic update), then server revalidates via `router.refresh()`
- Org switching flow: user clicks → state updates (instant UI) → server action sets cookie → page revalidates
- Single-org check: `orgEntries.length <= 1 && activeOrg !== "__all__"` → show plain text, no dropdown
- Multi-org users see: "Tous" option + org list + "Créer une organisation" link in dropdown menu

<!-- MANUAL: -->
