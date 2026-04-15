import prisma from "@/lib/prisma";
import { Redis } from "@upstash/redis";

// Initialize Redis client if credentials are available
let redisClient: Redis | null = null;
try {
  const redisUrl = process.env.REDIS_URL;
  const redisToken = process.env.REDIS_TOKEN;
  
  if (redisUrl && redisToken) {
    redisClient = new Redis({
      url: redisUrl,
      token: redisToken,
    });
  }
} catch (error) {
  console.warn("Failed to initialize Redis client for analytics:", error);
}

// Fallback in-memory cache
const memoryCache = new Map<string, { data: unknown, timestamp: number }>();
const TTL = 3600 * 1000; // 1 hour

export async function getAnalyticsData(days: number) {
  const cacheKey = `analytics:${days}`;
  const now = Date.now();

  // Try Redis first, fallback to in-memory
  if (redisClient) {
    try {
      // Try to get from Redis
      const cachedData = await redisClient.get<{ data: unknown, timestamp: number }>(cacheKey);
      
      if (cachedData && now - cachedData.timestamp < TTL) {
        return cachedData.data;
      }
      
      // If not in cache or expired, compute fresh data
      const data = await computeAnalyticsData(days);
      
      // Store in Redis with TTL
      await redisClient.set(cacheKey, {
        data,
        timestamp: now
      }, { ex: Math.ceil(TTL / 1000) }); // Expire in TTL seconds
      
      return data;
    } catch (redisError) {
      console.warn("Redis error in analytics cache, falling back to in-memory:", redisError);
      // Fall through to in-memory implementation
    }
  }

  // In-memory fallback implementation
  const cached = memoryCache.get(cacheKey);

  if (cached && now - cached.timestamp < TTL) {
    return cached.data;
  }

  // Compute fresh data
  const data = await computeAnalyticsData(days);
  
  // Store in memory cache
  memoryCache.set(cacheKey, { data, timestamp: now });
  
  // Clean up old entries periodically (every 10th call)
  if (Math.random() < 0.1) {
    for (const [key, value] of memoryCache.entries()) {
      if (now - value.timestamp >= TTL) {
        memoryCache.delete(key);
      }
    }
  }

  return data;
}

async function computeAnalyticsData(days: number) {
  const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  // Use DB-level groupBy instead of fetching all rows and grouping in JS
  const [
    postsByDateRaw,
    usersByDateRaw,
    topPosts,
    topPages,
    mediaByType,
    postsByStatus,
    postsByType,
  ] = await Promise.all([
    prisma.$queryRaw<{ date: string; type: string; count: bigint }[]>`
      SELECT DATE("createdAt")::text AS date, type, COUNT(*)::bigint AS count
      FROM "post"
      WHERE "createdAt" >= ${startDate}
      GROUP BY DATE("createdAt"), type
      ORDER BY date ASC
    `,
    prisma.$queryRaw<{ date: string; count: bigint }[]>`
      SELECT DATE("createdAt")::text AS date, COUNT(*)::bigint AS count
      FROM "user"
      WHERE "createdAt" >= ${startDate}
      GROUP BY DATE("createdAt")
      ORDER BY date ASC
    `,
    prisma.post.findMany({
      where: { status: "PUBLISHED" },
      take: 10,
      orderBy: { publishedAt: "desc" },
      select: { id: true, title: true, slug: true, type: true, publishedAt: true },
    }),
    prisma.post.findMany({
      where: { type: "PAGE" },
      take: 10,
      orderBy: { createdAt: "desc" },
      select: { id: true, title: true, slug: true, createdAt: true },
    }),
    prisma.media.groupBy({ by: ["mimeType"], _count: true }),
    prisma.post.groupBy({ by: ["status"], _count: true }),
    prisma.post.groupBy({ by: ["type"], _count: true }),
  ]);

  // Merge DB-grouped rows into timeline
  const postsByDate: Record<string, { posts: number; news: number; pages: number }> = {};
  for (const row of postsByDateRaw) {
    if (!postsByDate[row.date]) postsByDate[row.date] = { posts: 0, news: 0, pages: 0 };
    const n = Number(row.count);
    if (row.type === "POST") postsByDate[row.date].posts += n;
    else if (row.type === "NEWS") postsByDate[row.date].news += n;
    else if (row.type === "PAGE") postsByDate[row.date].pages += n;
  }

  const usersByDate: Record<string, number> = {};
  for (const row of usersByDateRaw) {
    usersByDate[row.date] = Number(row.count);
  }

  const allDates = new Set([...Object.keys(postsByDate), ...Object.keys(usersByDate)]);
  const timeline = Array.from(allDates).sort().map((date) => ({
    date,
    posts: postsByDate[date]?.posts || 0,
    news: postsByDate[date]?.news || 0,
    pages: postsByDate[date]?.pages || 0,
    users: usersByDate[date] || 0,
  }));

  const data = {
    period: days,
    timeline,
    topPosts: topPosts.map((p) => ({
      ...p,
      publishedAt: p.publishedAt?.toISOString() || null,
    })),
    topPages: topPages.map((p) => ({
      ...p,
      createdAt: p.createdAt.toISOString(),
    })),
    mediaByType: mediaByType.map((m) => ({
      type: m.mimeType,
      count: m._count,
    })),
    postsByStatus: postsByStatus.map((p) => ({
      status: p.status,
      count: p._count,
    })),
    postsByType: postsByType.map((p) => ({
      type: p.type,
      count: p._count,
    })),
  };

  return data;
}
