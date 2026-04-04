<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-04-04 -->

# components

## Purpose
Shared UI components for keycloakify theme — shadcn/ui component library (button, input, card, alert, label, etc.) used by both login and account pages.

## Key Files

| Directory | Purpose |
|-----------|---------|
| `ui/` | shadcn/ui component implementations: button, input, card, alert, label, badge, separator, table. Adapted for Tailwind v4 CSS-first styling, no PatternFly. |

## For AI Agents

### Working In This Directory
- All components in `ui/` are shadcn/ui implementations adapted for this project
- Use these components in login pages, account pages, and custom layouts
- Components export base implementations; styles applied via Tailwind classes
- No PatternFly — all styling via Tailwind utility classes

### Common UI Components

| Component | Usage | Example |
|-----------|-------|---------|
| `Button` | Form buttons, action buttons | `<Button>Submit</Button>` |
| `Input` | Text inputs, email, password | `<Input type="password" placeholder="..." />` |
| `Card` | Form containers, info boxes | `<Card><CardHeader>.../CardHeader></Card>` |
| `Alert` | Error/success/warning messages | `<Alert variant="destructive">Error</Alert>` |
| `Label` | Form field labels | `<Label htmlFor="field">Field Name</Label>` |
| `Badge` | Status badges, tags | `<Badge variant="secondary">Pending</Badge>` |
| `Separator` | Visual divider | `<Separator />` |
| `Table` | Data tables, lists | `<Table><TableBody>...</TableBody></Table>` |

### Styling Patterns
- Button variants: `default`, `secondary`, `outline`, `ghost`, `destructive`
- Alert variants: `default`, `destructive`, `success`, `info`
- Badge variants: `default`, `secondary`, `outline`
- All components accept className prop for additional Tailwind classes

### Component Composition
```typescript
// Example: button + label combination
<div className="space-y-2">
  <Label htmlFor="email">Email</Label>
  <Input id="email" type="email" placeholder="your@email.com" />
  <Button className="w-full">Submit</Button>
</div>
```

### Tailwind v4 Integration
- Components use Tailwind v4 CSS-first approach
- No custom CSS in component files — all styling via utility classes
- Color palette from theme-tokens.css (blue-gray glassmorphism)
- Responsive utilities (sm:, md:, lg:) for mobile-first design

### When to Use vs Create Custom
- **Use shadcn/ui**: form fields, buttons, common UI patterns
- **Create custom**: keycloakify-specific layouts, brand-specific components
- Keep shadcn/ui as the base layer; compose with custom components

### Adding New Components
1. Adapt shadcn/ui component to Tailwind v4
2. Remove any PatternFly kcClsx references
3. Place in `ui/` subdirectory
4. Export from component barrel if using
5. Document variant options and usage examples
