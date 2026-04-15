# Skill: Data Analytics

## Purpose

Analyze data, create reports, dashboards, and derive insights from database queries.

## When to Use

Use this skill when user says:
- "Add analytics"
- "Create dashboard"
- "Analyze data"
- "Show statistics"
- "Performance metrics"
- "Reports"

## Data Analysis Patterns

### 1. Count Aggregations

```typescript
const total = await db.post.count()
const published = await db.post.count({ where: { status: 'PUBLISHED' } })
```

### 2. Group By

```typescript
const byStatus = await db.post.groupBy({
  by: ['status'],
  _count: true,
})
```

### 3. Time Series

```typescript
const last30Days = await db.post.groupBy({
  by: ['createdAt'],
  where: {
    createdAt: {
      gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    },
  },
  _count: true,
})
```

### 4.joins

```typescript
const withAuthor = await db.post.findMany({
  include: {
    author: true,
  },
})
```

## Dashboard Metrics

### Key Metrics for Content Sites

| Metric | Query |
|--------|-------|
| Total Posts | `db.post.count()` |
| Published | `db.post.count({ where: { status: 'PUBLISHED' } })` |
| Drafts | `db.post.count({ where: { status: 'DRAFT' } })` |
| Total Views | Sum of `viewCount` field |
| Comments | `db.comment.count()` |
| Users | `db.user.count()` |

## Visualization

### Chart.js

```tsx
import { Chart } from '@/components/ui/chart'

const data = {
  labels: ['Jan', 'Feb', 'Mar'],
  datasets: [{
    label: 'Posts',
    data: [10, 20, 30],
  }],
}

<Chart data={data} type="line" />
```

### Recharts

```tsx
import { LineChart, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

const data = [
  { name: 'Jan', value: 10 },
  { name: 'Feb', value: 20 },
]

<ResponsiveContainer width="100%" height={300}>
  <LineChart data={data}>
    <XAxis dataKey="name" />
    <YAxis />
    <Tooltip />
  </LineChart>
</ResponsiveContainer>
```

## Analytics API

### GET /api/analytics

```typescript
app.get('/analytics', async (c) => {
  const [users, posts, comments] = await Promise.all([
    db.user.count(),
    db.post.count(),
    db.comment.count(),
  ])
  
  return ok(c, {
    users,
    posts,
    comments,
  })
})
```

## Page Implementation

```tsx
// app/(protected)/admin/analytics/page.tsx
import { DashboardStats } from '@/features/admin/components/dashboard-stats'

export default async function AnalyticsPage() {
  const stats = await getAnalytics()
  
  return (
    <div className="grid grid-cols-4 gap-4">
      <StatsCard title="Total Posts" value={stats.posts} />
      <StatsCard title="Total Users" value={stats.users} />
      <StatsCard title="Comments" value={stats.comments} />
      <StatsCard title="Views" value={stats.views} />
    </div>
  )
}
```

## Key Patterns

- Use Prisma aggregations for counts
- Cache expensive queries
- Use server components for initial load
- Use TanStack Query for client updates
- Group by status, date, author
- Time-series for trends

## Performance Tips

- Index frequently queried fields
- Use `select` to limit fields
- Paginate large datasets
- Cache with TTL