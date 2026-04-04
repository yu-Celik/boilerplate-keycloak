<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-04-04 -->

# components/ui

## Purpose
shadcn/ui component library — reusable UI primitives adapted for Tailwind v4 and keycloakify theme.

## Key Files

| Component | Purpose |
|-----------|---------|
| `button.tsx` | Button component with multiple variants (default, secondary, outline, ghost, destructive). Supports size props (sm, md, lg). |
| `input.tsx` | Text input component with support for all input types (text, email, password, number). Tailwind-styled with focus states. |
| `card.tsx` | Container component for grouping content. Exports Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent. |
| `alert.tsx` | Alert/notification component with variants (default, destructive, success, info). Use for flash messages and errors. |
| `label.tsx` | Form label component paired with inputs. Includes required asterisk support. |
| `badge.tsx` | Small status/tag component with multiple style variants. Use for status indicators. |
| `separator.tsx` | Visual divider (horizontal or vertical). Use to separate sections. |
| `table.tsx` | Data table component. Exports Table, TableHeader, TableBody, TableRow, TableCell, TableHead. |

## For AI Agents

### Working In This Directory
- All components are shadcn/ui implementations adapted for Tailwind v4
- Never use PatternFly kcClsx — all styling via Tailwind classes
- Components accept standard React props + className for customization
- Use cn() utility (from clsx + tailwind-merge) to merge Tailwind classes safely

### Button Component Pattern
```typescript
import { Button } from "@/components/ui/button";

// Variants
<Button>Default</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="outline">Outline</Button>
<Button variant="destructive">Destructive</Button>

// Sizes
<Button size="sm">Small</Button>
<Button size="md">Medium</Button>
<Button size="lg">Large</Button>

// With className
<Button className="w-full">Full Width</Button>
```

### Input Component Pattern
```typescript
import { Input } from "@/components/ui/input";

<Input type="text" placeholder="Username" />
<Input type="email" placeholder="email@example.com" />
<Input type="password" placeholder="Password" />
<Input disabled />
```

### Card Component Pattern
```typescript
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";

<Card>
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
    <CardDescription>Optional description</CardDescription>
  </CardHeader>
  <CardContent>
    {/* Card content here */}
  </CardContent>
</Card>
```

### Alert Component Pattern
```typescript
import { Alert } from "@/components/ui/alert";

<Alert variant="destructive">
  <AlertIcon />
  <AlertTitle>Error</AlertTitle>
  <AlertDescription>Something went wrong</AlertDescription>
</Alert>

<Alert variant="success">Success message</Alert>
```

### Label Component Pattern
```typescript
import { Label } from "@/components/ui/label";

<div>
  <Label htmlFor="email">Email Address</Label>
  <Input id="email" type="email" />
</div>
```

### Table Component Pattern
```typescript
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

<Table>
  <TableHeader>
    <TableRow>
      <TableHead>Name</TableHead>
      <TableHead>Email</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    <TableRow>
      <TableCell>John Doe</TableCell>
      <TableCell>john@example.com</TableCell>
    </TableRow>
  </TableBody>
</Table>
```

### Tailwind Class Merging
```typescript
import { cn } from "@/lib/utils";

// Safe merge of Tailwind classes
const buttonClass = cn(
  "px-4 py-2",
  isActive && "bg-primary text-white",
  className  // User-provided classes override defaults
);
```

### Styling with Tailwind v4
- Use utility classes for all styling
- Support dark mode with `.dark:` prefix
- Responsive design with `sm:`, `md:`, `lg:` prefixes
- Color palette from theme-tokens.css
- No custom CSS in component files

### Accessibility
- Semantic HTML (button, label, input)
- ARIA attributes where needed
- Keyboard navigation support
- Focus states visible
- Color contrast meets WCAG standards
- Screen reader friendly

### When to Modify Components
- **Don't modify** unless fixing bug or supporting new variant
- **Create wrapper** if you need custom behavior
- **Update theme-tokens.css** to change color palette
- Keep components simple and reusable
