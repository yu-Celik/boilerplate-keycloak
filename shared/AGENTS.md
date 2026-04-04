<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-04-04 | Updated: 2026-04-04 -->

# shared

## Purpose
Single source of truth for the blue-gray glassmorphism theme tokens used across the entire SaaS platform. Shared CSS custom properties (variables) imported by both the Next.js app and the Keycloakify login themes. Ensures consistent branding, color palette, and glassmorphism effects across all user-facing interfaces.

## Key Files

| File | Description |
|------|-------------|
| `theme-tokens.css` | CSS custom properties (variables) for light and dark modes. Defines: background, foreground, card, primary, secondary, muted, accent, destructive, border, input, ring, radius. Sidebar-specific variables: sidebar-background, sidebar-foreground, sidebar-primary, sidebar-accent, sidebar-border. Glassmorphism utilities: glass-bg, glass-border, glass-shadow. Supports `:root` (light) and `.dark` (dark mode). |

## Subdirectories
None. This directory contains only CSS tokens.

## For AI Agents

### Working In This Directory
- Edit `theme-tokens.css` for global theme changes (affects both app and keycloakify)
- CSS variables use HSL color format: `hsl(hue saturation lightness / alpha)`
- Define variables in `:root` (light mode) and `.dark` class (dark mode)
- All consuming components must import this file in their globals.css

### Color Palette (Blue-Gray Glassmorphism)

**Light Mode (`<root>`)**
- Primary: `221 83% 53%` (bright blue)
- Secondary: `215 20% 91%` (light gray)
- Background: `220 14% 96%` (off-white)
- Foreground: `222 47% 11%` (dark blue-gray)
- Glassmorphism: `220 14% 96% / 0.7` with border `215 20% 50% / 0.08`

**Dark Mode (`.dark`)**
- Primary: `217 91% 60%` (lighter blue for contrast)
- Secondary: `215 25% 15%` (dark gray)
- Background: `222 47% 6%` (almost black)
- Foreground: `210 40% 98%` (near white)
- Glassmorphism: `222 30% 10% / 0.6` with border `215 30% 80% / 0.08`

### Variable Categories

**Core Colors**
- `--background`, `--foreground` — main text/bg
- `--card`, `--card-foreground` — card surfaces
- `--primary`, `--primary-foreground` — action buttons, links
- `--secondary`, `--secondary-foreground` — secondary actions
- `--accent`, `--accent-foreground` — highlights
- `--destructive`, `--destructive-foreground` — danger actions
- `--border`, `--input` — form elements, dividers
- `--ring` — focus outline color

**Sidebar Variables**
- `--sidebar-background`, `--sidebar-foreground` — sidebar container
- `--sidebar-primary`, `--sidebar-primary-foreground` — active nav item
- `--sidebar-accent`, `--sidebar-accent-foreground` — hover state
- `--sidebar-border`, `--sidebar-ring` — nav borders/focus

**Glassmorphism Utilities**
- `--glass-bg` — semi-transparent background for glass effect
- `--glass-border` — subtle border for glass containers
- `--glass-shadow` — depth shadow for elevation

### Integration with Consuming Projects

**Next.js App** (`app/src/app/globals.css`)
```css
@import "@/lib/theme-tokens.css"; /* imports from shared/ */
```

**Keycloakify** (`keycloakify/src/globals.css`)
```css
@import "../../../shared/theme-tokens.css";
```

Both projects use Tailwind CSS v4 CSS-first, which reads these custom properties and applies them to utility classes automatically (e.g., `bg-background`, `text-foreground`, `border-border`).

### When to Update
- Brand color refresh: update `--primary`, `--secondary` in both `:root` and `.dark`
- Adjust contrast: modify `--foreground` values for readability
- Glassmorphism effects: tweak `--glass-bg`, `--glass-border`, `--glass-shadow` for visual hierarchy
- Add new semantic variables: (e.g., `--success`, `--warning`, `--info`) and update both light/dark modes

### Dark Mode Activation
Dark mode is activated by adding the `.dark` class to the `<html>` element. Tailwind CSS v4 reads this and applies variables from `.dark { ... }` block. No config file needed.

## Dependencies

### Internal
- None. This is a pure CSS module consumed by other projects.

### External
- CSS custom properties (browser-native, no runtime dependencies)
- Used by: `app/` (Next.js) and `keycloakify/` (Keycloak theme)
- Consumed via `@import` in their respective `globals.css` files

