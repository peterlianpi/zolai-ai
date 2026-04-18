# Architecture & Design System Recommendations

## Project Stack

| Layer | Technology | Version | Purpose |
|-------|-----------|---------|---------|
| Framework | Next.js | 16.2.2 | Full-stack React framework |
| Runtime | React | 19.2.3 | UI library |
| Language | TypeScript | 5.9.3 | Type-safe JavaScript |
| Database | PostgreSQL | - | Relational database |
| ORM | Prisma | 7.6.0 | Type-safe database client |
| Auth | Better Auth | 1.5.6 | Authentication & authorization |
| API | Hono | 4.12.10 | Lightweight API framework |
| Validation | Zod | 4.3.6 | Schema validation |
| Styling | Tailwind CSS | 4.2.2 | Utility-first CSS |
| UI | shadcn/ui + Radix | 4.1.2 / 1.4.3 | Accessible components |
| Forms | React Hook Form | 7.72.0 | Form management |
| State | TanStack Query | 5.96.1 | Server state management |
| Tables | TanStack Table | 8.21.3 | Headless table |
| Charts | Recharts | 2.15.4 | Data visualization |
| Upload | AWS SDK S3 | 3.1023.0 | File storage |
| Email | Resend + Nodemailer | 6.10.0 / 8.0.0 | Email delivery |
| Icons | Lucide React | 0.563.0 | Icon library |
| Dates | date-fns | 4.1.0 | Date utilities |
| Calendar | react-day-picker | 9.14.0 | Date picker |
| Carousel | Embla Carousel | 8.6.0 | Carousel/slider |
| Notifications | Sonner | 2.0.7 | Toast notifications |
| HTML Sanitizer | sanitize-html | 2.17.2 | XSS prevention |
| Testing | Playwright | 1.59.1 | E2E testing |
| Linting | ESLint | 9.39.4 | Code quality |

## Architecture Patterns

### 1. App Router Structure
```
app/
  (public)/           # Public routes (no auth required)
    page.tsx
    layout.tsx
  (protected)/        # Authenticated routes
    admin/
      page.tsx
      layout.tsx
    settings/
      page.tsx
  api/
    [[...route]]/     # Hono catch-all
      route.ts
      users.ts
      posts.ts
      media.ts
      upload.ts
      admin.ts
  layout.tsx          # Root layout
  proxy.ts            # Auth middleware (Next.js 16)
```

### 2. Feature-Based Organization
```
features/
  <feature>/
    components/       # Feature-specific components
    hooks/            # Custom hooks
    schemas/          # Zod validation schemas
    types/            # TypeScript types
    utils/            # Feature utilities
```

### 3. Data Flow
```
Server Component → Prisma → Render HTML
                      ↓
Client Component → TanStack Query → API Route → Hono → Prisma
                      ↓
Mutation → Server Action / API Route → Prisma → Invalidate Query → Refetch
```

### 4. Authentication Flow
```
User → Login → Better Auth → httpOnly Cookie → proxy.ts (auth check) → Protected Route
                                                    ↓
                                              Server: auth.api.getSession()
                                                    ↓
                                              Client: useSession()
```

### 5. File Upload Flow
```
User → UploadZone → POST /api/upload → S3 Upload → Prisma Media Record → 201 Response
                                              ↓
                                    queryClient.invalidateQueries()
                                              ↓
                                    MediaBrowser refetches → Shows new file
```

## Design System

### Color Tokens (Tailwind @theme)
```css
@theme {
  /* Primary brand */
  --color-primary: oklch(0.5 0.2 250);
  --color-primary-foreground: oklch(0.98 0.01 250);

  /* Backgrounds */
  --color-background: oklch(1 0 0);
  --color-foreground: oklch(0.15 0.02 250);
  --color-card: oklch(1 0 0);
  --color-card-foreground: oklch(0.15 0.02 250);
  --color-popover: oklch(1 0 0);
  --color-popover-foreground: oklch(0.15 0.02 250);

  /* UI Elements */
  --color-muted: oklch(0.96 0.01 250);
  --color-muted-foreground: oklch(0.5 0.02 250);
  --color-accent: oklch(0.96 0.01 250);
  --color-accent-foreground: oklch(0.15 0.02 250);
  --color-border: oklch(0.92 0.01 250);
  --color-input: oklch(0.92 0.01 250);
  --color-ring: oklch(0.5 0.2 250);

  /* Semantic */
  --color-destructive: oklch(0.55 0.22 25);
  --color-destructive-foreground: oklch(0.98 0.01 25);
  --color-success: oklch(0.6 0.18 145);
  --color-warning: oklch(0.75 0.18 85);

  /* Sidebar */
  --color-sidebar: oklch(0.98 0.01 250);
  --color-sidebar-foreground: oklch(0.4 0.02 250);
  --color-sidebar-primary: oklch(0.5 0.2 250);
  --color-sidebar-border: oklch(0.92 0.01 250);
  --color-sidebar-ring: oklch(0.5 0.2 250);

  /* Radius */
  --radius-sm: 0.25rem;
  --radius-md: 0.375rem;
  --radius-lg: 0.5rem;
  --radius-xl: 0.75rem;
}
```

### Typography
```
Headings: font-sans, tracking-tight
  h1: text-2xl font-bold (Next.js 16: Server Components)
  h2: text-xl font-semibold
  h3: text-lg font-semibold

Body: font-sans
  Large: text-base
  Default: text-sm
  Small: text-xs

Monospace: font-mono (code, IDs)
```

### Spacing Scale
```
xs: 0.25rem (4px)
sm: 0.5rem (8px)
md: 1rem (16px)
lg: 1.5rem (24px)
xl: 2rem (32px)
2xl: 3rem (48px)
```

### Component Patterns

#### Admin Page Pattern
```tsx
// Server Component
export default async function AdminPage() {
  const data = await fetchData();
  return <AdminTable data={data} />;
}

// Client Component
"use client";
export function AdminTable({ data }: { data: Item[] }) {
  const { preference } = useTablePagination();
  if (preference === "infinite") return <InfiniteTable ... />;
  return <Table ... />;
}
```

#### API Response Pattern
```ts
// Success
return c.json({ success: true, data: result });

// Error
return c.json({
  success: false,
  error: { code: "VALIDATION_ERROR", message: "Invalid input" },
}, 400);
```

#### Form Pattern
```tsx
const form = useForm<FormValues>({
  resolver: zodResolver(schema),
  defaultValues: { ... },
});

<Form {...form}>
  <form onSubmit={form.handleSubmit(onSubmit)}>
    <FormField control={form.control} name="field" render={({ field }) => (
      <FormItem>
        <FormLabel>Label</FormLabel>
        <FormControl><Input {...field} /></FormControl>
        <FormMessage />
      </FormItem>
    )} />
    <Button type="submit" disabled={form.formState.isSubmitting}>
      {form.formState.isSubmitting ? "Saving..." : "Save"}
    </Button>
  </form>
</Form>
```

## Security Architecture

### Defense Layers
```
1. proxy.ts — Auth check, redirects
2. Hono middleware — API-level auth
3. Zod validation — Input sanitization
4. Prisma — Parameterized queries (SQL injection safe)
5. sanitize-html — XSS prevention
6. Security headers — CSP, HSTS, X-Frame-Options
7. Rate limiting — Brute force protection
8. Audit logging — Security event tracking
```

## Performance Architecture

### Caching Strategy
```
Server Components: Dynamic by default (Next.js 16)
  → Use "use cache" for expensive operations
  → Use cacheTag() for granular revalidation

Client Components: TanStack Query
  → staleTime: 5 minutes for most data
  → invalidateQueries() after mutations
  → refetchQueries() for immediate updates

Static: generateStaticParams() for known routes
```

### Bundle Optimization
```
1. Server Components by default (zero client JS)
2. Dynamic imports for heavy components
3. React Compiler for auto-memoization
4. Turbopack for fast builds
5. Image optimization with Next.js Image
6. Code splitting via route segments
```

## Best Practices Summary

1. **Server Components first** — only use client when needed
2. **Feature-based organization** — keep related code together
3. **Zod everywhere** — validate all inputs
4. **Consistent response shape** — `{ success, data?, error? }`
5. **TanStack Query for client state** — server state management
6. **Prisma singleton** — never instantiate directly
7. **Better Auth for auth** — don't roll your own
8. **shadcn/ui for UI** — accessible, customizable
9. **Tailwind for styling** — utility-first, design tokens
10. **TypeScript strict** — no `any` types
11. **ESLint always** — run before commits
12. **Audit logging** — track all mutations
13. **Rate limiting** — protect sensitive endpoints
14. **Error boundaries** — graceful failure handling
15. **Responsive design** — mobile-first approach
