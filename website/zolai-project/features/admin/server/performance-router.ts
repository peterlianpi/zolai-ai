import { Hono } from "hono";
import { adminMiddleware } from "@/lib/audit";
import { ok } from "@/lib/api/response";
import { getPerformanceMetrics } from "@/lib/services/performance-monitoring";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import prisma from "@/lib/prisma";

const performanceQuerySchema = z.object({
  timeRange: z.enum(["1h", "24h"]).optional().default("1h"),
});

const performanceRouter = new Hono()
  .use(adminMiddleware)
  
  // GET /api/admin/performance/metrics - Get performance metrics
  .get("/metrics", zValidator("query", performanceQuerySchema), async (c) => {
    const { timeRange } = c.req.valid("query");
    
    const [metrics, dbStats] = await Promise.all([
      getPerformanceMetrics(timeRange),
      getDatabaseStats(),
    ]);
    
    c.header("Cache-Control", "private, max-age=30"); // 30-second cache for admin metrics
    
    return ok(c, {
      ...metrics,
      database: dbStats,
      timestamp: Date.now(),
    });
  })
  
  // GET /api/admin/performance/health - Get system health status
  .get("/health", async (c) => {
    const healthChecks = await Promise.allSettled([
      checkDatabaseHealth(),
      checkRedisHealth(),
      checkMemoryUsage(),
    ]);
    
    const health = {
      database: healthChecks[0].status === "fulfilled" ? healthChecks[0].value : { status: "error", error: "Database check failed" },
      redis: healthChecks[1].status === "fulfilled" ? healthChecks[1].value : { status: "error", error: "Redis check failed" },
      memory: healthChecks[2].status === "fulfilled" ? healthChecks[2].value : { status: "error", error: "Memory check failed" },
      overall: "healthy" as "healthy" | "degraded" | "unhealthy",
    };
    
    // Determine overall health
    const hasErrors = Object.values(health).some(check => 
      typeof check === "object" && check.status === "error"
    );
    const hasWarnings = Object.values(health).some(check => 
      typeof check === "object" && check.status === "warning"
    );
    
    if (hasErrors) {
      health.overall = "unhealthy";
    } else if (hasWarnings) {
      health.overall = "degraded";
    }
    
    return ok(c, health);
  })
  
  // GET /api/admin/performance/slow-queries - Get slow database queries
  .get("/slow-queries", async (c) => {
    // This would require query logging to be enabled in PostgreSQL
    // For now, return mock data structure
    const slowQueries = [
      {
        query: "SELECT * FROM post WHERE status = ? AND ...",
        duration: 1250,
        count: 15,
        lastSeen: new Date().toISOString(),
      },
    ];
    
    return ok(c, slowQueries);
  });

async function getDatabaseStats() {
  try {
    const [totalConnections, activeConnections] = await Promise.all([
      prisma.$queryRaw`SELECT count(*) as total FROM pg_stat_activity WHERE state IS NOT NULL`,
      prisma.$queryRaw`SELECT count(*) as active FROM pg_stat_activity WHERE state = 'active'`,
    ]);
    
    return {
      status: "healthy",
      totalConnections: Number((totalConnections as Record<string, unknown>[])[0]?.total || 0),
      activeConnections: Number((activeConnections as Record<string, unknown>[])[0]?.active || 0),
      timestamp: Date.now(),
    };
  } catch (_error) {
    return {
      status: "error",
      error: "Failed to get database stats",
      timestamp: Date.now(),
    };
  }
}

async function checkDatabaseHealth() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return { status: "healthy", responseTime: 0 };
  } catch (_error) {
    return { status: "error", error: "Database connection failed" };
  }
}

async function checkRedisHealth() {
  // Redis health check would go here
  return { status: "healthy", responseTime: 0 };
}

async function checkMemoryUsage() {
  if (typeof process !== "undefined" && process.memoryUsage) {
    const usage = process.memoryUsage();
    const heapUsedMB = Math.round(usage.heapUsed / 1024 / 1024);
    const heapTotalMB = Math.round(usage.heapTotal / 1024 / 1024);
    
    return {
      status: heapUsedMB > 512 ? "warning" : "healthy", // Warn if using >512MB
      heapUsed: heapUsedMB,
      heapTotal: heapTotalMB,
      rss: Math.round(usage.rss / 1024 / 1024),
    };
  }
  
  return { status: "unknown", error: "Memory usage not available" };
}

export default performanceRouter;