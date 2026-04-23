---
name: design-system-architecture
description: Full design system architecture for the Zolai platform — component hierarchy, token system, patterns, data flow, and composition rules. Use when making architectural decisions about UI, components, or the design system.
---

# Design System Architecture — Zolai Platform

## Stack

| Layer | Technology | Version |
|---|---|---|
| Styling | Tailwind CSS | 4.2.2 |
| Components | shadcn/ui + Radix UI | 4.1.2 / 1.4.3 |
| Forms | React Hook Form + Zod | 7.72.0 / 4.3.6 |
| State | TanStack Query | 5.96.1 |
| Tables | TanStack Table | 8.21.3 |
| Charts | Recharts | 2.15.4 |
| Icons | Lucide React | 0.563.0 |
| Toasts | Sonner | 2.0.7 |
| Themes | next-themes | 0.4.6 |

## Component hierarchy

```
app/layout.tsx              ← providers, fonts, theme
  app/(routes)/page.tsx     ← thin, imports from features
    features/<f>/components/
      FeaturePage.tsx        ← RSC orchestrator
        FeatureCard.tsx      ← RSC leaf
        FeatureForm.tsx      ← "use client" — form/mutation
          components/ui/     ← shadcn primitives (never modify)
```

**Rule:** Never import from `components/ui/` in `app/` directly — always via `features/`.

## Token system (3 layers)

```
1. CSS variables (:root / .dark in globals.css)
        ↓
2. @theme inline mapping (Tailwind color tokens)
        ↓
3. Tailwind utilities (bg-primary, text-muted-foreground, etc.)
```

Never skip layers — always use semantic tokens, never raw oklch values in components.

## Data flow

```
RSC → Prisma (select only) → render HTML
  ↓
"use client" → TanStack Query → GET /api/... → Hono → Prisma
  ↓
Mutation → Server Action OR POST /api/... → invalidateQueries()
```

## Component composition rules

- **shadcn primitives** (`components/ui/`) — never modify, use className/variants
- **Feature components** (`features/*/components/`) — compose from primitives
- **Page components** (`app/`) — thin wrappers only, no logic
- **Hooks** (`features/*/hooks/`) — all client data fetching via TanStack Query
- **Server queries** (`features/*/server/`) — all RSC/Server Action data access

## Form pattern

```tsx
const form = useForm<T>({ resolver: zodResolver(schema) });
<Form {...form}>
  <FormField control={form.control} name="x" render={({ field }) => (
    <FormItem>
      <FormLabel />
      <FormControl><Input {...field} /></FormControl>
      <FormMessage />
    </FormItem>
  )} />
  <Button disabled={form.formState.isSubmitting}>Save</Button>
</Form>
```

## Admin/table pattern

```tsx
// Server Component
export default async function Page() {
  const data = await fetchData(); // Prisma select
  return <DataTable data={data} />;
}
// Client Component — TanStack Table
"use client";
export function DataTable({ data }) { ... }
```

## Responsive breakpoints

`sm: 640px · md: 768px · lg: 1024px · xl: 1280px · 2xl: 1536px`

Always mobile-first: base styles → `sm:` → `md:` → `lg:`

## 60 shadcn components available

Key ones: Accordion, Alert, AlertDialog, Avatar, Badge, Button, Calendar, Card, Carousel, Checkbox, Combobox, Command, DataTable, Dialog, Drawer, DropdownMenu, Form, HoverCard, Input, Label, NavigationMenu, Popover, RadioGroup, ScrollArea, Select, Separator, Sheet, Sidebar, Skeleton, Slider, Switch, Table, Tabs, Textarea, Toast, Toggle, Tooltip.

Add new: `bunx shadcn@latest add <component>`
