const toInt = (value: string | undefined, fallback: number): number => {
  if (!value) return fallback;
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const toFloat = (value: string | undefined, fallback: number): number => {
  if (!value) return fallback;
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const toBool = (value: string | undefined, fallback: boolean): boolean => {
  if (!value) return fallback;
  return value.toLowerCase() === "true";
};

export const monitorConfig = {
  statsCacheTtlMs: toInt(process.env.MONITOR_STATS_CACHE_TTL_MS, 5000),
  metricsResetIntervalMs: toInt(process.env.MONITOR_METRICS_RESET_INTERVAL_MS, 300000),
  redisDetailedTtlSeconds: toInt(process.env.MONITOR_REDIS_DETAILED_TTL_SECONDS, 3600),
  redisAggregateTtlSeconds: toInt(process.env.MONITOR_REDIS_AGGREGATE_TTL_SECONDS, 86400),
  redisCacheTtlSeconds: toInt(process.env.MONITOR_REDIS_CACHE_TTL_SECONDS, 86400),
  slowQueryThresholdMs: toFloat(process.env.MONITOR_SLOW_QUERY_THRESHOLD_MS, 100),
  processClockTicks: toInt(process.env.MONITOR_PROCESS_CLOCK_TICKS, 100),
  processCpuTimeDivisor: toInt(process.env.MONITOR_PROCESS_CPU_TIME_DIVISOR, 10000),
  memoryWarningPercent: toFloat(process.env.MONITOR_MEMORY_WARNING_PERCENT, 90),
  memoryCriticalPercent: toFloat(process.env.MONITOR_MEMORY_CRITICAL_PERCENT, 95),
  diskWarningPercent: toFloat(process.env.MONITOR_DISK_WARNING_PERCENT, 85),
  diskCriticalPercent: toFloat(process.env.MONITOR_DISK_CRITICAL_PERCENT, 95),
  cpuWarningPercent: toFloat(process.env.MONITOR_CPU_WARNING_PERCENT, 80),
  heapWarningMb: toInt(process.env.MONITOR_HEAP_WARNING_MB, 400),
  telegramTimeoutMs: toInt(process.env.TELEGRAM_TIMEOUT_MS, 30000),
  telegramDisableWebPreview: toBool(process.env.TELEGRAM_DISABLE_WEB_PREVIEW, true),
  performanceTimeRange: (process.env.MONITOR_PERFORMANCE_TIME_RANGE === "24h" ? "24h" : "1h") as "1h" | "24h",
};
