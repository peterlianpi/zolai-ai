# Skill: UI/Design System

## Purpose

Design and implement UI components using shadcn/ui, Tailwind CSS, and feature-based architecture.

## When to Use

Use this skill when user says:
- "Add UI component"
- "Build a new component"
- "Design system"
- "Theme customization"
- "Tailwind styling"
- "shadcn/ui"

## Core Components

### 1. Button

```tsx
import { Button } from '@/components/ui/button'

<Button variant="default" size="default">Click me</Button>
```

Variants: `default`, `destructive`, `outline`, `secondary`, `ghost`, `link`
Sizes: `default`, `sm`, `lg`, `icon`

### 2. Input

```tsx
import { Input } from '@/components/ui/input'

<Input placeholder="Enter text..." />
```

### 3. Form

Uses React Hook Form + Zod:

```tsx
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

const schema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
})

const form = useForm<z.infer<typeof schema>>({
  resolver: zodResolver(schema),
})
```

## Design Tokens

### Colors (Tailwind CSS v4)

```css
:root {
  --background: oklch(0.985 0 0);
  --foreground: oklch(0.145 0 0);
  --primary: oklch(0.55 0.2 250);
  --primary-foreground: oklch(0.985 0 0);
  --muted: oklch(0.97 0 0);
  --accent: oklch(0.95 0 0);
  --border: oklch(0.922 0 0);
}
```

### Spacing

- `gap-1`: 0.25rem (4px)
- `gap-2`: 0.5rem (8px)
- `gap-4`: 1rem (16px)
- `gap-6`: 1.5rem (24px)
- `gap-8`: 2rem (32px)

### Typography

- `text-xs`: 0.75rem (12px)
- `text-sm`: 0.875rem (14px)
- `text-base`: 1rem (16px)
- `text-lg`: 1.125rem (18px)
- `text-xl`: 1.25rem (20px)
- `text-2xl`: 1.5rem (24px)

## Component Patterns

### Card

```tsx
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card'

<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
  </CardHeader>
  <CardContent>Content</CardContent>
  <CardFooter>Footer</CardFooter>
</Card>
```

### Dialog/Modal

```tsx
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

<Dialog>
  <DialogTrigger>Open</DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Title</DialogTitle>
    </DialogHeader>
  </DialogContent>
</Dialog>
```

### Table

```tsx
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'

<Table>
  <TableHeader>
    <TableRow>
      <TableHead>Column</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    <TableRow>
      <TableCell>Data</TableCell>
    </TableRow>
  </TableBody>
</Table>
```

## Responsive Design

### Breakpoints

- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px
- `2xl`: 1536px

### Pattern

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {/* Content */}
</div>
```

## Dark Mode

Use `dark:` prefix:

```tsx
<div className="bg-white dark:bg-slate-900">
  Content
</div>
```

## Animations

### Fade In

```tsx
<div className="animate-in fade-in duration-300">
  Content
</div>
```

### Slide In

```tsx
<div className="animate-in slide-in-from-bottom-4">
  Content
</div>
```

## Accessibility

- Use semantic HTML
- Add `aria-label` for icon buttons
- Use `role` attribute when needed
- Ensure color contrast (WCAG AA minimum)
- Focus visible states

## Key Conventions

- shadcn/ui components in `components/ui/`
- Never modify shadcn components (copy if needed)
- Use `cn()` util for class merging
- Tailwind v4 uses CSS variables
- Feature components in `features/*/components/`