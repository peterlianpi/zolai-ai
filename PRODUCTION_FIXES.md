# Production Fixes - Quick Start Guide

## 🔴 CRITICAL FIXES (Do First)

### 1. Fix TypeScript Errors in Seed Scripts

**Error:**
```
scripts/seed-new-content-2026.ts(265,9): error TS2322
scripts/seed-public-content.ts(49,34): error TS2322
```

**Fix:** Check what fields are missing in Post creation:
```bash
cd /home/peter/Documents/Projects/zolai/website/zolai-project
grep -A 10 "line 265" scripts/seed-new-content-2026.ts
grep -A 10 "line 49" scripts/seed-public-content.ts
```

**Solution:** Add missing required fields (likely `isFeatured`, `isPopular`, or `status`)

---

### 2. Fix Testing Framework

**Error:**
```
Error: Vitest cannot be imported in a CommonJS module using require()
```

**Fix:** Choose one approach:

**Option A: Remove Vitest (Recommended)**
```bash
cd /home/peter/Documents/Projects/zolai/website/zolai-project
npm uninstall vitest @vitest/ui
rm -rf integration/
```

**Option B: Migrate to ESM**
```bash
# Update playwright.config.ts to use ESM
# Update package.json: "type": "module"
```

---

### 3. Add HTML Sanitization (XSS Prevention)

**File:** `lib/utils/sanitize.ts` (create new)

```typescript
import DOMPurify from 'isomorphic-dompurify';

export function sanitizeHtml(html: string): string {
  return DOMPurify.default.sanitize(html, {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'h1', 'h2', 'h3', 'ul', 'ol', 'li', 'a', 'blockquote', 'code', 'pre'],
    ALLOWED_ATTR: ['href', 'target', 'rel'],
  });
}
```

**Install:**
```bash
npm install isomorphic-dompurify
```

**Use in PostCard:**
```typescript
import { sanitizeHtml } from '@/lib/utils/sanitize';

export function PostCard({ contentHtml, ...props }) {
  return (
    <div dangerouslySetInnerHTML={{ __html: sanitizeHtml(contentHtml) }} />
  );
}
```

---

### 4. Add Error Boundaries

**File:** `app/(public)/error.tsx` (create new)

```typescript
'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h2 className="text-2xl font-bold mb-4">Something went wrong!</h2>
      <button
        onClick={() => reset()}
        className="px-4 py-2 bg-blue-600 text-white rounded"
      >
        Try again
      </button>
    </div>
  );
}
```

**File:** `app/(protected)/error.tsx` (create new)

```typescript
'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h2 className="text-2xl font-bold mb-4">Admin Error</h2>
      <p className="text-gray-600 mb-4">{error.message}</p>
      <button
        onClick={() => reset()}
        className="px-4 py-2 bg-blue-600 text-white rounded"
      >
        Try again
      </button>
    </div>
  );
}
```

---

### 5. Add Security Headers to API

**File:** `app/api/[[...route]]/route.ts` (update)

```typescript
export async function middleware(c: Context, next: Next) {
  // Add security headers
  c.header('X-Content-Type-Options', 'nosniff');
  c.header('X-Frame-Options', 'SAMEORIGIN');
  c.header('X-XSS-Protection', '1; mode=block');
  c.header('Referrer-Policy', 'strict-origin-when-cross-origin');
  c.header('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  
  await next();
}

app.use(middleware);
```

---

## 🟡 MEDIUM PRIORITY FIXES

### 6. Add Rate Limiting

**Install:**
```bash
npm install @upstash/ratelimit @upstash/redis
```

**File:** `lib/rate-limit.ts` (create new)

```typescript
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(100, '1 h'),
});
```

**Use in API:**
```typescript
import { ratelimit } from '@/lib/rate-limit';

app.post('/api/posts', async (c) => {
  const ip = c.req.header('x-forwarded-for') || 'unknown';
  const { success } = await ratelimit.limit(ip);
  
  if (!success) {
    return c.json({ error: 'Rate limit exceeded' }, 429);
  }
  
  // ... rest of handler
});
```

---

### 7. Add Error Tracking (Sentry)

**Install:**
```bash
npm install @sentry/nextjs
```

**File:** `sentry.client.config.ts` (create new)

```typescript
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
});
```

**File:** `sentry.server.config.ts` (create new)

```typescript
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
});
```

**Update:** `.env.production`

```
SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id
NEXT_PUBLIC_SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id
```

---

### 8. Add API Documentation (Swagger)

**Install:**
```bash
npm install @hono/swagger-ui
```

**File:** `app/api/[[...route]]/route.ts` (update)

```typescript
import { swaggerUI } from '@hono/swagger-ui';

app.get('/swagger', swaggerUI({ url: '/api/openapi.json' }));

app.get('/api/openapi.json', (c) => {
  return c.json({
    openapi: '3.0.0',
    info: { title: 'Zolai API', version: '1.0.0' },
    paths: {
      '/api/content/posts': {
        get: {
          summary: 'List posts',
          responses: { 200: { description: 'Posts list' } },
        },
      },
    },
  });
});
```

---

## ✅ VERIFICATION CHECKLIST

After applying fixes, verify:

```bash
# 1. TypeScript compiles
cd /home/peter/Documents/Projects/zolai/website/zolai-project
npx tsc --noEmit

# 2. Build succeeds
npm run build

# 3. No console errors
npm run dev

# 4. API responds
curl http://localhost:3000/api/content/posts

# 5. Error boundary works
# Navigate to non-existent page, should show error UI

# 6. Security headers present
curl -I http://localhost:3000/api/content/posts | grep X-
```

---

## 📋 DEPLOYMENT CHECKLIST

Before deploying to production:

- [ ] All TypeScript errors fixed
- [ ] Testing framework working
- [ ] HTML sanitization added
- [ ] Error boundaries added
- [ ] Security headers added
- [ ] Rate limiting configured
- [ ] Error tracking (Sentry) configured
- [ ] Environment variables set
- [ ] Database migrations run
- [ ] Backup tested
- [ ] Load testing passed
- [ ] Security audit passed

---

## 🚀 DEPLOYMENT COMMAND

```bash
cd /home/peter/Documents/Projects/zolai/website/zolai-project
export $(grep "TELEGRAM_BOT_TOKEN\|TELEGRAM_CHAT_ID" .env.production | xargs)
bash deploy-ssh.sh
```

---

## 📞 SUPPORT

If you encounter issues:

1. Check the full audit report: `PRODUCTION_AUDIT_REPORT.md`
2. Review error logs: `ssh zolai "journalctl -u zolai -n 50"`
3. Check database: `ssh zolai "sudo -u postgres psql zolai_prod -c 'SELECT * FROM post LIMIT 5;'"`
