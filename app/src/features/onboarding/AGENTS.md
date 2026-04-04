<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-04-04 -->

# features/onboarding

## Purpose
User onboarding feature — create organization and add user to it during first login or manual account setup.

## Key Files

This directory contains the onboarding flow pages and logic.

## For AI Agents

### Working In This Directory
- Onboarding routes are in `app/src/app/(auth)/onboarding/`
- Provides UI for users with zero organizations to create their first org
- Post-onboarding: redirects to org dashboard
- Uses shared organization and auth utilities

### Onboarding Flow
1. User logs in with no organizations → middleware redirects to `/onboarding`
2. User enters organization name and optionally configures domain
3. Server action creates org and adds user with admin role
4. Session refreshed to include new org
5. Redirect to `/members` (dashboard)

### Key Utilities
- `createOrganization()` from `@/features/organization/lib/organization-admin.ts`
- `addMemberToGroup()` from `@/features/members/lib/members-admin.ts`
- `unstable_update()` from `@/features/auth/lib/auth.ts` for session refresh
- Domain classification via `@/features/organization/lib/email-domain.ts`

### Auto-Suggested Organization Name
- Extracted from user's email domain (if professional domain)
- Public domains (Gmail, Yahoo) → no suggestion
- Professional domain (acme.com) → "Acme" suggestion
- User can accept, modify, or enter custom name

### Error Handling
- Organization name already taken → error message + retry
- Invalid domain format → validation error + guidance
- Session refresh failure → caught and logged; user re-directed to re-auth
