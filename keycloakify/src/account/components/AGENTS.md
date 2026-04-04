<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-04-04 -->

# account/components

## Purpose
Layout and shell components for account console — sidebar navigation, header, footer, and template wrapper.

## Key Files

This directory may contain shared layout components for the account theme. See parent AGENTS.md for Template usage and structure.

## For AI Agents

### Working In This Directory
- Components here provide layout structure for account pages
- Similar to login/components pattern but for account console
- All account pages wrapped in Template component with sidebar nav

### Common Patterns
- Sidebar navigation (conditionally shown based on features)
- Header with language switcher and logout button
- Main content area with scrollable content
- Flash message display above page content
- Mobile-responsive navigation (hidden sidebar on small screens, horizontal tab bar)

### Sidebar Navigation Items
Conditionally rendered based on `features` object:
- Account (Personal Info)
- Password (Change password)
- Authenticator (2FA)
- Social (Linked accounts)
- Sessions (Device activity)
- Applications (Connected apps)
- Groups (Organizations)
- Log (Activity history)

Each nav item:
- Links to corresponding account page
- Highlighted when active (current page)
- Icon + text label
- Accessible keyboard navigation
