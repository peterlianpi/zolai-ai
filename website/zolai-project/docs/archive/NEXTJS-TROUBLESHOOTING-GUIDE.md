# Next.js 16 Troubleshooting & Common Issues Guide

**Version:** 2.0.0 | **Last Updated:** April 2026 | **Next.js:** 16.x | **Target:** Production-Ready

> Comprehensive troubleshooting guide for common Next.js 16, Prisma 7, Better Auth 2.x, and PostgreSQL/MySQL issues. Includes debug workflows, error resolution, and solutions.

## Table of Contents

1. [Debug Workflow](#debug-workflow)
2. [Build & Deployment Issues](#build--deployment-issues)
3. [Database Connection Issues](#database-connection-issues)
4. [Authentication Issues](#authentication-issues)
5. [API & Routing Issues](#api--routing-issues)
6. [Performance Issues](#performance-issues)
7. [File Upload & Storage Issues](#file-upload--storage-issues)
8. [Environment & Configuration Issues](#environment--configuration-issues)
9. [Development Server Issues](#development-server-issues)
10. [Production Issues](#production-issues)

---

## Debug Workflow

### Step 1: Enable Debug Logging

```bash
# Development mode with detailed logging
DEBUG=* npm run dev

# Prisma debug mode
DEBUG=prisma:* npm run dev

# Next.js debug mode
DEBUG=next:* npm run dev

# All debug combined
DEBUG=* npm run dev 2>&1 | tee debug.log
```

### Step 2: Check Error Messages

1. **Read the full error message** - scroll up to find the root cause
2. **Check the error location** - file path and line number
3. **Look for stack traces** - shows the call chain
4. **Check for environment variables** - missing .env values

### Step 3: Isolate the Problem

```bash
# Test database connection only
bunx prisma db execute --stdin < /dev/null

# Test build without serving
bun run build

# Test specific API route
curl http://localhost:3000/api/health

# Test database query directly
bunx prisma studio
```

### Step 4: Search for Similar Issues

1. Check the relevant docs in this guide
2. Search GitHub issues for the error message
3. Check Stack Overflow with the error
4. Check the official documentation

### Step 5: Reset & Rebuild

```bash
# Clear Next.js cache
rm -rf .next

# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
bun install

# Reset database
bunx prisma migrate reset

# Rebuild everything
bun run build
```

---

## Build & Deployment Issues

### Issue: `Error: Element type is invalid`

**Cause:** Missing `'use client'` directive or incorrect React component export

**Solution:**

```typescript
// ❌ WRONG: Server component with hooks
export default function Component() {
  const [state, setState] = useState(0)
  return <div>{state}</div>
}

// ✅ CORRECT: Add 'use client'
'use client'

import { useState } from 'react'

export default function Component() {
  const [state, setState] = useState(0)
  return <div>{state}</div>
}
```

### Issue: `Build failed with "Cannot find module"`

**Cause:** Wrong import path or missing file

**Solution:**

```bash
# Verify file exists
ls -la path/to/file.ts

# Check for case sensitivity issues (macOS/Windows vs Linux)
# Fix by using correct case or using absolute imports

# Verify tsconfig paths
cat tsconfig.json | grep -A 10 '"paths"'

# Rebuild node_modules
bun install
rm -rf .next
bun run build
```

### Issue: `TypeError: Cannot read property 'X' of undefined`

**Cause:** Accessing property on undefined/null value

**Solution:**

```typescript
// ❌ WRONG: Direct access
const name = user.profile.name

// ✅ CORRECT: Safe access
const name = user?.profile?.name ?? 'Unknown'

// ✅ CORRECT: Type guard
if (user && user.profile) {
  const name = user.profile.name
}
```

### Issue: `SyntaxError: Unexpected token < in JSON at position 0`

**Cause:** API returning HTML error page instead of JSON

**Solution:**

```bash
# Check API endpoint
curl -i http://localhost:3000/api/endpoint

# Look for:
# - 404 (wrong endpoint)
# - 500 (server error)
# - Wrong Content-Type header

# Fix: Ensure API returns JSON
export async function GET() {
  return Response.json({ data: null })
}
```

### Issue: `Port 3000 already in use`

**Solution:**

```bash
# Kill process using port 3000
lsof -i :3000
kill -9 <PID>

# Or use different port
PORT=3001 npm run dev

# Or on Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

---

## Database Connection Issues

### Issue: `Can't reach database server`

**Cause:** Database not running or connection string incorrect

**Solution - PostgreSQL:**

```bash
# Check if PostgreSQL is running
systemctl status postgresql

# Start PostgreSQL
sudo systemctl start postgresql

# Verify connection string
echo $DATABASE_URL
# Should be: postgresql://user:password@localhost:5432/dbname

# Test connection directly
psql $DATABASE_URL -c "SELECT 1"

# If using Neon, test Neon connection
psql "$(echo $DATABASE_URL | sed 's/^postgresql/postgresql/')" -c "SELECT 1"
```

**Solution - MySQL:**

```bash
# Check if MySQL is running
systemctl status mysql

# Start MySQL
sudo systemctl start mysql

# Verify connection string
echo $DATABASE_URL
# Should be: mysql://user:password@localhost:3306/dbname

# Test connection directly
mysql -h localhost -u root -p -e "SELECT 1"

# If using Railway/other host
mysql -h your-host -u user -p dbname -e "SELECT 1"
```

### Issue: `PrismaClientInitializationError: Can't connect to database`

**Cause:** Invalid DATABASE_URL in .env

**Solution:**

```bash
# Check .env file
cat .env

# Verify format:
# PostgreSQL: postgresql://user:password@host:port/database
# MySQL: mysql://user:password@host:port/database

# Remove any trailing spaces or newlines
sed -i 's/[[:space:]]*$//' .env

# Regenerate Prisma client
bunx prisma generate

# Try connection again
bunx prisma db execute --stdin < /dev/null
```

### Issue: `Migration pending` or `The database schema is not in sync`

**Cause:** Pending migrations not applied

**Solution:**

```bash
# Check migration status
bunx prisma migrate status

# Apply pending migrations
bunx prisma migrate deploy

# If local development, use dev command
bunx prisma migrate dev

# Reset database (CAREFUL: deletes data)
bunx prisma migrate reset
```

### Issue: `Unique constraint failed` (P2002)

**Cause:** Trying to insert duplicate value in unique field

**Solution:**

```typescript
// ❌ WRONG: No error handling
const user = await db.user.create({
  data: { email: 'test@example.com' }
})

// ✅ CORRECT: Handle unique constraint
try {
  const user = await db.user.create({
    data: { email: 'test@example.com' }
  })
} catch (error: any) {
  if (error.code === 'P2002') {
    return { error: 'Email already exists' }
  }
  throw error
}

// ✅ CORRECT: Check first
const existing = await db.user.findUnique({
  where: { email: 'test@example.com' }
})

if (existing) {
  return { error: 'Email already exists' }
}

const user = await db.user.create({
  data: { email: 'test@example.com' }
})
```

### Issue: `Foreign key constraint failed` (P2003)

**Cause:** Referenced record doesn't exist

**Solution:**

```typescript
// ❌ WRONG: No validation
const post = await db.post.create({
  data: {
    title: 'Test',
    authorId: 'non-existent-id'
  }
})

// ✅ CORRECT: Verify foreign key exists
const author = await db.user.findUnique({
  where: { id: authorId }
})

if (!author) {
  return { error: 'Author not found' }
}

const post = await db.post.create({
  data: { title: 'Test', authorId }
})
```

### Issue: Query taking too long

**Cause:** Missing database indexes or inefficient query

**Solution:**

```bash
# Analyze slow queries
bunx prisma db execute --stdin << EOF
SELECT * FROM pg_stat_statements WHERE mean_exec_time > 100;
EOF

# Check query plan
EXPLAIN ANALYZE SELECT * FROM User WHERE email = 'test@example.com';
```

```typescript
// ✅ Add indexes to schema
model User {
  id    String @id
  email String @unique
  createdAt DateTime @default(now())

  @@index([createdAt]) // Add for queries filtering by createdAt
}

// ✅ Use select instead of include
const users = await db.user.findMany({
  select: { id: true, email: true } // Only fetch needed fields
})

// ✅ Add pagination
const users = await db.user.findMany({
  take: 20,
  skip: 0,
})
```

---

## Authentication Issues

### Issue: `Better Auth: Session not found`

**Cause:** Session expired or invalid session token

**Solution:**

```typescript
// Check if better auth is initialized
import { auth } from '@/lib/auth'

// Debug: Log session info
const session = await auth.api.getSession({
  headers: headers(),
})

console.log('Session:', session)

// Verify Better Auth config
// lib/auth.ts should have proper database config
```

### Issue: `OAuth provider not configured`

**Cause:** Missing OAuth credentials or incorrect client ID/secret

**Solution:**

```bash
# Check environment variables
echo $GITHUB_CLIENT_ID
echo $GITHUB_CLIENT_SECRET
echo $GOOGLE_CLIENT_ID
echo $GOOGLE_CLIENT_SECRET

# Verify in .env file
cat .env | grep -i "client"

# If missing, add:
# GITHUB_CLIENT_ID=your_id
# GITHUB_CLIENT_SECRET=your_secret
```

### Issue: `CSRF token mismatch`

**Cause:** Form request missing CSRF token

**Solution:**

```typescript
// ✅ Ensure form includes CSRF token
'use client'

import { useCSRFToken } from '@/lib/auth-client'

export function LoginForm() {
  const csrfToken = useCSRFToken()

  return (
    <form method="POST" action="/api/auth/signin">
      <input type="hidden" name="csrf" value={csrfToken} />
      {/* form fields */}
    </form>
  )
}
```

### Issue: `User not authenticated when accessing protected route`

**Cause:** Protected route not properly checking session

**Solution:**

```typescript
// ✅ Verify session before rendering
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'

export default async function ProtectedPage() {
  const session = await auth.api.getSession({
    headers: headers(),
  })

  if (!session) {
    redirect('/login')
  }

  return <div>Protected content</div>
}
```

---

## API & Routing Issues

### Issue: `404 Not Found` for API route

**Cause:** Wrong endpoint path or method

**Solution:**

```bash
# Check route exists
ls -la app/api/

# Verify endpoint path
# Should be: /api/<path>
# Not: /api/<path>/route.ts

# Test with correct method
curl -X GET http://localhost:3000/api/endpoint
curl -X POST http://localhost:3000/api/endpoint

# Check Hono routes
# Route must be in app/api/[[...route]]/route.ts
```

### Issue: `Cannot POST /api/endpoint` (405 Method Not Allowed)

**Cause:** Route doesn't support POST method

**Solution:**

```typescript
// ✅ Add POST handler
export async function POST(request: Request) {
  return Response.json({ data: null })
}

// ✅ For Hono routes
app.post('/endpoint', async (c) => {
  return c.json({ data: null })
})
```

### Issue: `CORS error: Access-Control-Allow-Origin`

**Cause:** Cross-origin request without proper CORS headers

**Solution:**

```typescript
// middleware.ts
export function middleware(request: NextRequest) {
  const response = NextResponse.next()

  // Add CORS headers
  response.headers.set('Access-Control-Allow-Origin', '*')
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')

  // Handle preflight
  if (request.method === 'OPTIONS') {
    return response
  }

  return response
}

export const config = {
  matcher: '/api/:path*',
}
```

### Issue: `Hono route not working`

**Cause:** Route not properly registered in app router

**Solution:**

```typescript
// ✅ CORRECT: Use .route() for sub-routers
import { Hono } from 'hono'
import { featureRouter } from './feature'

const app = new Hono()

// Correct way to chain routes
const routes = app
  .route('/feature', featureRouter)

export type AppType = typeof routes

// ✅ In sub-router
export const featureRouter = new Hono()
  .get('/', async (c) => {
    return c.json({ data: [] })
  })
```

---

## Performance Issues

### Issue: Slow initial page load (LCP > 2.5s)

**Cause:** Heavy JavaScript, large images, or unoptimized database queries

**Debug Steps:**

```bash
# Check Core Web Vitals
# 1. Open DevTools → Lighthouse
# 2. Run audit
# 3. Check LCP score

# Check bundle size
ANALYZE=true bun run build

# Check image optimization
# Verify all images use next/image with priority
grep -r "img src=" app/
```

**Solution:**

```typescript
// 1. Optimize images
import Image from 'next/image'

<Image src="/hero.jpg" alt="Hero" priority width={1200} height={600} />

// 2. Use Suspense for slow components
<Suspense fallback={<Skeleton />}>
  <SlowComponent />
</Suspense>

// 3. Optimize database queries
// Use select instead of include
const user = await db.user.findUnique({
  where: { id },
  select: { id: true, email: true }
})
```

### Issue: High memory usage or crashes

**Cause:** Memory leak or loading too much data

**Solution:**

```bash
# Monitor memory usage
node --max-old-space-size=4096 node_modules/.bin/next start

# Check for memory leaks
npm install --save-dev clinic
clinic doctor -- npm run dev
```

```typescript
// 1. Use pagination instead of loading all data
const users = await db.user.findMany({
  take: 100,
  skip: 0,
})

// 2. Clear caches periodically
import NodeCache from 'node-cache'
const cache = new NodeCache({ stdTTL: 600 })

// 3. Close database connections
await db.$disconnect()
```

---

## File Upload & Storage Issues

### Issue: `NoSuchBucket` or S3 bucket not accessible

**Cause:** Wrong bucket name or credentials

**Solution:**

```bash
# Verify S3 credentials
echo $AWS_ACCESS_KEY_ID
echo $AWS_SECRET_ACCESS_KEY
echo $AWS_S3_BUCKET

# Test S3 access
aws s3 ls s3://your-bucket --profile default

# If using IAM, verify permissions
aws iam get-user-policy --user-name your-user --policy-name your-policy
```

### Issue: `Access Denied` when uploading to S3

**Cause:** IAM permissions not set correctly

**Solution:**

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "s3:DeleteObject",
        "s3:ListBucket"
      ],
      "Resource": [
        "arn:aws:s3:::your-bucket",
        "arn:aws:s3:::your-bucket/*"
      ]
    }
  ]
}
```

### Issue: `File upload fails with 413 Payload Too Large`

**Cause:** File exceeds size limit

**Solution:**

```typescript
// next.config.ts
const nextConfig: NextConfig = {
  serverRuntimeConfig: {
    // Maximum file size: 50MB
    maxFileSize: 50 * 1024 * 1024,
  },
}

// app/api/upload/route.ts
export async function POST(request: Request) {
  const contentLength = request.headers.get('content-length')
  if (!contentLength || parseInt(contentLength) > 50 * 1024 * 1024) {
    return Response.json(
      { error: 'File too large' },
      { status: 413 }
    )
  }
  // Handle upload
}
```

---

## Environment & Configuration Issues

### Issue: Environment variables not loading

**Cause:** .env file not found or not loaded

**Solution:**

```bash
# Verify .env file exists
ls -la .env .env.local .env.production

# Check for syntax errors
cat .env

# Reload environment
# For development: restart npm run dev
# For production: restart the application

# Verify Next.js sees variables
npm run build 2>&1 | grep -i "env"
```

### Issue: `process.env.VARIABLE is undefined`

**Cause:** Environment variable not prefixed correctly

**Solution:**

```typescript
// ❌ WRONG: Client-side only sees NEXT_PUBLIC_ vars
const apiUrl = process.env.API_URL // undefined

// ✅ CORRECT: Use NEXT_PUBLIC_ prefix
const apiUrl = process.env.NEXT_PUBLIC_API_URL // works

// ✅ CORRECT: Server-side can use any prefix
const dbUrl = process.env.DATABASE_URL // works on server

// ✅ CORRECT: Access in client component
'use client'

const apiUrl = process.env.NEXT_PUBLIC_API_URL
```

### Issue: `Required environment variable not set`

**Solution:**

```bash
# Copy example to local
cp .env.example .env.local

# Fill in missing values
nano .env.local

# Verify all required vars are set
grep -E "API_|DATABASE_|AWS_" .env.local

# Restart dev server
npm run dev
```

---

## Development Server Issues

### Issue: Hot reload not working

**Cause:** File watcher not detecting changes

**Solution:**

```bash
# Check file system limits (Linux)
cat /proc/sys/fs/inotify/max_user_watches

# Increase limit if needed
echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf
sudo sysctl -p

# Or use polling (slower but more compatible)
NEXT_IGNORE_ESLINT_ERRORS=true npm run dev
```

### Issue: `EADDRINUSE: address already in use`

**Solution:**

```bash
# Kill process using port
lsof -i :3000 | grep LISTEN | awk '{print $2}' | xargs kill -9

# Or use different port
PORT=3001 npm run dev

# Check what's using the port
netstat -tlnp | grep 3000
```

### Issue: ESLint or type errors not showing in terminal

**Solution:**

```bash
# Run lint manually
bun run lint

# Run type check
bunx tsc --noEmit

# Clear cache
rm -rf node_modules/.cache
```

---

## Production Issues

### Issue: `Application crashed` with no error message

**Cause:** Unhandled promise rejection or error

**Solution:**

```bash
# Check server logs
tail -f /var/log/app.log

# Check PM2 logs
pm2 logs app

# Restart with verbose logging
DEBUG=* pm2 start ecosystem.config.js
```

### Issue: `502 Bad Gateway` or `504 Gateway Timeout`

**Cause:** Application not responding or taking too long

**Solution:**

```bash
# Check if app is running
pm2 status

# Check resource usage
pm2 monit

# Increase timeout if needed
# In Nginx: proxy_connect_timeout 60s;
# In HAProxy: timeout connect 60s

# Restart application
pm2 restart app
```

### Issue: Database connection pool exhausted

**Cause:** Too many simultaneous database connections

**Solution:**

```typescript
// lib/prisma.ts
const prisma = new PrismaClient({
  // Set connection pool size
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
  log: ['error'],
})

// On shutdown, disconnect
process.on('SIGTERM', async () => {
  await prisma.$disconnect()
  process.exit(0)
})
```

```bash
# Monitor connections (PostgreSQL)
psql -c "SELECT count(*) FROM pg_stat_activity;"

# Monitor connections (MySQL)
mysql -e "SHOW PROCESSLIST;"
```

### Issue: OutOfMemory error on deployment

**Cause:** Not enough RAM or memory leak

**Solution:**

```bash
# Increase Node.js heap size
NODE_OPTIONS=--max-old-space-size=4096 npm start

# In PM2 ecosystem file
{
  "max_memory_restart": "1G",
  "node_args": "--max-old-space-size=2048"
}
```

---

## Quick Debug Commands

```bash
# Health check
curl -i http://localhost:3000/api/health

# Database check
bunx prisma db execute --stdin < /dev/null

# Build check
bun run build

# Type check
bunx tsc --noEmit

# Lint check
bun run lint

# Test check
bun test

# See all environment variables
env | grep -E "NEXT_|DATABASE_|AWS_"

# Check disk space
df -h

# Check memory
free -h

# Check running processes
ps aux | grep node
```

---

## Resources & Support

- **Next.js Issues:** https://github.com/vercel/next.js/issues
- **Prisma Issues:** https://github.com/prisma/prisma/issues
- **Better Auth Issues:** https://github.com/better-auth/better-auth/issues
- **Stack Overflow:** https://stackoverflow.com/questions/tagged/next.js
- **Discord Communities:** Next.js Discord, Prisma Discord

---

**End of Troubleshooting & Common Issues Guide**
