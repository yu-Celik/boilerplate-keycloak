<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-04-04 -->

# types

## Purpose
TypeScript type definitions: NextAuth v5 module augmentations (Session, JWT), Keycloak entity interfaces (Organization, OrgMember, OrgInvitation, OrgGroup), and application types (OrgRole, OnboardingState). TypeScript 6.0 with `verbatimModuleSyntax: true`.

## Key Files

| File | Description |
|------|-------------|
| `index.ts` | NextAuth Session/JWT augmentation + exported interfaces: Organization, OrgMember, OrgInvitation, OrgGroup, OrgRole, OnboardingState. Session includes `organization` claim and error field for RefreshTokenError |
| `free-email-domains.d.ts` | Type declaration for the `free-email-domains` npm package (exports `string[]`) |

## For AI Agents

### Working In This Directory
- Session augmentation uses inline types (not references to exported types) because TS module augmentations have limited scope
- TypeScript 6.0 with `verbatimModuleSyntax: true` — explicit import types required
- `OrgRole = "admin" | "manager" | "member"` — maps to org group names `/Admin`, `/Managers`, `/Members`
- `Session.organization` is `Record<string, { id: string; groups?: string[] }> | null` — null for zero-org users
- `Session.error` is optional — set to "RefreshTokenError" when token refresh fails

<!-- MANUAL: -->
