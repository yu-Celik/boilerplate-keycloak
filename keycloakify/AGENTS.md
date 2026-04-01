<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-04-01 | Updated: 2026-04-01 -->

# keycloakify

## Purpose
Custom Keycloak login theme built with React using Keycloakify v11. Provides branded registration, login, OTP, WebAuthn/Passkeys, organization selection, and error pages.

## Key Files

| File | Description |
|------|-------------|
| `package.json` | Dependencies: keycloakify ^11.15.3, react 18, vite, typescript |
| `vite.config.ts` | Keycloakify vite plugin with `accountThemeImplementation: "Single-Page"`, `themeName: "boilerplate-keycloak"` |
| `tsconfig.json` | TypeScript configuration |

## Subdirectories

| Directory | Purpose |
|-----------|---------|
| `src/` | Theme source code (login pages: Login.tsx, Register.tsx, etc.) |
| `dist/` | Built theme JARs (mounted to `/opt/keycloak/providers/` in Docker) |
| `.storybook/` | Storybook configuration for theme preview and visual development |

## For AI Agents

### Working In This Directory
- Run `npm install && npm run build` to build the theme JAR
- Output goes to `dist/` which is mounted as a Docker volume to `/opt/keycloak/providers/`
- After building, **restart Keycloak** to reload the theme
- Theme name `boilerplate-keycloak` is used for login page only (realm config: `loginTheme: "boilerplate-keycloak"`)
- Account management uses Keycloak's built-in `keycloak.v3` theme (set in realm-export.json)
- **dist/ is git-ignored** — must build locally before Keycloak can use custom login theme

### Testing Requirements
- `npm run storybook` for visual preview of login pages (runs on port 6006)
- Test in browser after Keycloak restart: `http://localhost:3991/realms/boilerplate/account`
- Verify form validation, error messages, passkey flows

### Common Patterns
- Each page component maps to a Keycloak FTL template (e.g., `Register.tsx` → `register.ftl`)
- Uses Keycloakify's `useGetClassName()` hook for CSS class naming
- Uses `Template` wrapper component from keycloakify for Keycloak-specific props

<!-- MANUAL: -->
