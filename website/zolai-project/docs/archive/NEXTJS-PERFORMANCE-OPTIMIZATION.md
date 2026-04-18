# Next.js 16 Performance & Optimization Guide

**Version:** 2.0.0 | **Last Updated:** April 2026 | **Next.js:** 16.x | **Target:** Production-Ready

> Comprehensive guide to optimizing Next.js 16 applications for maximum performance, Core Web Vitals compliance, and scalability. Includes caching strategies, database optimization, bundle optimization, and monitoring.

## Table of Contents

1. [Core Web Vitals](#core-web-vitals)
2. [Image Optimization](#image-optimization)
3. [Code Splitting & Bundle Optimization](#code-splitting--bundle-optimization)
4. [Caching Strategies](#caching-strategies)
5. [Database Query Optimization](#database-query-optimization)
6. [API Response Optimization](#api-response-optimization)
7. [Server-Side Rendering (SSR) Performance](#server-side-rendering-ssr-performance)
8. [Client-Side Performance](#client-side-performance)
9. [Monitoring & Metrics](#monitoring--metrics)
10. [Production Checklist](#production-checklist)

---

## Core Web Vitals

Core Web Vitals are Google's key metrics for page experience. Next.js 16 provides built-in tools to measure and optimize them.

### The Three Core Web Vitals

| Metric | Target | What It Measures |
|--------|--------|-----------------|
| **LCP** (Largest Contentful Paint) | < 2.5s | Time to display largest visible element |
| **INP** (Interaction to Next Paint) | < 200ms | Delay between user input and visual feedback |
| **CLS** (Cumulative Layout Shift) | < 0.1 | Visual stability during page load |

### Measuring Web Vitals with `web-vitals`

Install the `web-vitals` package:

```bash
npm install web-vitals
```

Create a custom hook to report metrics:

```typescript
// lib/metrics.ts
import { onCLS, onFID, onFCP, onINP, onLCP } from 'web-vitals'

export function reportWebVitals() {
  // Largest Contentful Paint
  onLCP((metric) => {
    console.log('LCP:', metric.value)
    // Send to analytics: POST /api/metrics
  })

  // Interaction to Next Paint
  onINP((metric) => {
    console.log('INP:', metric.value)
    // Send to analytics
  })

  // Cumulative Layout Shift
  onCLS((metric) => {
    console.log('CLS:', metric.value)
    // Send to analytics
  })

  // Largest Contentful Paint (legacy)
  onLCP((metric) => {
    console.log('LCP:', metric.value)
  })

  // First Input Delay (legacy, deprecated for INP)
  onFID((metric) => {
    console.log('FID:', metric.value)
  })

  // First Contentful Paint
  onFCP((metric) => {
    console.log('FCP:', metric.value)
  })
}
```

Use in your root layout:

```typescript
// app/layout.tsx
'use client'

import { useEffect } from 'react'
import { reportWebVitals } from '@/lib/metrics'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  useEffect(() => {
    reportWebVitals()
  }, [])

  return (
    <html>
      <body>{children}</body>
    </html>
  )
}
```

### Monitoring Web Vitals with Next.js Analytics

Send metrics to your analytics service:

```typescript
// lib/analytics.ts
interface WebVitalMetric {
  name: 'LCP' | 'INP' | 'CLS' | 'FCP' | 'FID'
  value: number
  url: string
  userAgent: string
}

export async function sendMetric(metric: WebVitalMetric) {
  // Send to your analytics backend
  if (navigator.sendBeacon) {
    navigator.sendBeacon('/api/metrics', JSON.stringify(metric))
  } else {
    fetch('/api/metrics', {
      method: 'POST',
      body: JSON.stringify(metric),
      keepalive: true,
    })
  }
}
```

---

## Image Optimization

Unoptimized images are the #1 cause of poor LCP. Next.js `next/image` automatically optimizes images.

### Using `next/image` for LCP Optimization

```typescript
// ✅ GOOD: Optimized image
import Image from 'next/image'

export function Hero() {
  return (
    <Image
      src="/hero.jpg"
      alt="Hero banner"
      width={1200}
      height={600}
      priority // LCP image - loads eagerly
      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 100vw"
    />
  )
}
```

```typescript
// ❌ BAD: Unoptimized image
export function Hero() {
  return <img src="/hero.jpg" alt="Hero banner" />
}
```

### Image Priority & Loading

```typescript
// Priority images (above the fold)
<Image
  src="/hero.jpg"
  alt="Hero"
  priority
  width={1200}
  height={600}
/>

// Lazy-loaded images (below the fold)
<Image
  src="/testimonial.jpg"
  alt="Testimonial"
  loading="lazy"
  width={400}
  height={400}
/>
```

### Responsive Images with `sizes`

```typescript
<Image
  src="/product.jpg"
  alt="Product"
  width={1200}
  height={800}
  sizes="
    (max-width: 640px) 100vw,
    (max-width: 1024px) 50vw,
    (max-width: 1536px) 33vw,
    25vw
  "
/>
```

### Image Hosting & CDN

```typescript
// next.config.ts - Configure image optimization
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.example.com',
      },
      {
        protocol: 'https',
        hostname: '*.s3.amazonaws.com',
      },
    ],
    // Disable image optimization for external images if already optimized
    unoptimized: process.env.NEXT_PUBLIC_ENVIRONMENT === 'staging',
  },
}

export default nextConfig
```

### Static Image Import & Type Safety

```typescript
import heroImage from '@/public/hero.jpg'

export function Hero() {
  return (
    <Image
      src={heroImage}
      alt="Hero"
      priority
      // Width and height automatically inferred from import
    />
  )
}
```

---

## Code Splitting & Bundle Optimization

### Dynamic Imports for Code Splitting

Lazy-load heavy components to reduce initial bundle:

```typescript
// ❌ BAD: Loads on every page
import HeavyChart from '@/components/HeavyChart'

export default function Dashboard() {
  return <HeavyChart data={data} />
}
```

```typescript
// ✅ GOOD: Lazy-loaded
import dynamic from 'next/dynamic'

const HeavyChart = dynamic(() => import('@/components/HeavyChart'), {
  loading: () => <div>Loading chart...</div>,
})

export default function Dashboard() {
  return <HeavyChart data={data} />
}
```

### Dynamic Imports with `ssr: false`

For client-only components:

```typescript
const MapComponent = dynamic(
  () => import('@/components/Map'),
  {
    ssr: false,
    loading: () => <div className="h-96 bg-gray-200 animate-pulse" />,
  }
)
```

### Analyzing Bundle Size

```bash
# Install bundle analyzer
npm install --save-dev @next/bundle-analyzer

# Generate bundle analysis
npx next-bundle-analyzer
```

Configure in `next.config.ts`:

```typescript
import withBundleAnalyzer from '@next/bundle-analyzer'

const withAnalyzer = withBundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
})

export default withAnalyzer({
  // Next.js config
})
```

Run analysis:

```bash
ANALYZE=true npm run build
```

### Tree Shaking & Unused Code Elimination

Ensure `next.config.ts` has proper configuration:

```typescript
const nextConfig: NextConfig = {
  productionBrowserSourceMaps: false, // Reduce bundle
  swcMinify: true,
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.optimization.splitChunks.cacheGroups = {
        // Split vendor code into separate chunks
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          priority: 10,
        },
        // Split common code between pages
        common: {
          minChunks: 2,
          priority: 5,
          reuseExistingChunk: true,
        },
      }
    }
    return config
  },
}
```

---

## Caching Strategies

### 1. Next.js Built-in Caching with `cache`

```typescript
// lib/data.ts
import { cache } from 'react'

// Memoize expensive operations during request lifecycle
export const getCachedUser = cache(async (id: string) => {
  return await db.user.findUnique({ where: { id } })
})
```

### 2. Route Segment Caching

```typescript
// app/blog/page.tsx
// Revalidate static content every 3600 seconds (1 hour)
export const revalidate = 3600

export default async function BlogPage() {
  const posts = await db.post.findMany()
  return <div>{/* render posts */}</div>
}
```

### 3. Incremental Static Regeneration (ISR)

```typescript
// app/blog/[slug]/page.tsx
export const revalidate = 60 // Revalidate every 60 seconds

export async function generateStaticParams() {
  const posts = await db.post.findMany()
  return posts.map(post => ({ slug: post.slug }))
}

export default async function BlogPost({ params }: { params: { slug: string } }) {
  const post = await db.post.findUnique({ where: { slug: params.slug } })
  return <article>{/* render post */}</article>
}
```

### 4. Browser & CDN Caching Headers

```typescript
// middleware.ts
import { type NextRequest, NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  const response = NextResponse.next()

  // Static assets: cache for 1 year
  if (request.nextUrl.pathname.startsWith('/images/')) {
    response.headers.set('Cache-Control', 'public, max-age=31536000, immutable')
  }

  // HTML pages: no cache (validate always)
  if (request.nextUrl.pathname.endsWith('.html') || request.nextUrl.pathname === '/') {
    response.headers.set('Cache-Control', 'public, max-age=0, must-revalidate')
  }

  // API responses: 5 minutes
  if (request.nextUrl.pathname.startsWith('/api/')) {
    response.headers.set('Cache-Control', 'public, max-age=300')
  }

  return response
}
```

### 5. Client-Side Caching with TanStack Query

```typescript
// features/posts/hooks/usePosts.ts
import { useQuery } from '@tanstack/react-query'

export function usePosts() {
  return useQuery({
    queryKey: ['posts'],
    queryFn: async () => {
      const res = await fetch('/api/posts')
      return res.json()
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
  })
}
```

---

## Database Query Optimization

### 1. Prisma `select` Over `include` (Prevent Over-fetching)

```typescript
// ❌ BAD: Over-fetches all fields
const user = await db.user.findUnique({
  where: { id },
  include: { posts: true, profile: true },
})

// ✅ GOOD: Select only needed fields
const user = await db.user.findUnique({
  where: { id },
  select: {
    id: true,
    email: true,
    name: true,
    posts: {
      select: { id: true, title: true },
    },
  },
})
```

### 2. Pagination to Reduce Memory

```typescript
// app/blog/page.tsx
const page = 1
const pageSize = 20

const posts = await db.post.findMany({
  skip: (page - 1) * pageSize,
  take: pageSize,
  select: { id: true, title: true, published: true },
})

const total = await db.post.count()
const hasMore = (page - 1) * pageSize + posts.length < total
```

### 3. Avoid N+1 Queries with Eager Loading

```typescript
// ❌ BAD: N+1 queries
const users = await db.user.findMany()
for (const user of users) {
  const posts = await db.post.findMany({
    where: { authorId: user.id },
  })
  user.posts = posts
}

// ✅ GOOD: Single query with eager loading
const users = await db.user.findMany({
  select: {
    id: true,
    email: true,
    posts: {
      select: { id: true, title: true },
    },
  },
})
```

### 4. Database Indexes for Query Performance

```prisma
// prisma/schema.prisma
model Post {
  id        String   @id @default(cuid())
  title     String
  slug      String   @unique // Creates index automatically
  authorId  String
  author    User     @relation(fields: [authorId], references: [id])
  createdAt DateTime @default(now())

  // Add index for common queries
  @@index([authorId])
  @@index([createdAt])
}

model User {
  id    String @id @default(cuid())
  email String @unique // Creates index automatically
  posts Post[]
}
```

### 5. Connection Pooling

```typescript
// lib/prisma.ts
import { PrismaClient } from '@prisma/client'

const globalForPrisma = global as unknown as { prisma: PrismaClient }

const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    // Enable query logging in development
    log:
      process.env.NODE_ENV === 'development'
        ? ['query', 'error', 'warn']
        : ['error'],
  })

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}

export default prisma
```

### 6. Raw Queries for Complex Operations

```typescript
// For complex aggregations or transactions
const results = await db.$queryRaw<Array<{ count: number }>>`
  SELECT COUNT(*) as count FROM User WHERE createdAt > ${startDate}
`
```

---

## API Response Optimization

### 1. Compression with gzip/brotli

Configured automatically in Next.js, but verify in production:

```typescript
// next.config.ts
const nextConfig: NextConfig = {
  compress: true, // Enable gzip compression (default)
}
```

### 2. Streaming Responses

Use streaming for large responses:

```typescript
// app/api/large-data/route.ts
export async function GET() {
  const stream = new ReadableStream({
    async start(controller) {
      for (let i = 0; i < 10000; i++) {
        controller.enqueue(`data: ${JSON.stringify({ item: i })}\n\n`)
        if (i % 100 === 0) {
          await new Promise(resolve => setTimeout(resolve, 10))
        }
      }
      controller.close()
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
    },
  })
}
```

### 3. Response Pagination for APIs

```typescript
// Hono API with pagination
app.get('/api/posts', async (c) => {
  const page = parseInt(c.req.query('page') || '1')
  const limit = parseInt(c.req.query('limit') || '20')

  const posts = await db.post.findMany({
    skip: (page - 1) * limit,
    take: limit,
  })

  const total = await db.post.count()

  return c.json({
    data: posts,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  })
})
```

### 4. Conditional Requests (ETag/Last-Modified)

```typescript
// lib/api/response.ts
export function withETag(response: Response, content: unknown) {
  const hash = crypto
    .subtle
    .digest('SHA-256', new TextEncoder().encode(JSON.stringify(content)))
  
  const etag = `"${Buffer.from(await hash).toString('hex')}"`
  response.headers.set('ETag', etag)
  return response
}
```

---

## Server-Side Rendering (SSR) Performance

### 1. Streaming HTML with Suspense

```typescript
// app/page.tsx
import { Suspense } from 'react'
import { HeavyComponent } from '@/components/HeavyComponent'
import { Skeleton } from '@/components/Skeleton'

export default function Page() {
  return (
    <div>
      <h1>Fast Loading</h1>
      
      <Suspense fallback={<Skeleton />}>
        <HeavyComponent />
      </Suspense>
    </div>
  )
}
```

### 2. Server Action Optimization

```typescript
// lib/actions/posts.ts
'use server'

import { cache } from 'react'

// Cache the result during the request
const getCachedPost = cache(async (id: string) => {
  return await db.post.findUnique({
    where: { id },
    select: { id: true, title: true, content: true },
  })
})

export async function getPost(id: string) {
  return getCachedPost(id)
}
```

### 3. Parallel Data Fetching

```typescript
// app/dashboard/page.tsx
async function fetchUser(id: string) {
  return await db.user.findUnique({ where: { id } })
}

async function fetchPosts(userId: string) {
  return await db.post.findMany({ where: { authorId: userId } })
}

export default async function Dashboard({ params }: { params: { id: string } }) {
  // Fetch in parallel, not sequential
  const [user, posts] = await Promise.all([
    fetchUser(params.id),
    fetchPosts(params.id),
  ])

  return <div>{/* render */}</div>
}
```

---

## Client-Side Performance

### 1. React.memo for Expensive Components

```typescript
// components/ExpensiveChart.tsx
import { memo } from 'react'

const ExpensiveChart = memo(({ data }: { data: unknown }) => {
  // Complex rendering logic
  return <canvas>{/* chart */}</canvas>
}, (prevProps, nextProps) => {
  // Custom comparison
  return prevProps.data === nextProps.data
})

export default ExpensiveChart
```

### 2. useMemo for Expensive Calculations

```typescript
// components/Dashboard.tsx
'use client'

import { useMemo } from 'react'

export function Dashboard({ items }: { items: unknown[] }) {
  const sorted = useMemo(() => {
    return items.sort((a, b) => b.value - a.value)
  }, [items])

  return <div>{/* render sorted items */}</div>
}
```

### 3. useCallback for Memoized Functions

```typescript
// ✅ GOOD: Prevent unnecessary re-renders
'use client'

import { useCallback } from 'react'

export function Form({ onSubmit }: { onSubmit: (data: unknown) => void }) {
  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({ /* form data */ })
  }, [onSubmit])

  return <form onSubmit={handleSubmit}>{/* form fields */}</form>
}
```

### 4. Virtual Scrolling for Long Lists

Install `react-window`:

```bash
npm install react-window
```

```typescript
'use client'

import { FixedSizeList } from 'react-window'

export function LargeList({ items }: { items: unknown[] }) {
  const Row = ({ index, style }: { index: number; style: unknown }) => (
    <div style={style}>{items[index]}</div>
  )

  return (
    <FixedSizeList
      height={600}
      itemCount={items.length}
      itemSize={35}
      width="100%"
    >
      {Row}
    </FixedSizeList>
  )
}
```

---

## Monitoring & Metrics

### 1. Web Vitals Dashboard

Create a metrics endpoint to collect real-world data:

```typescript
// app/api/metrics/route.ts
import { NextRequest, NextResponse } from 'next/server'

interface Metric {
  name: string
  value: number
  url: string
  userAgent: string
}

export async function POST(request: NextRequest) {
  const metric: Metric = await request.json()

  // Store in database or analytics service
  console.log(`[${metric.name}] ${metric.value}ms`)

  // Send to external analytics
  await fetch('https://analytics.example.com/metrics', {
    method: 'POST',
    body: JSON.stringify(metric),
  }).catch(() => {}) // Fail silently

  return NextResponse.json({ success: true })
}
```

### 2. Real User Monitoring (RUM) with Sentry

```bash
npm install @sentry/nextjs
```

```typescript
// sentry.client.config.ts
import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
  beforeSend(event) {
    // Filter sensitive data
    return event
  },
})
```

### 3. Performance Monitoring with Vercel Analytics

Automatic with Vercel deployment. For self-hosted, use Google Analytics:

```typescript
// lib/ga.ts
export function reportWebVitals(metric: { name: string; value: number }) {
  if (window.gtag) {
    window.gtag('event', metric.name, {
      event_category: 'Web Vitals',
      event_label: metric.name,
      value: Math.round(metric.value),
      non_interaction: true,
    })
  }
}
```

---

## Production Checklist

### Pre-Deployment

- [ ] Run `npm run build` and verify no errors
- [ ] Run `npm run lint` and fix all warnings
- [ ] Test Core Web Vitals on local build: `npm run build && npm start`
- [ ] Analyze bundle size: `ANALYZE=true npm run build`
- [ ] Run E2E tests: `npx playwright test`
- [ ] Verify all images use `next/image`
- [ ] Enable compression in `next.config.ts`
- [ ] Configure cache headers in `middleware.ts`
- [ ] Set up monitoring (Sentry, Vercel Analytics, etc.)

### Database

- [ ] Ensure all database queries use `select` instead of `include`
- [ ] Create indexes for frequently queried fields
- [ ] Enable connection pooling
- [ ] Set up database backups
- [ ] Test pagination for large datasets

### API

- [ ] Add rate limiting to all endpoints
- [ ] Enable gzip compression
- [ ] Set up monitoring/logging
- [ ] Test error handling
- [ ] Verify response times < 200ms

### Deployment

- [ ] Set environment variables in production
- [ ] Enable CDN for static assets
- [ ] Configure S3/blob storage for uploads
- [ ] Set up monitoring alerts
- [ ] Enable auto-scaling if applicable

### Post-Deployment

- [ ] Monitor Web Vitals for first week
- [ ] Check error logs daily
- [ ] Verify database performance
- [ ] Review user analytics
- [ ] Gather performance feedback

---

## Resources & References

- **Next.js Optimization:** https://nextjs.org/docs/app/building-your-application/optimizing
- **Web Vitals:** https://web.dev/vitals/
- **Sentry:** https://sentry.io/
- **Vercel Analytics:** https://vercel.com/analytics
- **TanStack Query:** https://tanstack.com/query/latest
- **Prisma Performance:** https://www.prisma.io/docs/orm/prisma-client/queries/performance

---

**End of Performance & Optimization Guide**
