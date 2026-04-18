# Library Reference Docs — 2026

---

## 1. Better Auth 1.5+

**Latest version:** 1.5.0 (released 2026-03-01)
**Docs:** https://better-auth.com/docs

### Key Features & Changes (1.5)
- **Auth CLI** — command-line tool for managing auth
- **MCP Auth** — Model Context Protocol integration
- **OAuth 2.1 Provider** — act as an OAuth 2.1 provider for other apps
- **Electron integration** — desktop app support
- **i18n** — built-in internationalization
- **Adapter extraction** — pluggable database adapters
- **Versioned secrets** (`secrets` array) for non-destructive secret rotation
- **Background tasks handler** — `waitUntil` support for Vercel/Cloudflare
- **Cookie cache strategies** — `compact` (default), `jwt`, `jwe`

### Admin Plugin
```ts
import { betterAuth } from "better-auth"
import { admin } from "better-auth/plugins"

export const auth = betterAuth({
  plugins: [
    admin({
      defaultRole: "user",
      adminRoles: ["admin"],
    })
  ]
})
```
- Adds `role` field to user table (`"user"` | `"admin"` | custom)
- Server: `auth.api.listUsers({ query: { role: "admin" } })`
- Client: `authClient.admin.listUsers()`
- Protect admin routes: check `session.user.role === "admin"`

### Email OTP Plugin
```ts
import { emailOTP } from "better-auth/plugins"

export const auth = betterAuth({
  plugins: [
    emailOTP({
      async sendVerificationOTP({ email, otp, type }) {
        // type: "sign-in" | "email-verification" | "forget-password"
        // Send OTP via your email provider
      },
      otpLength: 6,
      expiresIn: 300,           // 5 minutes
      allowedAttempts: 3,
      resendStrategy: "reuse",  // or "rotate"
      storeOTP: "hashed",       // or "encrypted" | "plain"
    })
  ]
})
```

### Session Config
```ts
export const auth = betterAuth({
  session: {
    expiresIn: 60 * 60 * 24 * 7,   // 7 days
    updateAge: 60 * 60 * 24,        // refresh every 1 day
    disableSessionRefresh: false,
    deferSessionRefresh: false,     // GET becomes read-only
    freshAge: 60 * 60 * 24,         // session "fresh" for 1 day
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60,               // 5 minutes
      strategy: "compact",          // "compact" | "jwt" | "jwe"
    },
    storeSessionInDatabase: false,  // true if secondaryStorage provided
  }
})
```

### Stateless Sessions (no database)
```ts
export const auth = betterAuth({
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 7 * 24 * 60 * 60,
      strategy: "jwe",
      refreshCache: true,
      version: "1",  // change to invalidate all sessions
    },
  },
  account: {
    storeAccountCookie: true,
  }
})
```

### Common Patterns
```ts
// Server-side session check
const session = await auth.api.getSession({ headers })

// Client-side reactive session
const { data: session } = authClient.useSession()

// Custom session response
import { customSession } from "better-auth/plugins"
plugins: [
  customSession(async ({ user, session }) => ({
    roles: await findUserRoles(session.userId),
    user, session
  }))
]

// Revoke sessions on password change
await authClient.changePassword({
  newPassword, currentPassword,
  revokeOtherSessions: true,
})
```

### Security Considerations
- Always set `BETTER_AUTH_SECRET` (min 32 bytes, `openssl rand -base64 32`)
- Set `baseURL` explicitly — never rely on request inference in production
- Set `trustedOrigins` for cross-origin requests
- Use `jwe` cookie cache strategy for sensitive data
- OTP: use `storeOTP: "hashed"` or `"encrypted"`, never `plain` in production
- Don't await email sending in `sendVerificationOTP` (timing attacks)
- `disableCSRFCheck` and `disableOriginCheck` are security risks

### Performance Tips
- Enable `cookieCache` to avoid DB hits on every `getSession`
- Use `deferSessionRefresh: true` for read-replica DB setups
- Use `secondaryStorage` (Redis) for session storage at scale
- Use `backgroundTasks.handler` with `waitUntil` on serverless
- Set shorter `cookieCache.maxAge` (60s) if immediate revocation is critical

---

## 2. Prisma 7

**Latest version:** 7.6.0 (released 2026-03-27)
**Docs:** https://www.prisma.io/docs

### Key Features & Changes
- **Full TypeScript rewrite** — "Prisma Next" architecture, no Rust binary
- **New `prisma-client` generator** — replaces `prisma-client-js`, TypeScript-only
- **`prisma.config.ts`** — centralized configuration file
- **Query plan caching** (v7.4+) — 0.1-1ms → 1-10µs per query compilation
- **Partial indexes** (preview) — `@@index([email], where: { published: true })`
- **BigInt precision fix** (v7.4)
- **WASM-based query compiler** — runs on JS main thread
- **MongoDB not yet supported** — PostgreSQL, MySQL, SQLite, MariaDB, SQL Server, CockroachDB

### Migration Workflow
```bash
# After schema changes
bunx prisma migrate dev --name <description>

# Regenerate Prisma client
bunx prisma generate

# Run seed script
bunx prisma db seed

# Reset database (dev only)
bunx prisma migrate reset
```

### Query Patterns
```ts
// Find with generated WhereInput types
import type { PostWhereInput } from "@/lib/generated/prisma/models"

const where: PostWhereInput = {
  published: true,
  authorId: { equals: userId },
  createdAt: { gte: new Date("2026-01-01") },
}
const posts = await prisma.post.findMany({ where })

// Cursor-based pagination
const posts = await prisma.post.findMany({
  take: 20,
  skip: 1,
  cursor: { id: lastId },
  orderBy: { createdAt: "desc" },
})

// Include relations
const post = await prisma.post.findUnique({
  where: { id },
  include: { author: true, comments: { take: 10 } },
})

// Transaction
await prisma.$transaction(async (tx) => {
  await tx.user.update({ where: { id }, data: { postsCount: { increment: 1 } } })
  await tx.post.create({ data: { title, authorId: id } })
})

// Raw SQL
const result = await prisma.$queryRaw`SELECT * FROM posts WHERE title LIKE ${"%" + q + "%"}`
```

### Generated Types
```ts
// From @/lib/generated/prisma/models
import type {
  PostWhereInput,
  PostOrderByWithRelationInput,
  MediaWhereInput,
  RedirectWhereInput,
  UserWhereInput,
} from "@/lib/generated/prisma/models"

// From @/lib/generated/prisma/enums
import type { Role, Status } from "@/lib/generated/prisma/enums"
```

### Performance Tips
- Query caching is automatic in 7.4+ — same query shape reuses compiled SQL
- Use `node:cluster` or PM2 for multi-core parallelism (Node is single-threaded)
- Prefer `findMany` with `take`/`skip` over loading all records
- Use partial indexes for filtered queries: `@@index([email], where: { status: "active" })`
- Avoid N+1: use `include` or `$transaction` for batched queries
- For high-throughput, consider raw queries via `$queryRaw`

### Security Considerations
- Never expose Prisma client to the browser — server-side only
- Use parameterized queries (automatic with Prisma) — never string-concatenate SQL
- Validate all inputs with Zod before passing to Prisma
- Catch `P2002` unique constraint errors and return 409
- Use database-level row-level security (RLS) for multi-tenant apps

---

## 3. Hono 4.12+

**Latest version:** 4.12.10 (released 2026-04-02)
**Docs:** https://hono.dev/docs

### Key Features
- **Web Standards-based** — runs on any JS runtime (Node, Bun, Cloudflare, Deno, Vercel)
- **Ultrafast router** — RegExpRouter (default), TrieRouter
- **Middleware ecosystem** — 50+ official middleware packages
- **RPC client** — `hc<AppType>("")` for type-safe API calls
- **Zod validator** — `@hono/zod-validator` for input validation
- **Bearer auth** — with regex-safe prefix matching (fixed in 4.12.8)

### Basic App & Routing
```ts
import { Hono } from "hono"
import { zValidator } from "@hono/zod-validator"
import { z } from "zod"

const app = new Hono()

app.get("/api/posts", async (c) => {
  const posts = await getPosts()
  return c.json({ success: true, data: posts })
})

app.post("/api/posts",
  zValidator("json", createPostSchema),
  async (c) => {
    const data = c.req.valid("json")
    const post = await createPost(data)
    return c.json({ success: true, data: post }, 201)
  }
)
```

### Middleware Patterns
```ts
// Auth middleware
app.use("/api/admin/*", async (c, next) => {
  const session = await getSession(c.req.raw)
  if (!session || session.user.role !== "admin") {
    return c.json({ error: { code: "UNAUTHORIZED", message: "Admin only" } }, 401)
  }
  c.set("user", session.user)
  await next()
})

// CORS
import { cors } from "hono/cors"
app.use("/api/*", cors({ origin: ["https://example.com"] }))

// Rate limiting
import { rateLimit } from "hono-rate-limit"
app.use("/api/*", rateLimit({ windowMs: 60_000, limit: 100 }))
```

### Zod Validator
```ts
import { zValidator } from "@hono/zod-validator"

const schema = z.object({
  title: z.string().min(1).max(200),
  content: z.string().min(1),
  tags: z.array(z.string()).max(5).optional(),
})

app.post("/posts", zValidator("json", schema), async (c) => {
  const { title, content, tags } = c.req.valid("json")
  // Types are inferred from schema
  return c.json({ success: true })
})

// Custom error handler for validation failures
app.post("/posts",
  zValidator("json", schema, (result, c) => {
    if (!result.success) {
      return c.json({
        error: {
          code: "VALIDATION_ERROR",
          message: result.error.issues.map(i => `${i.path.join(".")}: ${i.message}`).join(", "),
        }
      }, 400)
    }
  }),
  async (c) => { ... }
)
```

### Sub-routers
```ts
// app/api/[[...route]]/admin.ts
import { Hono } from "hono"
export const adminRouter = new Hono()
adminRouter.get("/users", listUsersHandler)

// app/api/[[...route]]/route.ts
import { Hono } from "hono"
import { adminRouter } from "./admin"

const app = new Hono()
app.route("/api/admin", adminRouter)
export default app
```

### Security Considerations
- Always validate inputs with `zValidator` — never trust client data
- Use HTTPS in production; set `Secure` cookie flag
- Implement rate limiting on auth endpoints
- Use `c.req.raw` for access to native Request object
- Sanitize HTML output to prevent XSS

### Performance Tips
- Hono is already ultrafast; middleware order matters — put cheap checks first
- Use `c.json()` for automatic Content-Type and serialization
- For large responses, use `c.stream()` or `c.body()` with ReadableStream
- Avoid blocking middleware — use async/await properly
- Use `c.env` for Cloudflare bindings (zero overhead)

---

## 4. Zod 4

**Latest version:** 4.x (stable, released 2025, actively maintained)
**Docs:** https://zod.dev/v4

### Key Features & Changes from v3
- **14x faster** string parsing, **7x faster** array parsing, **6.5x faster** object parsing
- **100x reduction** in `tsc` type instantiations
- **57% smaller** core bundle (5.36kb vs 12.47kb gzipped)
- **Zod Mini** (`zod/mini`) — functional API, 1.88kb gzipped
- **Metadata system** — `z.registry()`, `.meta()`, `z.globalRegistry`
- **JSON Schema** — `z.toJSONSchema(schema)`
- **Recursive objects** — getter-based, no type casting
- **File schemas** — `z.file().min(10_000).mime(["image/png"])`
- **Template literal types** — `z.templateLiteral([z.string(), "@", z.string()])`
- **Internationalization** — `z.config(z.locales.en())`
- **Error pretty-printing** — `z.prettifyError(err)`

### Breaking Changes from v3
| v3 | v4 |
|---|---|
| `z.string().email()` | `z.email()` (method deprecated) |
| `z.string().ip()` | `z.ipv4()` / `z.ipv6()` |
| `z.string().cidr()` | `z.cidrv4()` / `z.cidrv6()` |
| `invalid_type_error` / `required_error` | `error: (issue) => ...` |
| `errorMap` | `error` (renamed, returns string or undefined) |
| `.format()` / `.flatten()` | `z.treeifyError(err)` |
| `.strict()` / `.passthrough()` | `z.strictObject()` / `z.looseObject()` |
| `.merge()` | `.extend()` or destructuring |
| `.deepPartial()` | Removed (anti-pattern) |
| `z.nativeEnum(Color)` | `z.enum(Color)` |
| `z.promise()` | Deprecated — `await` before parsing |
| `z.refine()` type predicates | Ignored — use proper narrowing |
| `ctx.path` in refine | Removed |
| `z.record(z.string())` | `z.record(z.string(), z.string())` (2 args required) |
| `z.coerce.string()` input type | `unknown` instead of `string` |
| `POSITIVE_INFINITY` in `z.number()` | Invalid |
| `z.function().args().returns()` | `z.function({ input: [...], output: ... })` |

### Schema Patterns
```ts
import * as z from "zod"

// Basic types
const userSchema = z.object({
  id: z.string().uuid(),
  email: z.email(),
  name: z.string().min(1).max(100),
  age: z.int().min(0).max(150).optional(),
  role: z.enum(["user", "admin"]),
  createdAt: z.coerce.date(),
})

// With defaults
const settingsSchema = z.object({
  theme: z.enum(["light", "dark"]).default("light"),
  pagination: z.enum(["infinite", "normal"]).default("normal"),
})

// With error customization
const titleSchema = z.string({
  error: (issue) => issue.input === undefined
    ? "Title is required"
    : "Title must be a string",
}).min(1, { error: "Title cannot be empty" })

// Environment variables
const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  MEDIA_UPLOAD_PROVIDER: z.enum(["s3", "r2", "cloudinary"]).default("s3"),
})
const env = envSchema.parse(process.env)

// Recursive type
const Category = z.object({
  name: z.string(),
  get subcategories() { return z.array(Category) }
})

// File validation
const imageSchema = z.file()
  .min(1_000)
  .max(10_000_000)
  .mime(["image/png", "image/jpeg", "image/webp"])

// Stringbool for env vars
const debugSchema = z.stringbool()
debugSchema.parse("true")   // => true
debugSchema.parse("0")      // => false
```

### Security Considerations
- Always validate untrusted input at API boundaries
- Use `z.strictObject()` to reject unknown keys
- Never use `z.any()` or `z.unknown()` for API inputs — use proper types
- Sanitize string inputs that will be rendered as HTML
- Use `z.int()` for integer IDs to prevent float injection

### Performance Tips
- Use `zod/mini` for bundle-critical paths (6.6x smaller)
- Prefer `safeParse` over `parse` when validation might fail
- Reuse schema instances — don't recreate in hot paths
- Use `.brand()` for nominal typing without runtime cost
- For large arrays, consider chunking validation

---

## 5. Tailwind CSS 4

**Latest version:** 4.1.x (released January 2025, current as of 2026)
**Docs:** https://tailwindcss.com/docs

### Key Changes from v3
- **No `tailwind.config.js`** — CSS-first configuration via `@theme`
- **Rust-based engine** (Lightning CSS) — 5x faster full rebuilds, 100x faster incremental
- **Zero config** — auto-detects content files
- **CSS-native** — all config in CSS, no JS config file
- **New color system** — OKLCH color space by default
- **Container queries** — built-in `@container` support
- **3D transforms** — `rotate-x`, `rotate-y`, `perspective` utilities
- **Dynamic viewport units** — `svh`, `lvh`, `dvh`

### @theme Configuration
```css
@import "tailwindcss";

@theme {
  /* Colors */
  --color-primary: #3b82f6;
  --color-primary-foreground: #ffffff;
  --color-destructive: #ef4444;
  --color-border: #e2e8f0;

  /* Fonts */
  --font-sans: "Inter", system-ui, sans-serif;
  --font-mono: "JetBrains Mono", monospace;

  /* Spacing */
  --spacing: 0.25rem;

  /* Border radius */
  --radius-sm: 0.25rem;
  --radius-md: 0.5rem;
  --radius-lg: 1rem;

  /* Custom breakpoints */
  --breakpoint-3xl: 1920px;

  /* Custom utilities */
  --animate-fade-in: fade-in 0.3s ease-out;
}

@keyframes fade-in {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}
```

### CSS Variables & Dynamic Values
```css
@theme {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
}

/* In your HTML/JSX */
<div className="bg-background text-foreground">
```

### Common Patterns
```css
/* Layer utilities for custom classes */
@layer utilities {
  .text-balance { text-wrap: balance; }
}

/* Component classes */
@layer components {
  .btn-primary {
    @apply bg-primary text-primary-foreground rounded-md px-4 py-2;
  }
}

/* Responsive */
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

/* Dark mode (class strategy) */
<div className="bg-white dark:bg-gray-900">
```

### Migration from v3
- Run `@tailwindcss/upgrade` codemod — handles ~90% of changes automatically
- Move `tailwind.config.js` theme values to `@theme` in CSS
- Replace `theme()` function with CSS variables
- `content` config is auto-detected — remove if present
- Color functions (`rgb()`, `hsl()`) replaced with direct values or CSS variables

### Performance Tips
- Incremental builds are ~192 microseconds (vs 35ms in v3)
- Use `@import "tailwindcss"` instead of `@tailwind` directives
- Lightning CSS handles minification — no need for separate CSS minifier
- Avoid arbitrary values `bg-[#123456]` when theme tokens exist
- Use CSS variables for theme switching (dark mode, branding)

---

## 6. TanStack React Query 5.96+

**Latest version:** 5.96.2 (released 2026-04-03)
**Docs:** https://tanstack.com/query/v5/docs

### Key Features
- **Automatic background refetching** — stale-while-revalidate out of the box
- **Optimistic updates** — `setQueryData` before mutation completes
- **Infinite queries** — `useInfiniteQuery` with cursor/key-based pagination
- **Suspense integration** — `useSuspenseQuery` for React 18+ Suspense
- **DevTools** — `@tanstack/react-query-devtools` for debugging
- **Persistence** — `@tanstack/query-persist-client-core` for offline support
- **Broadcast query state** — `@tanstack/query-broadcast-client-experimental` for tabs

### Query Patterns
```ts
// Basic query
const { data, isLoading, error } = useQuery({
  queryKey: ["posts"],
  queryFn: () => fetch("/api/posts").then(r => r.json()),
  staleTime: 5 * 60 * 1000,  // 5 minutes
})

// Query with params
const { data: post } = useQuery({
  queryKey: ["post", id],
  queryFn: () => fetch(`/api/posts/${id}`).then(r => r.json()),
  enabled: !!id,
})

// Mutation
const mutation = useMutation({
  mutationFn: (data: CreatePostInput) =>
    fetch("/api/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }).then(r => r.json()),
  onSuccess: (data) => {
    queryClient.invalidateQueries({ queryKey: ["posts"] })
    toast.success("Post created")
  },
  onError: (error) => {
    toast.error("Failed to create post")
  },
})

// Optimistic update
const mutation = useMutation({
  mutationFn: updatePost,
  onMutate: async (newData) => {
    await queryClient.cancelQueries({ queryKey: ["posts"] })
    const previous = queryClient.getQueryData(["posts"])
    queryClient.setQueryData(["posts"], (old: Post[]) => [...old, newData])
    return { previous }
  },
  onError: (err, newData, context) => {
    queryClient.setQueryData(["posts"], context?.previous)
  },
  onSettled: () => {
    queryClient.invalidateQueries({ queryKey: ["posts"] })
  },
})
```

### Infinite Query (for InfiniteTable)
```ts
const {
  data,
  fetchNextPage,
  hasNextPage,
  isFetchingNextPage,
} = useInfiniteQuery({
  queryKey: ["posts", "infinite"],
  queryFn: ({ pageParam }) =>
    fetch(`/api/posts?cursor=${pageParam}&limit=20`).then(r => r.json()),
  initialPageParam: null,
  getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
  staleTime: 5 * 60 * 1000,
})

// Flatten pages for rendering
const allPosts = data?.pages.flatMap(page => page.data) ?? []
```

### Provider Setup
```tsx
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <YourApp />
    </QueryClientProvider>
  )
}
```

### Performance Tips
- Set `staleTime` appropriately — longer for static data, shorter for real-time
- Use `select` to transform data without re-fetching: `select: (data) => data.items`
- Use `useSuspenseQuery` with React Suspense for loading states
- Prefetch data: `queryClient.prefetchQuery({ queryKey, queryFn })`
- Use `keepPreviousData: true` for pagination to avoid loading flicker
- For infinite scroll, use `getNextPageParam` with cursor-based pagination
- Avoid over-fetching: don't include unused fields in `queryKey`

---

## 7. Radix UI 1.4+ / shadcn/ui

**Latest:** Radix UI unified `radix-ui` package (February 2026)
**Docs:** https://ui.shadcn.com

### Key Changes
- **Unified `radix-ui` package** — `new-york` style imports from `radix-ui` instead of individual `@radix-ui/react-*` packages
- **Base UI option** — `npx shadcn create` lets you choose Radix or Base UI
- **Migrate command** — `pnpm dlx shadcn@latest migrate radix`

### Import Change
```diff
- import * as DialogPrimitive from "@radix-ui/react-dialog"
+ import { Dialog as DialogPrimitive } from "radix-ui"
```

### shadcn/ui Components (latest)
- Accordion, Alert, Alert Dialog, Aspect Ratio, Avatar, Badge
- Breadcrumb, Button, Button Group, Calendar, Card, Carousel
- Chart, Checkbox, Collapsible, Combobox, Command, Context Menu
- Data Table, Date Picker, Dialog, Direction, Drawer, Dropdown Menu
- Empty, Field, Hover Card, Input, Input Group, Input OTP
- Item, Kbd, Label, Menubar, Native Select, Navigation Menu
- Pagination, Popover, Progress, Radio Group, Resizable, Scroll Area
- Select, Separator, Sheet, Sidebar, Skeleton, Slider, Sonner
- Spinner, Switch, Table, Tabs, Textarea, Toast, Toggle, Toggle Group, Tooltip
- Typography

### Common Patterns
```tsx
// Dialog
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

<Dialog>
  <DialogTrigger asChild><Button>Open</Button></DialogTrigger>
  <DialogContent>
    <DialogHeader><DialogTitle>Title</DialogTitle></DialogHeader>
    <p>Content</p>
  </DialogContent>
</Dialog>

// Select
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

<Select value={value} onValueChange={setValue}>
  <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
  <SelectContent>
    <SelectItem value="a">Option A</SelectItem>
    <SelectItem value="b">Option B</SelectItem>
  </SelectContent>
</Select>

// Table (responsive wrapper)
<div className="overflow-x-auto">
  <Table>
    <TableHeader>...</TableHeader>
    <TableBody>
      {items.map(item => (
        <TableRow key={item.id}>
          <TableCell className="truncate" title={item.name}>{item.name}</TableCell>
        </TableRow>
      ))}
    </TableBody>
  </Table>
</div>

// Sonner toast
import { toast } from "sonner"
toast.success("Saved successfully")
toast.error("Something went wrong")
```

### Performance Tips
- shadcn components are copied into your project — tree-shaken automatically
- Use `asChild` prop to avoid unnecessary wrapper DOM nodes
- Lazy-load heavy components (Calendar, Chart) with `React.lazy`
- Use `React.memo` for table rows with many cells
- Prefer `Select` over native `<select>` for consistent styling and accessibility

---

## 8. React Hook Form 7.72+

**Latest version:** 7.72.0 (released 2026-03-22)
**Docs:** https://react-hook-form.com

### Key Features
- **Built-in form-level validate** (v7.72) — `useForm({ validate: async ({ formValues }) => { ... } })`
- **Zod 4 support** via `@hookform/resolvers`
- **Uncontrolled inputs** — minimal re-renders, native browser behavior
- **Type-safe** — full TypeScript inference from schema

### Zod Integration
```tsx
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"

const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
  content: z.string().min(10, "Content must be at least 10 characters"),
  tags: z.array(z.string()).max(5).optional(),
})

type FormValues = z.infer<typeof formSchema>

function PostForm() {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { title: "", content: "", tags: [] },
  })

  const onSubmit = form.handleSubmit(async (data) => {
    await createPost(data)
    toast.success("Post created")
  })

  return (
    <form onSubmit={onSubmit}>
      <Input {...form.register("title")} />
      {form.formState.errors.title && (
        <p className="text-destructive">{form.formState.errors.title.message}</p>
      )}
      <Textarea {...form.register("content")} />
      <Button type="submit" disabled={form.formState.isSubmitting}>
        {form.formState.isSubmitting ? "Saving..." : "Submit"}
      </Button>
    </form>
  )
}
```

### Form-Level Validation (v7.72+)
```tsx
const form = useForm({
  resolver: zodResolver(schema),
  validate: async ({ formValues }) => {
    // Cross-field validation
    if (formValues.startDate > formValues.endDate) {
      return { startDate: { message: "Start date must be before end date" } }
    }
  },
})
```

### Common Patterns
```tsx
// Array fields
const { fields, append, remove } = useFieldArray({
  control: form.control,
  name: "tags",
})

// Watch for changes
const title = form.watch("title")

// Reset form
form.reset()

// Set value programmatically
form.setValue("title", "New title")

// With shadcn Form component
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"

<FormField
  control={form.control}
  name="title"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Title</FormLabel>
      <FormControl><Input {...field} /></FormControl>
      <FormMessage />
    </FormItem>
  )}
/>
```

### Performance Tips
- Use uncontrolled inputs (default) — avoid `value` + `onChange`
- Use `shouldUnregister: false` to keep field values when hidden
- Use `mode: "onBlur"` or `"onSubmit"` instead of `"onChange"` for large forms
- Use `useFieldArray` for dynamic lists — not manual array state
- Avoid `watch` on entire form — watch specific fields only
- Use `formState.isSubmitting` for submit button loading state

---

## 9. React 19.2

**Latest version:** 19.2.x (released October 2025)
**Docs:** https://react.dev

### Key Features
- **`<Activity />` component** — keep UI mounted but hidden, preserving state
- **`useEffectEvent` hook** — stable callbacks in effects, always see latest state
- **`cacheSignal` API** — AbortSignal for Server Component caching
- **Partial Pre-rendering** — `prerender()` + `resume()` for static shell + dynamic resume
- **Suspense SSR Batching** — batched reveal of Suspense boundaries in streaming SSR
- **Web Streams in Node.js SSR** — `renderToReadableStream` available on Node
- **DevTools Performance Tracks** — Scheduler + Components tracks in Chrome
- **ESLint Hooks Plugin v6** — `useEffectEvent` support, flat config
- **`useId` prefix changed** — `_r_` (was `:r:`) for CSS compatibility

### `<Activity />` Component
```tsx
import { Activity } from "react"

// Instead of conditional rendering (unmounts):
{isShowingSidebar && <Sidebar />}

// Use Activity (preserves state, unmounts effects):
<Activity mode={isShowingSidebar ? "visible" : "hidden"}>
  <Sidebar />
</Activity>

// Modes: "visible" (normal) | "hidden" (CSS display:none, effects cleaned up)
```

Use cases: tabbed interfaces, multi-step forms, predictive prefetching, modals.

### `useEffectEvent` Hook
```tsx
import { useEffect, useEffectEvent } from "react"

function ChatRoom({ roomId, theme }) {
  // Stable callback — always sees latest `theme`, doesn't re-run effect
  const onConnected = useEffectEvent(() => {
    showNotification("Connected!", theme)
  })

  useEffect(() => {
    const connection = createConnection(roomId)
    connection.on("connected", () => onConnected())
    connection.connect()
    return () => connection.disconnect()
  }, [roomId]) // theme NOT in deps — effect doesn't re-run on theme change
}
```

Key rules:
- Always sees latest state/props (no stale closures)
- NOT reactive — don't include in dependency arrays
- Declared locally in the same component/hook
- For "event" logic only (callbacks from subscriptions, timers)

### `cacheSignal` for Server Components
```tsx
import { cache, cacheSignal } from "react"

const dedupedFetch = cache(async (url: string) => {
  const response = await fetch(url, { signal: cacheSignal() })
  return response.json()
})

// In a Server Component:
async function MyComponent() {
  const data = await dedupedFetch("https://api.example.com/data")
  return <div>{data.title}</div>
}
```

### Partial Pre-rendering
```tsx
import { prerender, resume } from "react-dom/static"

// Build time: pre-render static shell
const { prelude, postponed } = await prerender(<App />)
await savePostponedState(postponed)

// Request time: resume with dynamic content
const postponed = await getPostponedState(request)
const stream = await resume(<App />, postponed)
stream.pipeTo(response.body)
```

### Security Considerations
- CVE-2025-55182 — critical vulnerability patched in January 2026; update immediately
- Always sanitize user-generated content before rendering
- Use Content Security Policy (CSP) headers
- `useId` prefix change (`_r_`) — ensure no CSS targets old `:r:` prefix

### Performance Tips
- Use `<Activity mode="hidden">` for background UI instead of conditional rendering
- Use `useEffectEvent` to avoid unnecessary effect re-runs
- Use `startTransition` for non-urgent state updates
- Use `useDeferredValue` for deferring expensive renders
- Suspense boundaries batch automatically in SSR — no manual batching needed

---

## 10. AWS SDK S3 v3

**Latest version:** 3.1023+ (as of April 2026)
**Docs:** https://docs.aws.amazon.com/sdk-for-javascript/v3/developer-guide/

### Key Features
- **Modular architecture** — import only `@aws-sdk/client-s3`
- **`@aws-sdk/lib-storage`** — `Upload` class for multipart uploads
- **Presigned URLs** — `@aws-sdk/s3-request-presigner`
- **AbortController support** — cancel in-progress uploads (uses global `AbortController` as of v3.1023)
- **Web Streams support** — upload/download with ReadableStream/WritableStream

### Configuration
```ts
import { S3Client } from "@aws-sdk/client-s3"

// AWS S3
const s3 = new S3Client({
  region: process.env.S3_REGION!,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID!,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
  },
  forcePathStyle: false,  // AWS S3
})

// Cloudflare R2
const s3 = new S3Client({
  region: "auto",
  endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
  forcePathStyle: true,  // R2 requires path-style
})
```

### Upload Patterns
```ts
import { PutObjectCommand } from "@aws-sdk/client-s3"
import { Upload } from "@aws-sdk/lib-storage"

// Simple upload (small files)
await s3.send(new PutObjectCommand({
  Bucket: process.env.S3_BUCKET_NAME!,
  Key: `resources/${filename}`,
  Body: fileBuffer,
  ContentType: mimeType,
}))

// Multipart upload (large files) — automatic chunking
const upload = new Upload({
  client: s3,
  params: {
    Bucket: process.env.S3_BUCKET_NAME!,
    Key: `resources/${filename}`,
    Body: fileStream,
    ContentType: mimeType,
  },
  queueSize: 4,      // concurrent parts
  partSize: 10 * 1024 * 1024,  // 10MB parts
})

// Progress tracking
upload.on("httpUploadProgress", (progress) => {
  console.log(`${progress.loaded}/${progress.total}`)
})

const result = await upload.done()

// Abort upload
const controller = new AbortController()
const upload = new Upload({
  client: s3,
  params: { ... },
  abortSignal: controller.signal,
})
// Later: controller.abort()
```

### Presigned URLs
```ts
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"
import { PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3"

// Upload URL (client uploads directly to S3)
const uploadUrl = await getSignedUrl(s3, new PutObjectCommand({
  Bucket: process.env.S3_BUCKET_NAME!,
  Key: `resources/${filename}`,
}), { expiresIn: 3600 })

// Download URL
const downloadUrl = await getSignedUrl(s3, new GetObjectCommand({
  Bucket: process.env.S3_BUCKET_NAME!,
  Key: `resources/${filename}`,
}), { expiresIn: 3600 })
```

### Delete & List
```ts
import { DeleteObjectCommand, ListObjectsV2Command } from "@aws-sdk/client-s3"

// Delete
await s3.send(new DeleteObjectCommand({
  Bucket: process.env.S3_BUCKET_NAME!,
  Key: `resources/${filename}`,
}))

// List with prefix
const { Contents } = await s3.send(new ListObjectsV2Command({
  Bucket: process.env.S3_BUCKET_NAME!,
  Prefix: "resources/",
  MaxKeys: 100,
}))
```

### Security Considerations
- **Never commit credentials** — use environment variables or IAM roles
- Use IAM policies with least privilege — restrict to specific bucket/prefix
- Validate file types and sizes server-side before upload
- Use presigned URLs with short expiry (1 hour max)
- Enable S3 bucket versioning for recovery
- Set CORS rules on bucket for browser uploads
- Use `forcePathStyle: false` for AWS S3, `true` for R2
- Validate access key presence only (AWS keys are 20 chars, R2 keys are 32 chars)

### Performance Tips
- Use `Upload` (multipart) for files > 5MB — automatic chunking and retry
- Set `queueSize: 4` for optimal concurrency
- Use presigned URLs for direct client-to-S3 uploads (bypass your server)
- Reuse `S3Client` instance — don't create per-request
- Use `AbortController` to cancel stale uploads
- For CDN delivery, use `S3_PUBLIC_URL` env var for direct asset URLs
