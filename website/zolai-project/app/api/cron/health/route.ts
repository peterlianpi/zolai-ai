import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { notify } from "@/lib/telegram";
import { monitorConfig } from "@/lib/config/monitoring";
import { getPerformanceMetrics } from "@/lib/services/performance-monitoring";
import {
  formatSystemHealthStats,
  getServerMetrics,
  getSystemHealth,
} from "@/lib/services/system-resources";

// Call this from an external cron (e.g. cron-job.org, Vercel cron) every 5 minutes
// GET /api/cron/health?secret=CRON_SECRET

export async function GET(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get("secret");
  if (process.env.ENABLE_CRON_SECRET_CHECK === "true" && secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const start = Date.now();
  let dbOk = false;
  try {
    await prisma.$queryRaw`SELECT 1`;
    dbOk = true;
  } catch (e) {
    await notify(`🚨 <b>DB DOWN</b>\n${e instanceof Error ? e.message : "unknown error"}\n${new Date().toISOString()}`);
  }

  const mem = process.memoryUsage();
  const heapMb = Math.round(mem.heapUsed / 1024 / 1024);

  if (heapMb > monitorConfig.heapWarningMb) {
    await notify(`⚠️ <b>High memory</b>: ${heapMb}MB heap used`);
  }

  const performanceMetrics = await getPerformanceMetrics(monitorConfig.performanceTimeRange);
  const systemHealth = getSystemHealth();
  const serverMetrics = getServerMetrics();
  const dbLatencyMs = Date.now() - start;
  
  // Send monitoring progress update
  const progressMessage = `📊 <b>Cron Health Status</b>\n` +
    `✅ Status: ${dbOk ? "OK" : "⚠️ DB Issue"}\n` +
    `📈 DB Latency: ${dbLatencyMs}ms\n` +
    `💾 Memory: ${heapMb}MB\n` +
    `⏳ Uptime: ${Math.floor(process.uptime())}s\n` +
    `📊 Total Requests (${monitorConfig.performanceTimeRange}): ${performanceMetrics.totalRequests}\n` +
    `⚡ Avg Response: ${performanceMetrics.averageResponseTime.toFixed(2)}ms\n` +
    `❌ Error Rate: ${performanceMetrics.errorRate.toFixed(2)}%\n` +
    `🧠 Event Loop Delay: ${serverMetrics.eventLoopDelay.toFixed(2)}ms\n\n` +
    formatSystemHealthStats(systemHealth);
  
  await notify(progressMessage);

  return NextResponse.json({
    ok: dbOk,
    dbLatencyMs,
    heapMb,
    uptime: Math.floor(process.uptime()),
    performanceMetrics,
    systemHealth,
    serverMetrics,
  });
}
