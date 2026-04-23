---
name: design-system
description: Tailwind + shadcn/ui design system for the Zolai platform. Use when designing layouts, theming, or building new UI components.
---

# Design System — Zolai Project

## Theming (CSS variables in globals.css)

```css
/* Customize these, not shadcn internals */
--background, --foreground
--primary, --primary-foreground
--muted, --muted-foreground
--accent, --accent-foreground
--destructive
--border, --ring, --radius
```

Dark mode: `.dark` class on `<html>`.

## Spacing scale (stick to these)

`4 · 8 · 12 · 16 · 24 · 32 · 48 · 64px`  
→ `p-1 · p-2 · p-3 · p-4 · p-6 · p-8 · p-12 · p-16`

## Typography hierarchy

| Role | Class |
|---|---|
| Page title | `text-3xl font-bold` |
| Section heading | `text-xl font-semibold` |
| Card title | `text-lg font-medium` |
| Body | `text-base` |
| Caption / meta | `text-sm text-muted-foreground` |
| Zolai text (min) | `text-base` — never smaller for readability |

## shadcn/ui component map

| Need | Component |
|---|---|
| Container | `Card`, `CardHeader`, `CardContent` |
| Actions | `Button` (variant: default/outline/ghost/destructive) |
| Status | `Badge` (variant: default/secondary/destructive/outline) |
| Overlay | `Dialog`, `Sheet` (mobile-friendly) |
| Navigation | `Tabs`, `NavigationMenu` |
| Data | `Table`, `DataTable` (with TanStack Table) |
| Input | `Input`, `Textarea`, `Select`, `Combobox` |
| Feedback | `Alert`, `Sonner` toast |
| Loading | `Skeleton` |

## Layout patterns

```tsx
{/* Page layout */}
<div className="container mx-auto px-4 py-8 max-w-5xl">

{/* Two-column */}
<div className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-6">

{/* Card grid */}
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
```

## Accessibility checklist

- [ ] All buttons have visible labels or `aria-label`
- [ ] Images have `alt` text (decorative: `alt=""`)
- [ ] Color contrast ≥ 4.5:1 for body text
- [ ] Focus rings visible (Tailwind `focus-visible:ring-2`)
- [ ] Interactive elements reachable by keyboard
- [ ] Form fields have associated `<label>`
