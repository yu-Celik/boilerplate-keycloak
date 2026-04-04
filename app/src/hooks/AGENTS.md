<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-04-04 -->

# hooks

## Purpose
Custom React hooks for client-side functionality. These are browser-only utilities used by interactive components and page transitions. All hooks are client-only — they use React hooks (useState, useEffect) and browser APIs (matchMedia).

## Key Files

| File | Description |
|------|-------------|
| `use-mobile.tsx` | Client hook (`"use client"`) — detects mobile viewport using `window.matchMedia()`. Returns `boolean` indicating if viewport width is below 768px. Used by responsive components that need to hide sidebar on mobile. |

## For AI Agents

### Working In This Directory
- All files in this directory require `"use client"` — they are client-only
- Hooks use React hooks (useState, useEffect) and browser APIs
- Do not import or use server-only utilities (e.g., from `@/lib/auth.ts`)
- Export only hook functions, not components

### Adding New Hooks
- Name hooks with `use` prefix (e.g., `useLocalStorage`, `useDebounce`)
- Always add `"use client"` as the first line
- Use TypeScript for type safety
- Keep hooks focused on a single concern

## Dependencies
- React only (no external packages except those already in package.json)
- Tailwind breakpoints align with `use-mobile.tsx` — 768px is the md breakpoint
