<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-04-04 -->

# features/organization/components

## Purpose
Organization UI components — team switcher for changing active organization.

## Key Files

| File | Description |
|------|-------------|
| `team-switcher.tsx` | Client component — dropdown showing "Tous" (`__all__` cross-org mode), individual orgs by alias, and "Créer une organisation" link. Uses `useTransition()` for optimistic update and server action call. Displays spinner during async org switch. |

## For AI Agents

### Working In This Directory
- `team-switcher.tsx` has `"use client"` directive — uses React hooks
- Imports `switchOrg` server action from `@/features/organization/actions/switch-org.ts`
- Manages local `currentOrg` state for optimistic UI update

### Team Switcher Pattern
```typescript
"use client";

const [currentOrg, setCurrentOrg] = useState<string>(activeOrgAlias);
const [isPending, startTransition] = useTransition();

function handleSwitch(alias: string) {
  setCurrentOrg(alias)                    // 1. Optimistic UI update
  startTransition(async () => {
    await switchOrg(alias)                // 2. Server action sets cookie
    router.refresh()                      // 3. RSC re-render with new org
  })
}

return (
  <select value={currentOrg} onChange={(e) => handleSwitch(e.target.value)}>
    <option value="__all__">Tous</option>
    {orgs.map(org => (
      <option key={org.alias} value={org.alias}>
        {org.name}
      </option>
    ))}
  </select>
);
```

### UI States
- **Idle**: show current org in dropdown
- **Pending**: show spinner, disable interactions
- **Complete**: display new org, re-render page content
- **Error**: revert optimistic state, show error toast

### Placement Guidelines
- Rendered in app sidebar or header navigation
- Receives `activeOrgAlias` and `orgs` props from RSC parent
- Must be wrapped in Suspense boundary if data is async

### Cross-Org Mode
- `__all__` value enables platform-wide dashboard views
- Shows aggregated data across all user's organizations
- Some pages may branch behavior based on `orgId === null` check
