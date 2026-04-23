---
name: performance-monitoring
description: Performance monitoring, analytics, and system health for the Zolai platform — lib/services/analytics.ts, performance-monitoring.ts, system-resources.ts, circuit-breaker. Use when working on observability, dashboards, or system health.
---

# Performance & Monitoring — Zolai Platform

## Services (lib/services/)

| File | Purpose |
|---|---|
| `analytics.ts` | Page views, user stats, top pages (Redis + in-memory fallback) |
| `performance-monitoring.ts` | Response times, DB query perf, cache hit rates |
| `system-resources.ts` | CPU, memory, disk, network stats |
| `telegram-monitor.ts` | Telegram-based alerting for system events |

## Analytics

```ts
import { getAnalyticsData } from "@/lib/services/analytics";

const stats = await getAnalyticsData(30); // last 30 days
// { timeline, topPosts, topPages, mediaByType, postsByStatus, postsByType }
```

Caching: Redis first, in-memory fallback (1h TTL).

## Performance metrics

```ts
import { recordMetrics } from "@/lib/services/performance-monitoring";

await recordMetrics({
  route: "/api/dictionary/search",
  duration: 45, // ms
  statusCode: 200,
});
```

## Circuit breaker (lib/server/circuit-breaker.ts)

Protects against cascading failures — wraps external calls (LLM, S3, email):

```ts
import { runWithCircuitBreaker } from "@/lib/server/circuit-breaker";

const result = await runWithCircuitBreaker("llm", () => callLLM(messages), {
  timeoutMs: 3000,
  failureThreshold: 3,
  openMs: 30000,
});
```

## Safe DB (lib/server/safe-db.ts)

Wraps Prisma calls with error handling and logging:

```ts
import { safeDbQuery } from "@/lib/server/safe-db";
const word = await safeDbQuery({ query: () => prisma.vocabWord.findUnique({ where: { id } }) });
```

## Telegram monitoring (lib/services/telegram-monitor.ts)

Sends alerts to admin Telegram channel for:
- New user signups
- Training run completions/failures
- System resource thresholds exceeded
- API error spikes
