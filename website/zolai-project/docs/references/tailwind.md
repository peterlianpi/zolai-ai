# Tailwind CSS 4 Reference

**Version:** 4.2.2 | **Docs:** https://tailwindcss.com/docs

## v4 Changes from v3

- **No config file needed** — uses CSS `@theme` for customization
- **First-party Vite plugin** — `@tailwindcss/vite`
- **Automatic content detection** — no `content` array needed
- **CSS-first configuration** — all config in CSS
- **Improved performance** — faster builds, smaller output
- **Container queries** — built-in `@container` support
- **OKLCH color** — new default color space
- **P3 color gamut** — wider color support

## Setup

```css
/* app/globals.css */
@import "tailwindcss";
@import "tw-animate-css";

@theme {
  --font-sans: "Inter", system-ui, sans-serif;
  --font-mono: "JetBrains Mono", monospace;

  --color-primary: oklch(0.5 0.2 250);
  --color-primary-foreground: oklch(0.98 0.01 250);

  --color-background: oklch(1 0 0);
  --color-foreground: oklch(0.15 0.02 250);

  --color-card: oklch(1 0 0);
  --color-card-foreground: oklch(0.15 0.02 250);

  --color-muted: oklch(0.96 0.01 250);
  --color-muted-foreground: oklch(0.5 0.02 250);

  --color-border: oklch(0.92 0.01 250);
  --color-input: oklch(0.92 0.01 250);

  --radius-sm: 0.25rem;
  --radius-md: 0.375rem;
  --radius-lg: 0.5rem;

  --animate-accordion-down: accordion-down 0.2s ease-out;
  --animate-accordion-up: accordion-up 0.2s ease-out;
}

@keyframes accordion-down {
  from { height: 0; }
  to { height: var(--radix-accordion-content-height); }
}

@keyframes accordion-up {
  from { height: var(--radix-accordion-content-height); }
  to { height: 0; }
}
```

## PostCSS Config

```js
// postcss.config.mjs
export default {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};
```

## Common Utilities

### Layout
```html
<div class="flex items-center justify-between">
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
<div class="container mx-auto px-4">
<div class="space-y-4">
<div class="divide-y divide-border">
```

### Spacing
```html
<div class="p-4">        <!-- padding: 1rem -->
<div class="px-4 py-2">  <!-- padding-x: 1rem, padding-y: 0.5rem -->
<div class="m-4">        <!-- margin: 1rem -->
<div class="mx-auto">    <!-- margin-x: auto (center) -->
<div class="gap-4">      <!-- gap: 1rem -->
```

### Typography
```html
<p class="text-sm text-muted-foreground">
<h1 class="text-2xl font-bold tracking-tight">
<p class="text-center text-lg">
<p class="truncate">       <!-- overflow: hidden, text-overflow: ellipsis -->
<p class="line-clamp-3">   <!-- limit to 3 lines -->
```

### Colors
```html
<div class="bg-primary text-primary-foreground">
<div class="bg-muted text-muted-foreground">
<div class="bg-destructive text-destructive-foreground">
<div class="border border-border">
<div class="bg-primary/10">  <!-- with opacity -->
```

### Borders & Radius
```html
<div class="rounded-lg border">
<div class="rounded-full">
<div class="border-2 border-dashed border-primary">
<div class="ring-2 ring-primary ring-offset-2">
```

### Shadows
```html
<div class="shadow-sm">
<div class="shadow-md">
<div class="shadow-lg">
<div class="shadow-xl">
```

### Responsive
```html
<!-- Mobile-first breakpoints -->
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
<div class="hidden md:block">     <!-- hidden on mobile, visible on md+ -->
<div class="text-sm md:text-base lg:text-lg">
```

### Dark Mode
```html
<div class="bg-white dark:bg-black">
<div class="text-black dark:text-white">
<div class="border-gray-200 dark:border-gray-800">
```

### States
```html
<button class="hover:bg-primary/90 focus:ring-2 active:scale-95 disabled:opacity-50">
<input class="focus:outline-none focus:ring-2 focus:ring-primary">
<a class="group hover:text-primary">
  <span class="group-hover:underline">Link</span>
</a>
```

### Transitions & Animation
```html
<div class="transition-all duration-200 ease-in-out">
<div class="animate-spin">
<div class="animate-pulse">
<div class="animate-bounce">
<div class="animate-accordion-down">
```

## Custom Utilities

```css
@utility line-clamp-2 {
  overflow: hidden;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

@utility aspect-video {
  aspect-ratio: 16 / 9;
}
```

## Best Practices

1. **Use `@theme`** for design tokens instead of tailwind.config.js
2. **OKLCH colors** — better perceptual uniformity
3. **Semantic color names** — `primary`, `muted`, `destructive`
4. **Mobile-first** — start with mobile, add `md:`, `lg:` breakpoints
5. **`cn()` utility** — merge Tailwind classes with clsx/tailwind-merge
6. **Dark mode** — use `dark:` prefix for theme variants
7. **Group hover** — `group` + `group-hover:` for parent-child interactions
8. **Arbitrary values** — `w-[320px]` when needed, but prefer design tokens
9. **`@apply` sparingly** — only for repeated complex patterns
10. **Content auto-detection** — no need for content array in v4
