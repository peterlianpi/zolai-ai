---
name: theme-system
description: Zolai brand theme — color tokens, dark mode, Zomi flag palette, typography, radius. Use when modifying globals.css, adding new color tokens, or theming components.
---

# Theme System — Zolai Project

## Brand palette (Zomi flag)

| Role | Light | Dark | Meaning |
|---|---|---|---|
| Primary | `oklch(0.48 0.20 25)` | `oklch(0.62 0.20 25)` | Zomi red — sacrifice |
| Chart-2 | `oklch(0.78 0.16 85)` | `oklch(0.82 0.16 85)` | Gold/yellow |
| Chart-3 | `oklch(0.45 0.14 155)` | `oklch(0.58 0.14 155)` | Green |

## CSS variable reference

```css
/* Surfaces */
--background      /* page bg */
--foreground      /* page text */
--card            /* card bg */
--card-foreground
--popover
--popover-foreground

/* Brand */
--primary         /* Zomi red */
--primary-foreground
--secondary       /* warm cream */
--secondary-foreground

/* Neutral */
--muted           /* subtle bg */
--muted-foreground /* secondary text */
--accent
--accent-foreground

/* Semantic */
--destructive     /* red errors */
--border
--input
--ring            /* focus ring */

/* Sidebar */
--sidebar, --sidebar-foreground
--sidebar-primary, --sidebar-primary-foreground
--sidebar-accent, --sidebar-accent-foreground
--sidebar-border, --sidebar-ring

/* Charts */
--chart-1 through --chart-5
```

## Radius scale

```css
--radius: 0.625rem  /* base */
--radius-sm: base - 4px
--radius-md: base - 2px
--radius-lg: base
--radius-xl: base + 4px
--radius-2xl: base + 8px
```

## Dark mode

Class-based: `.dark` on `<html>`. Custom variant: `dark:` in Tailwind.

```tsx
// Toggle
document.documentElement.classList.toggle("dark");
```

## Using tokens in Tailwind

```tsx
// Always use semantic tokens, never raw colors
<div className="bg-background text-foreground">
<div className="bg-card border border-border rounded-lg">
<button className="bg-primary text-primary-foreground hover:bg-primary/90">
<p className="text-muted-foreground text-sm">
```

## Adding a new token

1. Add CSS variable to both `:root` and `.dark` in `globals.css`
2. Map it in `@theme inline` block
3. Use via `bg-[var(--my-token)]` or add to Tailwind config

## Article/prose content

Use `.article-content` class for rich text — already styled in globals.css with headings, lists, blockquotes, code blocks, tables.

## Selection color

Matches brand: `oklch(0.48 0.20 25 / 20%)` light, `oklch(0.62 0.20 25 / 30%)` dark.
