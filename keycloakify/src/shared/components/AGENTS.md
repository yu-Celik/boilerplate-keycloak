<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-04-04 -->

# shared/components

## Purpose
Shared custom components for keycloakify theme — reusable components not covered by shadcn/ui base library.

## Key Files

This directory contains custom components that are shared across login and account themes and are not part of the shadcn/ui base library.

## For AI Agents

### Working In This Directory
- Create components that are used by both login and account themes
- Keep components simple and focused on single responsibility
- Compose with shadcn/ui components as building blocks
- Style entirely with Tailwind classes

### Example Custom Components
If they exist, they might include:
- Form wrappers (auto-layout for form groups)
- Custom card variants (special layouts)
- Theme-specific layouts (glassmorphism containers)
- Notification/toast components
- Modal dialogs
- Breadcrumb navigation

### Component Structure Pattern
```typescript
// Custom component example
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export interface FormCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  description?: string;
}

export function FormCard({ title, description, children, className }: FormCardProps) {
  return (
    <Card className={cn("w-full", className)}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}
```

### Usage in Pages
```typescript
import { FormCard } from "@/shared/components";

export function LoginPage(props: LoginPageProps<...>) {
  return (
    <Template kcContext={kcContext} i18n={i18n}>
      <FormCard title="Sign In" description="Enter your credentials">
        <form>{/* Form content */}</form>
      </FormCard>
    </Template>
  );
}
```

### Guidelines
- Export from barrel file (index.ts) if multiple components
- Document props interface clearly
- Support className prop for customization
- Compose with shadcn/ui, don't duplicate functionality
- Test in both login and account contexts
