<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-04-04 -->

# shared

## Purpose
Shared assets and components for keycloakify theme — global styles, theme tokens, and cross-theme components.

## Key Files

| Directory | Purpose |
|-----------|---------|
| `components/` | Shared components used by both login and account themes (if any). |
| `globals.css` | (In parent src/ directory) — imported from shared folder. Global Tailwind v4 CSS with theme tokens. |
| `theme.css` | Theme-specific CSS variables and styles. |

## For AI Agents

### Working In This Directory
- `shared/` contains assets and components reusable across login and account themes
- Global styles defined in Tailwind v4 CSS-first approach
- Theme tokens (colors, spacing) centralized in CSS variables
- Custom components that don't fit shadcn/ui patterns

### Shared Components Pattern
```typescript
// If shared components exist, import from:
import { SharedComponent } from "@/shared/components";

// Example: shared form layout component
<FormLayout>
  <FormField>
    <Label>Field</Label>
    <Input />
  </FormField>
</FormLayout>
```

### Theme Tokens
- Color palette: blue-gray glassmorphism (primary, secondary, accent, muted)
- Spacing scale: standard Tailwind spacing (4px base unit)
- Typography: sans-serif font stack from Tailwind
- Shadows and effects: glassmorphism effect definitions

### Global Styles Location
- `src/globals.css` — Tailwind v4 imports and theme setup
- `src/shared/theme-tokens.css` — CSS variables for colors, spacing, effects
- `src/shared/theme.css` — additional theme-specific styles

### Styling Best Practices
- Use Tailwind utilities first (no custom CSS)
- Define complex effects in theme-tokens.css as reusable variables
- Dark mode: use `.dark:` prefix on utilities
- Never create new component CSS files — use components/ui instead

### Adding Shared Components
1. Create file in `shared/components/`
2. Use shadcn/ui components as building blocks
3. Style entirely with Tailwind classes
4. Export from barrel (index.ts) if multiple components
5. Document usage in AGENTS.md

### Theme Customization
- Update color values in theme-tokens.css
- Tailwind automatically uses CSS variables
- No rebuild needed — CSS changes instantly apply
- Test in both light and dark modes
