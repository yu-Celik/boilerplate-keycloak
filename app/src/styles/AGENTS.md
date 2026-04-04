<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-04-04 -->

# styles

## Purpose
Shared CSS and theme tokens. Contains Tailwind CSS v4 theme variables and glassmorphism utilities. The `theme-tokens.css` file is the single source of truth for color tokens, imported by both the Next.js app and the Keycloakify custom login pages for consistent visual design across authentication flows.

## Key Files

| File | Description |
|------|-------------|
| `theme-tokens.css` | CSS custom properties (variables) for light and dark mode. Defines background, foreground, primary, secondary, accent, destructive, border, sidebar colors. Includes glassmorphism utilities (`--glass-bg`, `--glass-border`, `--glass-shadow`). Shared with `keycloakify/src/globals.css`. |

## For AI Agents

### Working In This Directory
- Use CSS custom properties (`--color-name`) only — no Tailwind-specific syntax
- Light mode uses `:root` selector; dark mode uses `.dark` selector
- All color values use HSL format: `hue saturation% lightness%` with optional alpha `/transparency`
- Theme tokens are imported in `app/src/app/globals.css` and `keycloakify/src/globals.css`

### Theme Token Pattern
```css
:root {
  --primary: 221 83% 53%;           /* HSL format */
  --primary-foreground: 210 40% 98%;
}

.dark {
  --primary: 217 91% 60%;           /* Override in dark mode */
  --primary-foreground: 222 47% 6%;
}
```

### Color System
- **Primary**: Main brand color (blue) — used for buttons, links, accents
- **Secondary**: Neutral secondary color — backgrounds, disabled states
- **Accent**: Highlights and attention — matches secondary (can be customized independently)
- **Destructive**: Red for dangerous actions (delete, cancel)
- **Sidebar**: Dedicated tokens for sidebar component styling
- **Glass**: Glassmorphism overlays — semi-transparent with blur effects

### Adding New Tokens
- Add both light (`:root`) and dark (`.dark`) versions
- Use HSL format consistently
- Document the purpose in comments
- Update related files: `app/src/app/globals.css` and keycloakify if needed

## Dependencies
- Tailwind CSS v4 — imports `@theme` for custom tokens in `app/src/app/globals.css`
- No external packages
