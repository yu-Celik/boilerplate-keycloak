<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-04-04 -->

# login/components

## Purpose
Reusable layout and layout components for login pages — header, footer, template wrapper with dark mode and locale switching.

## Key Files

| File | Description |
|------|-------------|
| `Template.tsx` | Layout shell for all login pages. Renders dark mode glassmorphism header with branding, locale switcher, error messages. Wraps page content in centered card with radial gradient background glows. Calls `useSetClassName()` to toggle dark mode. Uses `kcSanitize()` for user content XSS prevention. |
| `Footer.tsx` | Optional footer component — can include auth links, terms, support info. Conditionally rendered by pages. |

## For AI Agents

### Working In This Directory
- `Template.tsx` receives `children` (page content) and optional `active` prop for nav highlighting
- Both components use Tailwind v4 CSS-first styling
- No PatternFly kcClsx() — use plain Tailwind classes

### Template Component Pattern
```typescript
// Used by all login pages
export default function LoginPage(props: LoginPageProps<...>) {
  const { kcContext, i18n, Template } = props;

  return (
    <Template kcContext={kcContext} i18n={i18n}>
      <div className="space-y-4">
        {/* Page-specific content here */}
      </div>
    </Template>
  );
}
```

### Header Features
- Branding logo/icon (top left)
- Page title or description (center)
- Locale switcher (top right, if multiple languages enabled)
- Dark mode toggle (optional, managed by `useSetClassName()`)
- Error message banner (if KC error present)

### Layout Structure
```
┌─────────────────────────────────────┐
│ Header (Logo | Title | Locale)      │
├─────────────────────────────────────┤
│  Radial gradient background glows   │
│  ┌─────────────────────────────────┐│
│  │   Centered Card                 ││
│  │   - Form content                ││
│  │   - Error messages              ││
│  │   - Submit button               ││
│  └─────────────────────────────────┘│
│  Error message (if present)         │
└─────────────────────────────────────┘
```

### Dark Mode Integration
- `useSetClassName()` from keycloakify hooks
- Sets `html.dark` class when component mounts
- All Tailwind utilities respect dark mode via `.dark:` prefix

### Locale Switcher
```typescript
// Template receives enabledLanguages from i18n
// Renders select dropdown or flag buttons
// On change: submits form to switch language
// Keycloak handles locale cookie management
```

### Error Message Handling
```typescript
// Template displays errors from kcContext
const { errors } = kcContext;

// Render alert component:
{errors.map(error => (
  <Alert key={error.message} variant="destructive">
    {error.message}
  </Alert>
))}
```

### Footer Integration
- Some pages import and render Footer component
- Footer can show legal links, support, social media
- Conditionally shown based on page type (e.g., hidden on 2FA)

### Accessibility
- Semantic HTML (header, main, footer)
- ARIA labels on form fields
- Focus management in modal-like flows
- Color contrast meets WCAG AA standards
