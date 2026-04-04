<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-04-04 -->

# styles

## Purpose
Additional styling assets for keycloakify theme — theme token definitions and global style files.

## Key Files

| File | Description |
|------|-------------|
| `theme-tokens.css` | CSS variables for color palette (primary, secondary, accent, muted, destructive), spacing, and effects. Blue-gray glassmorphism palette. Imported by globals.css. Used by Tailwind v4 via `@theme` directive. |

## For AI Agents

### Working In This Directory
- All styling via Tailwind v4 CSS-first approach
- Custom values defined as CSS variables in theme-tokens.css
- No custom component CSS files — use Tailwind utilities
- Dark mode variants available via `.dark:` prefix

### Theme Tokens Structure
```css
/* Color palette */
--primary: blue-500;
--primary-foreground: white;
--secondary: blue-600;
--secondary-foreground: white;
--accent: blue-400;
--accent-foreground: white;
--muted: gray-500;
--muted-foreground: gray-100;
--destructive: red-500;
--destructive-foreground: white;

/* Glassmorphism effects */
--glass-background: rgba(255, 255, 255, 0.08);
--glass-border: rgba(255, 255, 255, 0.2);
--glass-blur: blur(10px);
```

### Using Theme Tokens in Tailwind
```css
/* In Tailwind v4 config (globals.css) */
@theme {
  --color-primary: var(--primary);
  --color-secondary: var(--secondary);
  /* ... */
}
```

### Dark Mode Support
```css
/* Dark mode color overrides */
.dark {
  --primary: blue-400;
  --primary-foreground: blue-950;
  --secondary: blue-500;
  /* ... */
}
```

### Customizing Theme
1. Edit theme-tokens.css to change color values
2. Use standard CSS variable syntax: `--color-name: value;`
3. Changes instantly apply to all components
4. Test in both light and dark modes
5. Update related --foreground variables for contrast

### Naming Convention
- `--color-*` — main colors
- `--color-*-foreground` — text/foreground color for accessibility
- `--effect-*` — visual effects (blur, shadows, etc.)
- `--spacing-*` — custom spacing scales

### Glassmorphism Effects
- Semi-transparent background with backdrop blur
- Border with subtle highlight
- Used on cards, inputs, buttons in login theme
- Configured via CSS variables for consistency

### Adding New Theme Variables
1. Define in theme-tokens.css
2. Reference in globals.css @theme block
3. Use in components via Tailwind class names
4. Document purpose and usage
5. Test on both light/dark backgrounds
