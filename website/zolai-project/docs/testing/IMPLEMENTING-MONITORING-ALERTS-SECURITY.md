# Implementing Monitoring, Alerts & Security - Complete Guide

**Goal:** Add production-ready monitoring, analytics, alerting, and security to Zolai AI  
**Total Effort:** 18-25 days  
**Starting Point:** 40% complete monitoring, 60% complete security  

---

## Phase 1: Critical Monitoring (2-3 Days)

### Step 1: Setup Sentry (Error Tracking)

**Installation:**

```bash
npm install @sentry/nextjs
```

**Create `sentry.client.config.ts`:**

```typescript
import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  
  // Tracing
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  
  // Errors
  beforeSend(event) {
    // Filter sensitive data
    if (event.request?.url?.includes('/api/auth')) {
      return null // Don't send auth URLs
    }
    return event
  },

  // Ignore certain errors
  ignoreErrors: [
    'top.GLOBALS',
    'ResizeObserver loop limit exceeded',
    'Non-Error promise rejection captured',
  ],
})

export { Sentry }
```

**Create `sentry.server.config.ts`:**

```typescript
import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  
  // Capture server-side errors
  attachStacktrace: true,
  maxBreadcrumbs: 50,
})
```

**Update `middleware.ts`:**

```typescript
import { withSentry } from '@sentry/nextjs'
import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

export const middleware = withSentry((request: NextRequest) => {
  // Your middleware logic
  return NextResponse.next()
})

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
```

**Set Environment Variables:**

```bash
# .env.local
NEXT_PUBLIC_SENTRY_DSN=https://<key>@<org>.ingest.sentry.io/<project>
SENTRY_DSN=https://<key>@<org>.ingest.sentry.io/<project>
SENTRY_AUTH_TOKEN=your_token_here
```

**Cost:** Free tier includes 5,000 events/month

---

### Step 2: Add Email Notifications for Critical Events

**Create `lib/notifications/email-alert.ts`:**

```typescript
'use server'

import nodemailer from 'nodemailer'
import { getConfigValue } from '@/features/settings/server/config-service'

export async function sendSecurityAlert(
  adminEmail: string,
  alertType: string,
  details: Record<string, any>
) {
  const smtpHost = await getConfigValue('email:smtp_host')
  const smtpPort = parseInt(
    await getConfigValue('email:smtp_port') || '587'
  )
  const smtpUser = await getConfigValue('email:smtp_user')
  const smtpPassword = await getConfigValue('email:smtp_password')
  const fromEmail = await getConfigValue('email:from_email')

  const transporter = nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: smtpPort === 465,
    auth: {
      user: smtpUser,
      pass: smtpPassword,
    },
  })

  const alertTitle = getAlertTitle(alertType)
  const html = buildSecurityAlertEmail(alertTitle, details)

  await transporter.sendMail({
    from: fromEmail,
    to: adminEmail,
    subject: `🚨 SECURITY ALERT: ${alertTitle}`,
    html,
  })
}

function buildSecurityAlertEmail(title: string, details: Record<string, any>) {
  return `
    <html>
      <body style="font-family: Arial, sans-serif;">
        <h2 style="color: #d32f2f;">🚨 ${title}</h2>
        <div style="background: #f5f5f5; padding: 20px; border-radius: 5px;">
          <h4>Details:</h4>
          <ul>
            ${Object.entries(details)
              .map(([key, value]) => `<li><strong>${key}:</strong> ${value}</li>`)
              .join('')}
          </ul>
        </div>
        <p style="color: #999; font-size: 12px;">
          Sent at ${new Date().toISOString()}
        </p>
      </body>
    </html>
  `
}

function getAlertTitle(type: string): string {
  const titles: Record<string, string> = {
    SUSPICIOUS_LOGIN: 'Suspicious Login Detected',
    BRUTE_FORCE: 'Brute Force Attack Detected',
    SQL_INJECTION: 'SQL Injection Attempt Detected',
    XSS_ATTEMPT: 'XSS Attempt Detected',
    ACCOUNT_LOCKED: 'Account Locked',
    PASSWORD_BREACH: 'Password Breach Detected',
  }
  return titles[type] || 'Security Alert'
}
```

---

### Step 3: Add Slack Integration

**Install Slack SDK:**

```bash
npm install slack-sdk
```

**Create `lib/notifications/slack-alert.ts`:**

```typescript
'use server'

import { WebClient } from '@slack/web-api'

const slack = new WebClient(process.env.SLACK_BOT_TOKEN)

export async function sendSlackAlert(
  channel: string,
  title: string,
  details: Record<string, any>,
  severity: 'low' | 'medium' | 'high' | 'critical'
) {
  const colorMap = {
    low: '#36a64f',
    medium: '#ffc300',
    high: '#ff6b35',
    critical: '#d32f2f',
  }

  await slack.chat.postMessage({
    channel,
    attachments: [
      {
        color: colorMap[severity],
        title,
        fields: Object.entries(details).map(([key, value]) => ({
          title: key,
          value: String(value),
          short: false,
        })),
        ts: Math.floor(Date.now() / 1000),
      },
    ],
  })
}

export async function sendSecurityAlertToSlack(
  alertType: string,
  details: Record<string, any>,
  severity: 'low' | 'medium' | 'high' | 'critical'
) {
  const alertTitle = getAlertTitle(alertType)
  await sendSlackAlert('#security', alertTitle, details, severity)
}

export async function sendErrorAlertToSlack(error: Error, context: string) {
  const alertTitle = `🔴 Error in ${context}`
  await sendSlackAlert(
    '#errors',
    alertTitle,
    {
      Message: error.message,
      Stack: error.stack?.split('\n')[0] || 'N/A',
      Context: context,
      Timestamp: new Date().toISOString(),
    },
    'high'
  )
}

function getAlertTitle(type: string): string {
  const titles: Record<string, string> = {
    SUSPICIOUS_LOGIN: '🚨 Suspicious Login',
    BRUTE_FORCE: '🔐 Brute Force Attack',
    SQL_INJECTION: '💉 SQL Injection Attempt',
    XSS_ATTEMPT: '🖧 XSS Attempt',
    ACCOUNT_LOCKED: '🔒 Account Locked',
  }
  return titles[type] || '⚠️ Security Alert'
}
```

**Set Environment Variables:**

```bash
# Get from https://api.slack.com/apps
SLACK_BOT_TOKEN=xoxb-your-token-here
SLACK_SIGNING_SECRET=your-signing-secret
```

---

### Step 4: Add Security Headers Middleware

**Update `middleware.ts`:**

```typescript
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const response = NextResponse.next()

  // Content Security Policy
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline' *.vercel.live; style-src 'self' 'unsafe-inline'"
  )

  // HTTPS enforcement
  response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains')

  // Prevent clickjacking
  response.headers.set('X-Frame-Options', 'DENY')

  // Prevent MIME type sniffing
  response.headers.set('X-Content-Type-Options', 'nosniff')

  // Enable XSS protection
  response.headers.set('X-XSS-Protection', '1; mode=block')

  // Referrer policy
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')

  // Disable FLoC
  response.headers.set('Permissions-Policy', 'interest-cohort=()')

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
```

---

## Phase 2: Performance Monitoring (3-4 Days)

### Step 1: Create Performance Metrics Table

**Add to `prisma/schema.prisma`:**

```prisma
model PerformanceMetric {
  id            String   @id @default(cuid())
  endpoint      String
  method        String
  statusCode    Int
  responseTime  Int      // milliseconds
  requestSize   Int?
  responseSize  Int?
  userId        String?
  ip            String?
  userAgent     String?
  createdAt     DateTime @default(now())

  @@index([endpoint, method])
  @@index([statusCode])
  @@index([responseTime])
  @@index([userId])
  @@index([createdAt])
  @@map("performance_metric")
}

model DatabaseQuery {
  id        String   @id @default(cuid())
  query     String   @db.Text
  duration  Int      // milliseconds
  rows      Int?
  error     String?
  stack     String?  @db.Text
  createdAt DateTime @default(now())

  @@index([duration])
  @@index([error])
  @@index([createdAt])
  @@map("database_query")
}
```

**Run Migration:**

```bash
bunx prisma migrate dev --name add_performance_metrics
```

---

### Step 2: Add Performance Tracking Middleware

**Create `lib/performance.ts`:**

```typescript
import { db } from '@/lib/prisma'
import type { NextRequest, NextResponse } from 'next/server'

export async function trackPerformance(
  request: NextRequest,
  response: NextResponse,
  duration: number
) {
  // Don't track static assets
  if (request.nextUrl.pathname.match(/\.(js|css|png|jpg|ico)$/)) {
    return
  }

  try {
    await db.performanceMetric.create({
      data: {
        endpoint: request.nextUrl.pathname,
        method: request.method,
        statusCode: response.status,
        responseTime: duration,
        userId: extractUserIdFromRequest(request),
        ip: request.ip,
        userAgent: request.headers.get('user-agent') || undefined,
      },
    })
  } catch (error) {
    console.error('Failed to track performance:', error)
  }
}

function extractUserIdFromRequest(request: NextRequest): string | null {
  // Extract from JWT or session
  // This is pseudo-code, implement based on your auth
  return null
}
```

---

### Step 3: Add API Response Time Tracking

**Create `lib/api/track-response.ts`:**

```typescript
import { db } from '@/lib/prisma'

export async function trackApiResponse(
  endpoint: string,
  method: string,
  statusCode: number,
  duration: number,
  userId?: string
) {
  await db.performanceMetric.create({
    data: {
      endpoint,
      method,
      statusCode,
      responseTime: duration,
      userId,
    },
  })

  // Alert on slow endpoints
  if (duration > 1000) {
    console.warn(`Slow endpoint: ${method} ${endpoint} took ${duration}ms`)
    // Could send alert to Slack here
  }
}
```

---

### Step 4: Create Performance Dashboard

**Create `features/admin/components/performance-dashboard.tsx`:**

```typescript
'use client'

import { useQuery } from '@tanstack/react-query'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

export function PerformanceDashboard() {
  const { data: metrics } = useQuery({
    queryKey: ['performance-metrics'],
    queryFn: async () => {
      const res = await fetch('/api/admin/performance-metrics')
      return res.json()
    },
    refetchInterval: 5000,
  })

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Avg Response Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics?.avgResponseTime || 0}ms
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Error Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics?.errorRate || 0}%
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Requests/Min</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics?.requestsPerMinute || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Uptime</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics?.uptime || '99.9'}%
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <Card>
        <CardHeader>
          <CardTitle>Response Times (Last 24h)</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={metrics?.chartData || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="responseTime" stroke="#0066cc" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}
```

---

## Phase 3: Analytics (3-4 Days)

### Create Analytics Schema

```prisma
model PageView {
  id        String   @id @default(cuid())
  userId    String?  // Null for anonymous
  pathname  String
  referrer  String?
  duration  Int?     // Seconds on page
  ip        String?
  userAgent String?
  timestamp DateTime @default(now())

  @@index([userId, timestamp])
  @@index([pathname])
  @@index([timestamp])
  @@map("page_view")
}

model UserSession {
  id        String   @id @default(cuid())
  userId    String
  startedAt DateTime
  endedAt   DateTime?
  pageViews Int      @default(0)
  events    Int      @default(0)

  @@index([userId, startedAt])
  @@map("user_session")
}

model ConversionEvent {
  id        String   @id @default(cuid())
  userId    String?
  type      String   // "signup", "purchase", "download"
  value     Int?
  metadata  Json?
  timestamp DateTime @default(now())

  @@index([type, timestamp])
  @@index([userId])
  @@map("conversion_event")
}
```

---

## Phase 4: Health Checks (1-2 Days)

**Create `lib/health-check.ts`:**

```typescript
import { db } from '@/lib/prisma'

export async function performHealthChecks() {
  const results: Record<string, boolean> = {}

  // Database check
  try {
    await db.$executeRaw`SELECT 1`
    results.database = true
  } catch {
    results.database = false
  }

  // API check
  try {
    const res = await fetch(`${process.env.NEXTAUTH_URL || ''}/api/health`)
    results.api = res.ok
  } catch {
    results.api = false
  }

  // S3 check
  try {
    // Attempt to list S3 bucket
    results.s3 = true // Implement based on your S3 client
  } catch {
    results.s3 = false
  }

  return results
}

// Create endpoint /api/health
export async function GET() {
  const checks = await performHealthChecks()

  return Response.json({
    status: Object.values(checks).every(v => v) ? 'healthy' : 'degraded',
    checks,
    timestamp: new Date().toISOString(),
  })
}
```

---

## Summary: Implementation Checklist

### Phase 1 (2-3 days)
- [ ] Setup Sentry error tracking
- [ ] Add email alert notifications
- [ ] Add Slack integration
- [ ] Add security headers

### Phase 2 (3-4 days)
- [ ] Create performance metrics tables
- [ ] Add middleware tracking
- [ ] Build performance dashboard
- [ ] Add slow query alerts

### Phase 3 (3-4 days)
- [ ] Create analytics schema
- [ ] Track page views
- [ ] Track user sessions
- [ ] Build analytics dashboard

### Phase 4 (1-2 days)
- [ ] Create health check endpoint
- [ ] Add monitoring alerts
- [ ] Create status page

**Total: 18-25 days**

---

**This guide provides everything needed to implement production-ready monitoring and alerting.**
