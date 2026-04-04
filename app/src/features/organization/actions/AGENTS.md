<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-04-04 -->

# features/organization/actions

## Purpose
Server actions for organization operations — switching active organization and managing org settings.

## Key Files

| File | Description |
|------|-------------|
| `switch-org.ts` | Server action: `switchOrg(orgAlias)`. Sets `active-org` httpOnly cookie to org alias. Called by team switcher component on client; performs server-side cookie mutation. Returns success/error result. |

## For AI Agents

### Working In This Directory
- All server actions use `"use server"` directive
- Access cookies via `cookies()` from Next.js server utilities
- No direct session mutation — cookie-based org selection
- Verify org alias exists before setting cookie (prevent cookie poisoning)

### Switch Org Pattern
```typescript
// Called from client component after user selects new org
const result = await switchOrg(orgAlias);

// Sets httpOnly cookie:
// cookies().set('active-org', orgAlias, {
//   httpOnly: true,
//   secure: process.env.NODE_ENV === 'production',
//   maxAge: 60 * 60 * 24 * 365  // 1 year
// })

// Client then calls router.refresh() to re-render RSC with new org context
```

### Error Handling
- Invalid org alias → error message returned to client
- User not member of org → error raised to prevent unauthorized access
- Cookie set failure → caught and logged

### Cookie-Based Design
- Cookie read by `getActiveOrgId()` during RSC render
- Allows switching orgs without full session re-auth
- Falls back to first org if cookie missing or invalid
- `__all__` special value enables cross-org dashboard view
