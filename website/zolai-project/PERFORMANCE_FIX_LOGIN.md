# Performance Fix: Login Page Load Time

## Problem

Login page was taking 400ms–4s to load due to:
- Root layout calling `getSiteConfig()` twice (metadata + layout body)
- Circuit breaker timeout at 2.5s causing frequent fallbacks
- DB query fetching all columns instead of just `key` and `value`

## Symptoms

```
GET /login?callbackURL=%2Fdashboard 200 in 4.0s (application-code: 3.9s)
[CircuitBreaker:site-settings] operation failed (1/2) (Operation timeout after 2500ms)
[Site Config] Falling back to cached/default settings: Operation timeout after 2500ms
```

## Root Cause

`app/layout.tsx` called `getSiteConfig()` in both:
1. `generateMetadata()` function
2. Layout component body

Even though `getSiteSettings()` uses React `cache()`, the two calls happened in different execution contexts, causing duplicate DB queries.

## Solution

### 1. Layout-Level Cache Wrapper
Added `getCachedSiteConfig = cache(getSiteConfig)` in `app/layout.tsx` to ensure both metadata and layout body share the same cached result.

### 2. Increased Circuit Breaker Timeout
Changed from 2.5s → 5s to accommodate slower DB connections (Neon free tier).

### 3. Optimized DB Query
Added `select: { key: true, value: true }` to only fetch needed columns.

## Changes

**app/layout.tsx:**
```typescript
import { cache } from "react";

const getCachedSiteConfig = cache(getSiteConfig);

export async function generateMetadata(): Promise<Metadata> {
  const siteConfig = await getCachedSiteConfig(); // ← was getSiteConfig()
  return buildSiteMetadata(siteConfig);
}

export default async function RootLayout({ children }) {
  const siteConfig = await getCachedSiteConfig(); // ← was getSiteConfig()
  // ...
}
```

**lib/site-config.ts:**
```typescript
const settings = await runWithCircuitBreaker(
  "site-settings",
  () => prisma.siteSetting.findMany({ select: { key: true, value: true } }), // ← added select
  {
    timeoutMs: 5000,        // ← was 2500
    failureThreshold: 3,    // ← was 2
    openMs: 30000,
  },
);
```

## Expected Impact

- **Reduced DB queries:** 2 → 1 per page load
- **Faster response:** No duplicate queries = ~50% faster
- **Fewer timeouts:** 5s timeout accommodates slow connections
- **Lower bandwidth:** Select only needed columns

## Testing

```bash
# Before: 400ms–4s with frequent timeouts
# After: Should be consistently <500ms

# Monitor logs for:
# - No more "[CircuitBreaker:site-settings] operation failed"
# - No more fallback warnings
# - Consistent response times
```

## Related Files

- `app/layout.tsx` - Root layout with duplicate calls
- `lib/site-config.ts` - Site settings cache and circuit breaker
- `lib/prisma.ts` - Database connection pool (unchanged)
