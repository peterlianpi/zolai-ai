# Post View Tracking & Popular Posts

## Overview
Track page views for posts, news, and pages to calculate popularity and display "Most Visited", "Trending", and "Popular" content sections.

---

## Phase 1: Simple View Counter (MVP)

### 1.1 Database Schema (`prisma/schema.prisma`)
Add `viewCount` to the `Post` model:
```prisma
model Post {
  // ... existing fields
  viewCount Int @default(0)
  // ...
}
```

Run migration:
```bash
bunx prisma migrate dev --name add_post_view_count
bunx prisma generate
```

### 1.2 API Endpoint (`app/api/[[...route]]/content.ts`)
Add a lightweight view increment endpoint:
```typescript
.post("/posts/:id/view", async (c) => {
  const id = c.req.param("id");
  await prisma.post.update({
    where: { id },
    data: { viewCount: { increment: 1 } },
  });
  return c.json({ success: true });
})
```

### 1.3 Client-Side Tracking
Use `navigator.sendBeacon` from a client component on post/news detail pages. The beacon fires asynchronously and survives page navigation:
```tsx
// app/(public)/posts/[slug]/post-page-client.tsx
"use client";
import { useEffect } from "react";

export function TrackPostView({ postId }: { postId: string }) {
  useEffect(() => {
    navigator.sendBeacon(`/api/content/posts/${postId}/view`);
  }, [postId]);
  return null;
}
```

### 1.4 Update Ordering
Replace manual `isPopular` with view-based ordering:
```typescript
orderBy: [
  { isFeatured: "desc" },
  { viewCount: "desc" },
  { publishedAt: "desc" },
]
```

### 1.5 Most Visited Section
Add to home page or sidebar:
```typescript
const mostVisited = await prisma.post.findMany({
  where: { type: "POST", status: "PUBLISHED" },
  orderBy: { viewCount: "desc" },
  take: 5,
  select: { id: true, title: true, slug: true, viewCount: true, publishedAt: true },
});
```

---

## Phase 2: Deduplication & Anti-Spam

### 2.1 Cookie-Based Deduplication
Set a cookie per post per session to prevent same-user refresh inflation:
```typescript
// In the /view endpoint
const cookie = c.req.header("Cookie") || "";
const hasViewed = cookie.includes(`viewed_${id}`);
if (!hasViewed) {
  await prisma.post.update({ where: { id }, data: { viewCount: { increment: 1 } } });
  c.header("Set-Cookie", `viewed_${id}=1; Path=/; Max-Age=86400; SameSite=Lax`);
}
```
- `Max-Age=86400` = 24 hours — same user can only count once per day per post
- `SameSite=Lax` — works for same-site navigation

### 2.2 Rate Limiting
Add a simple rate limiter to prevent bot abuse:
```typescript
// lib/rate-limiter.ts
const viewCounts = new Map<string, { count: number; resetAt: number }>();

export function canTrackView(key: string): boolean {
  const now = Date.now();
  const entry = viewCounts.get(key);
  if (!entry || now > entry.resetAt) {
    viewCounts.set(key, { count: 1, resetAt: now + 60_000 });
    return true;
  }
  if (entry.count >= 10) return false;
  entry.count++;
  return true;
}
```
- 10 views per IP per minute max
- Clean up old entries periodically (or use Redis for production)

### 2.3 Bot Filtering
Skip tracking for known bot user agents:
```typescript
const BOT_PATTERN = /bot|crawler|spider|scraper|headless/i;
if (BOT_PATTERN.test(userAgent)) return c.json({ success: true, skipped: true });
```

---

## Phase 3: Time-Based Analytics (PostView Table)

### 3.1 Schema
```prisma
model PostView {
  id        String   @id @default(cuid())
  postId    String
  post      Post     @relation(fields: [postId], references: [id], onDelete: Cascade)
  viewedAt  DateTime @default(now())
  country   String?
  referrer  String?
  
  @@index([postId, viewedAt])
  @@index([viewedAt])
  @@map("post_view")
}
```

### 3.2 Relations on Post
```prisma
model Post {
  // ... existing fields
  viewCount Int      @default(0)
  views     PostView[]
}
```

### 3.3 Trending Query (Last 7 Days)
```typescript
const sevenDaysAgo = new Date();
sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

const trending = await prisma.post.findMany({
  where: { type: "POST", status: "PUBLISHED" },
  orderBy: {
    views: { _count: "desc" },
  },
  where: { views: { some: { viewedAt: { gte: sevenDaysAgo } } } },
  take: 5,
});
```

### 3.4 Popular This Month
```typescript
const monthStart = new Date();
monthStart.setDate(1);
monthStart.setHours(0, 0, 0, 0);

const popularThisMonth = await prisma.post.findMany({
  where: {
    type: "POST",
    status: "PUBLISHED",
    views: { some: { viewedAt: { gte: monthStart } } },
  },
  orderBy: { views: { _count: "desc" } },
  take: 5,
});
```

---

## Phase 4: Admin Dashboard & Analytics

### 4.1 Admin Stats Endpoint
```typescript
// GET /api/admin/stats/content
const stats = await prisma.post.groupBy({
  by: ["type"],
  _sum: { viewCount: true },
  _count: true,
});
```

### 4.2 Post Detail Analytics
Show view count and trend in admin content tables:
```tsx
// In admin posts/news/pages table columns
{
  accessorKey: "viewCount",
  header: "Views",
  cell: ({ row }) => (
    <span className="font-mono text-sm">
      {row.original.viewCount?.toLocaleString() ?? 0}
    </span>
  ),
}
```

### 4.3 Chart: Views Over Time
Use Recharts to show daily views for a selected post:
```typescript
const dailyViews = await prisma.postView.groupBy({
  by: ["viewedAt"],
  where: { postId },
  _count: true,
  orderBy: { viewedAt: "asc" },
});
// Group by day and render as LineChart
```

---

## Phase 5: Content Sections & UI

### 5.1 Home Page Sections
```
┌─────────────────────────────────┐
│  📈 Trending This Week          │  ← PostView last 7 days, top 3
├─────────────────────────────────┤
│  🔥 Most Popular All-Time       │  ← viewCount desc, top 5
├─────────────────────────────────┤
│  📰 Latest Posts                │  ← publishedAt desc
└─────────────────────────────────┘
```

### 5.2 Sidebar Widget
```tsx
// components/sidebar-popular-posts.tsx
const popular = await prisma.post.findMany({
  where: { type: "POST", status: "PUBLISHED" },
  orderBy: { viewCount: "desc" },
  take: 5,
  select: { id: true, title: true, slug: true, viewCount: true },
});

// Render as numbered list with view counts
```

### 5.3 Badge on Cards
Show view count on PostCard when significant:
```tsx
{viewCount > 100 && (
  <Badge variant="outline" className="text-xs">
    <Eye className="size-3" /> {viewCount.toLocaleString()}
  </Badge>
)}
```

---

## Phase 6: Cron Jobs & Maintenance

### 6.1 Periodic Cleanup
Remove old PostView records to keep the table manageable:
```typescript
// scripts/cleanup-old-views.ts
const cutoff = new Date();
cutoff.setMonth(cutoff.getMonth() - 3);
await prisma.postView.deleteMany({ where: { viewedAt: { lt: cutoff } } });
```

### 6.2 View Count Recalculation
If switching from simple counter to PostView-based counting:
```typescript
// scripts/recalculate-view-counts.ts
const posts = await prisma.post.findMany({ select: { id: true } });
for (const post of posts) {
  const count = await prisma.postView.count({ where: { postId: post.id } });
  await prisma.post.update({ where: { id: post.id }, data: { viewCount: count } });
}
```

---

## File Structure (After Full Implementation)

```
app/
  api/[[...route]]/
    content.ts          # Add /posts/:id/view endpoint
  (public)/
    posts/[slug]/
      post-page-client.tsx  # TrackPostView component
    news/[slug]/
      news-page-client.tsx  # TrackPostView component
features/
  analytics/
    components/
      popular-posts-sidebar.tsx
      trending-section.tsx
      views-chart.tsx
    hooks/
      use-post-views.ts
    lib/
      rate-limiter.ts
      bot-filter.ts
scripts/
  cleanup-old-views.ts
  recalculate-view-counts.ts
prisma/
  schema.prisma           # Add viewCount + PostView model
docs/
  features/
    post-view-tracking.md # This file
```

---

## Implementation Priority

| Phase | Effort | Impact | Priority |
|-------|--------|--------|----------|
| 1. Simple counter | Low | High | Start here |
| 2. Deduplication | Low | Medium | Do with Phase 1 |
| 3. PostView table | Medium | High | Next iteration |
| 4. Admin analytics | Medium | Medium | After Phase 3 |
| 5. UI sections | Low | High | After Phase 1 |
| 6. Cron cleanup | Low | Low | Last |

---

## Recommendations

1. **Start with Phase 1 + 2 together** — a simple counter without deduplication produces useless data
2. **Use `sendBeacon` not `fetch`** — survives navigation, no CORS issues, fire-and-forget
3. **Don't block page render on tracking** — the view endpoint should be async and non-blocking
4. **Cache popular posts** — use Next.js `revalidate` or Redis for the "Most Visited" query
5. **Consider edge cases** — what happens when a post is unpublished? Keep the count, it's historical data
6. **Privacy-first** — don't store IP addresses in production unless legally required; use country-level geolocation if needed
7. **Index wisely** — `@@index([postId, viewedAt])` covers both per-post and time-range queries
