import { Hono } from "hono";
import prisma from "@/lib/prisma";
import { ok } from "@/lib/api/response";

const health = new Hono()

  .get("/", async (c) => {
    const start = Date.now();
    let dbOk = false;
    let dbMs = 0;
    try {
      await prisma.$queryRaw`SELECT 1`;
      dbMs = Date.now() - start;
      dbOk = true;
    } catch { /* db down */ }

    const mem = process.memoryUsage();
    const status = dbOk ? "ok" : "degraded";

    c.status(dbOk ? 200 : 503);
    return ok(c, {
      status,
      uptime: Math.floor(process.uptime()),
      db: { ok: dbOk, latencyMs: dbMs },
      memory: {
        heapUsedMb: Math.round(mem.heapUsed / 1024 / 1024),
        heapTotalMb: Math.round(mem.heapTotal / 1024 / 1024),
        rssMb: Math.round(mem.rss / 1024 / 1024),
      },
      timestamp: new Date().toISOString(),
    });
  });

export default health;
