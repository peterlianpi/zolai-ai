# Next.js 16 Reference

**Version:** 16.2.2 (March 2026) | **Docs:** https://nextjs.org/docs

## What's New in Next.js 16

### Turbopack Default
- Replaces Webpack for both `dev` and `build`
- 87% faster cold dev startup (~2.9s vs ~22s)
- 75% faster Fast Refresh
- 2.5x faster production builds

### `use cache` Directive
- Caching is now **opt-in** — everything is dynamic by default
- Replaces old implicit caching model
- Use `cacheTag()` and `cacheLife()` for granular control

```tsx
// Cache a Server Component
export default async function ProductPage({ params }) {
  "use cache";
  const product = await getProduct(params.id);
  return <div>{product.name}</div>;
}

// With cache tags for revalidation
export default async function ProductPage({ params }) {
  "use cache";
  cacheTag("product", params.id);
  cacheLife({ days: 7 });
  const product = await getProduct(params.id);
  return <div>{product.name}</div>;
}
```

### `proxy.ts` Replaces `middleware.ts`
- Runs on Node.js (not Edge Runtime)
- Full access to `fs`, `crypto`, native modules
- Same API as middleware

```ts
// proxy.ts (root of project)
import { NextRequest, NextResponse } from "next/server";

export function proxy(request: NextRequest) {
  const token = request.cookies.get("auth-token");
  if (!token && request.nextUrl.pathname.startsWith("/dashboard")) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/api/protected/:path*"],
};
```

### React 19.2 Bundled
- `useEffectEvent` — event handlers that don't trigger re-renders
- `<Activity>` component — offscreen rendering
- View Transitions API support
- 3.5x faster RSC payload deserialization

### `after()` API
- Schedule callbacks after response is sent
- Perfect for logging, analytics, notifications

```ts
import { after } from "next/server";

export async function POST(req: Request) {
  const data = await processRequest(req);
  after(() => sendNotification(data));
  after(() => logAnalytics(data));
  return Response.json(data);
}
```

### Async Request APIs Enforced
- `cookies()`, `headers()`, `params`, `searchParams` must be awaited
- No longer synchronous

```tsx
// ❌ Old (broken in Next.js 16)
const { id } = await props.params;

// ✅ Correct
const params = await props.params;
const { id } = params;

// ❌ Old
const cookieStore = cookies();

// ✅ Correct
const cookieStore = await cookies();
```

### Removed Features
- `serverRuntimeConfig` / `publicRuntimeConfig`
- AMP support
- `next lint` command (use ESLint directly)
- Node.js 18 support (minimum Node.js 20)

## App Router Best Practices

### Server Components by Default
- Everything is a Server Component unless marked `"use client"`
- Zero client JS sent to browser
- Direct DB/FS/env access

### When to Use `"use client"`
1. Event handlers (`onClick`, `onChange`, `onSubmit`)
2. Browser APIs (`window`, `localStorage`, `IntersectionObserver`)
3. React state/effects (`useState`, `useEffect`, `useRef`)
4. Custom hooks that use any of the above

### Composition Pattern
```tsx
// Server Component
export default function Page() {
  const data = await fetchData();
  return <ClientComponent data={data} />;
}

// Client Component
"use client";
export default function ClientComponent({ data }) {
  const [state, setState] = useState(data);
  return <div>{/* interactive UI */}</div>;
}
```

### Streaming with Suspense
```tsx
import { Suspense } from "react";

export default function Page() {
  return (
    <div>
      <Suspense fallback={<Skeleton />}>
        <SlowComponent />
      </Suspense>
      <Suspense fallback={<Skeleton />}>
        <AnotherSlowComponent />
      </Suspense>
    </div>
  );
}
```

### Parallel Routes
```tsx
// app/@analytics/page.tsx
export default function AnalyticsPage() {
  return <AnalyticsDashboard />;
}

// app/@team/page.tsx
export default function TeamPage() {
  return <TeamDashboard />;
}

// app/layout.tsx
export default function Layout({ analytics, team }) {
  return (
    <div>
      {analytics}
      {team}
    </div>
  );
}
```

**Every `@slot` directory must have a `default.tsx` fallback.**

### Error Boundaries
```tsx
// app/@team/error.tsx
"use client";
export default function Error({ error, reset }) {
  return (
    <div>
      <h2>Something went wrong</h2>
      <button onClick={reset}>Try again</button>
    </div>
  );
}
```

## API Route Patterns

### Route Handlers
```ts
// app/api/users/route.ts
export async function GET(req: Request) {
  const users = await db.user.findMany();
  return Response.json({ success: true, data: users });
}

export async function POST(req: Request) {
  const body = await req.json();
  const user = await db.user.create({ data: body });
  return Response.json({ success: true, data: user }, { status: 201 });
}
```

### Catch-All Routes with Hono
```ts
// app/api/[[...route]]/route.ts
import { Hono } from "hono";
import { handle } from "hono/vercel";
import users from "./users";
import posts from "./posts";

const app = new Hono().basePath("/api");

const routes = app
  .route("/users", users)
  .route("/posts", posts);

export const GET = handle(app);
export const POST = handle(app);
export const PUT = handle(app);
export const DELETE = handle(app);
```

### Server Actions
```ts
"use server";
import { z } from "zod";
import { revalidatePath } from "next/cache";

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
});

export async function createUser(formData: FormData) {
  const parsed = schema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
  });
  if (!parsed.success) return { error: parsed.error.flatten() };

  await db.user.create({ data: parsed.data });
  revalidatePath("/users");
  return { success: true };
}
```

## Image Optimization

```ts
// next.config.ts
const nextConfig: NextConfig = {
  images: {
    minimumCacheTTL: 14400, // 4 hours
    remotePatterns: [
      {
        protocol: "https",
        hostname: "zolai-assets.s3.ap-southeast-1.amazonaws.com",
        pathname: "/images/**",
      },
      {
        protocol: "https",
        hostname: "*.cloudinary.com",
      },
    ],
    qualities: [40, 75, 90],
  },
};
```

## Security Best Practices

1. **httpOnly cookies** for sessions (never localStorage)
2. **Verify auth in every handler** — proxy is NOT a security boundary
3. **Zod validation** on all Server Actions and API routes
4. **Rate limiting** on login/OTP endpoints
5. **CSP headers** in next.config.ts
6. **`NEXT_PUBLIC_` prefix** only for client-exposed env vars
7. **Sanitize `dangerouslySetInnerHTML`** with DOMPurify
8. **Validate redirect URLs** to prevent open redirects

## Performance Optimization

1. **Minimize client components** — audit every `"use client"`
2. **React Compiler** — auto-memoization via `reactCompiler: true`
3. **Turbopack** — default bundler, massive speed improvements
4. **`use cache`** — explicit, granular caching
5. **Streaming** — `<Suspense>` boundaries for independent loading
6. **`generateStaticParams`** — pre-render known routes
7. **Dynamic imports** for heavy client components
8. **Monitor Core Web Vitals** with Speed Insights
