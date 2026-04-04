<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-04-04 -->

# keycloakify

## Purpose
Custom Keycloak login + account themes built with React 19 using Keycloakify v11.15.3. Provides branded registration, login, OTP, WebAuthn/Passkeys, organization selection, account management, and error pages. **Tailwind v4 CSS-first styling; PatternFly eliminated (`doUseDefaultCss=false`).**

## Key Files

| File | Description |
|------|-------------|
| `package.json` | keycloakify 11.15.3, react 19.2.4, react-dom 19.2.4, vite 8.0.3, typescript 6.0.2, Radix UI, Tailwind v4.2.2, lucide-react 1.7.0, CVA, clsx, tailwind-merge |
| `vite.config.ts` | Keycloakify Vite plugin: `accountThemeImplementation: "Single-Page"`, `themeName: "boilerplate-keycloak"`, `doUseDefaultCss: false` (no PatternFly) |
| `tsconfig.json` | TypeScript 6.0, strict mode, `verbatimModuleSyntax: true`, JSX strict mode |
| `postcss.config.js` | Tailwind CSS v4.2.2 PostCSS plugin |
| `src/index.tsx` | Vite entry point, Keycloakify initialization |
| `src/globals.css` | Tailwind v4 (CSS-first): `@import "tailwindcss"`, `@import "../../../shared/theme-tokens.css"`, `@theme`, `@plugin` |
| `src/login/` | Login theme pages: Login.tsx, Register.tsx, RegisterUserProfile.tsx, VerifyEmail.tsx, UpdateUserProfile.tsx, UpdatePassword.tsx, WebAuthnRegister.tsx, WebAuthnAuthenticate.tsx, Error.tsx, etc. |
| `src/account/` | Account management pages (modern `keycloak.v3` theme). Minimal customization; uses KC built-in account UI. |
| `dist/` | Built theme JAR files (git-ignored). Mounted to `/opt/keycloak/providers/` at container start. |
| `.storybook/` | Storybook 8.3.3 config for visual component preview and development (port 6006). |

## Subdirectories

| Directory | Purpose |
|-----------|---------|
| `src/login/` | Custom login theme pages (Keycloakify FTL page adapters) |
| `src/account/` | Account management theme (Keycloak built-in v3 theme with minimal custom styling) |
| `src/components/` | Reusable React components for login pages (forms, inputs, buttons) |
| `src/lib/` | Utilities for Keycloakify pages (theme helpers, validation) |
| `dist/` | Built theme JAR output — mounted to Keycloak providers directory |

## For AI Agents

### Working In This Directory
- Install: `npm install`
- Dev (Storybook): `npm run dev` or `npm run storybook` (port 6006)
- Build theme JAR: `npm run build` (outputs to `dist/`)
- Type-check: `tsc -b && npm run build`
- After build: `docker compose restart keycloak` to reload theme
- **Tailwind CSS v4 CSS-first** — config in `src/globals.css` using `@import`, `@theme`, `@plugin`. Never create `tailwind.config.ts`.
- **No PatternFly** — `doUseDefaultCss=false` in vite.config.ts. Use Tailwind utilities directly; never use `kcClsx()`.

### Theme Architecture
- **Login theme** (`loginTheme: "boilerplate-keycloak"` in realm-export.json)
  - Custom branded pages: registration, login, OTP, WebAuthn, error handling
  - Each page file (e.g., `Login.tsx`) maps to a Keycloak FTL template name (e.g., `login.ftl`)
  - Keycloakify generates FTL at build time from React component
- **Account theme** (`accountTheme: "keycloak.v3"` in realm-export.json)
  - Uses Keycloak's modern built-in v3 account theme
  - Custom styling applied via `src/account/` overrides (minimal changes)

### Keycloakify Page Components
- Each page receives `Keycloak` context from Keycloakify's `useKeycloakify()` hook
- Props include:
  - `kcContext` — Keycloak FTL context (user, realm, client, etc.)
  - `Template` — wrapper component that renders the FTL template shell
  - Access to Keycloak messages, localization, form data via kcContext

### Common Patterns
- **Form submission**: Keycloakify auto-generates HTML forms; React wraps with Tailwind styling
- **Validation**: Display KC-provided error messages or custom validation errors
- **Icons**: Use `lucide-react` exclusively
- **CSS**: Tailwind v4 utilities only; no custom CSS in component files
- **Components**: shadcn/ui patterns (Radix UI primitives + Tailwind) in `src/components/`
- **Organization selection**: Custom page for multi-org users to select initial org during login
- **Passkey/WebAuthn**: Dedicated pages for WebAuthn registration and authentication flows

### Testing Requirements
- `npm run storybook` to preview pages visually (port 6006)
- `npm run build` must succeed without errors
- After `docker compose restart keycloak`, test in browser:
  - http://localhost:3991/realms/boilerplate/protocol/openid-connect/auth (login flow)
  - Register, verify email, login, WebAuthn setup, organization selection
  - Check form validation, error messages, accessibility (ARIA labels)
- Verify theme is served: check browser DevTools for CSS coming from `/auth/realms/boilerplate/login/` path

### Build Output
- `npm run build` produces JAR files in `dist/`
- JAR contains compiled React components as FTL templates + CSS + JS assets
- Docker volume mounts `dist/` to `/opt/keycloak/providers/` (read-only)
- Keycloak auto-discovers and hot-loads JAR at startup

## Dependencies

### Internal
- `../../shared/theme-tokens.css` — imported by `src/globals.css` (blue-gray glassmorphism palette)
- `../../app/` — shares Tailwind v4 CSS-first approach and shadcn/ui component patterns

### External
- **Framework**: `react` 19.2.4, `react-dom` 19.2.4, `keycloakify` 11.15.3
- **Build**: `vite` 8.0.3
- **UI**: `@radix-ui/react-label` 2.1.8, `@radix-ui/react-separator` 1.1.8, `@radix-ui/react-slot` 1.2.4, `lucide-react` 1.7.0
- **Styling**: `@tailwindcss/postcss` 4.2.2, `tailwindcss` 4.2.2, `class-variance-authority` 0.7.1, `clsx` 2.1.1, `tailwind-merge` 3.5.0
- **Dev**: TypeScript 6.0.2, Storybook 8.3.3, Prettier 3.8.1, `@vitejs/plugin-react` 6.0.1
- **Tooling**: `postcss` 8.5.8, `@types/node` 25.5.2, `@types/react` 19.2.14, `@types/react-dom` 19.2.3

<!-- MANUAL: -->
