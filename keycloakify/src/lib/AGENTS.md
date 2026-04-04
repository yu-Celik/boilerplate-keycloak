<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-04-04 -->

# lib

## Purpose
Utility functions for keycloakify theme — class merging, type utilities, and helper functions.

## Key Files

| File | Description |
|------|-------------|
| `utils.ts` | Utility function(s): `cn()` from clsx + tailwind-merge for safe Tailwind class merging. Use to combine conditional classes without conflicts. |

## For AI Agents

### Working In This Directory
- Minimal utilities — most functionality delegated to shadcn/ui components
- `cn()` function for safe class merging is the primary utility
- Add new utilities only if used across multiple files

### Class Merging Pattern
```typescript
import { cn } from "@/lib/utils";

// Safely merge classes — later classes override earlier ones
const className = cn(
  "px-4 py-2 bg-blue-500",  // base classes
  "bg-red-500",              // overrides bg-blue-500 to bg-red-500
  condition && "opacity-50"  // conditional class
);

// Use in components
<Button className={cn("w-full", isLoading && "opacity-50")}>
  {isLoading ? "Loading..." : "Submit"}
</Button>
```

### Why cn() is Needed
- Tailwind utilities conflict if same property set twice
- `cn()` resolves conflicts intelligently (red overrides blue)
- `clsx` handles conditional classes
- `tailwind-merge` deduplicates and resolves Tailwind conflicts

### Common Utilities to Add
If you need to add new utilities:
- `clsxify()` — wrapper around clsx for common patterns
- `createVariant()` — helper for component variants
- Type utilities for keycloakify context props
- Validation helpers for form fields
