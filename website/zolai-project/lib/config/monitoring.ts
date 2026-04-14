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
  telegramMaxMessageChars: toInt(process.env.TELEGRAM_MAX_MESSAGE_CHARS, 3900),
  alertDedupWindowMs: toInt(process.env.MONITOR_ALERT_DEDUP_WINDOW_MS, 300000),
  alertMaxRetries: toInt(process.env.MONITOR_ALERT_MAX_RETRIES, 3),
  alertRetryBaseMs: toInt(process.env.MONITOR_ALERT_RETRY_BASE_MS, 1000),
  alertRetryMaxMs: toInt(process.env.MONITOR_ALERT_RETRY_MAX_MS, 10000),
  alertDefaultSilenceMinutes: toInt(process.env.MONITOR_ALERT_DEFAULT_SILENCE_MINUTES, 60),
  alertQuietHoursStart: toInt(process.env.MONITOR_QUIET_HOURS_START, -1),
  alertQuietHoursEnd: toInt(process.env.MONITOR_QUIET_HOURS_END, -1),
  maintenanceMode: toBool(process.env.MONITOR_MAINTENANCE_MODE, false),
  enableRecoveryAlerts: toBool(process.env.MONITOR_ENABLE_RECOVERY_ALERTS, true),
  heartbeatEnabled: toBool(process.env.MONITOR_HEARTBEAT_ENABLED, true),
  infoChatIds: (process.env.MONITOR_CHAT_ID_INFO || "").split(",").map(v => v.trim()).filter(Boolean),
  warningChatIds: (process.env.MONITOR_CHAT_ID_WARNING || "").split(",").map(v => v.trim()).filter(Boolean),
  criticalChatIds: (process.env.MONITOR_CHAT_ID_CRITICAL || "").split(",").map(v => v.trim()).filter(Boolean),
  performanceTimeRange: (process.env.MONITOR_PERFORMANCE_TIME_RANGE === "24h" ? "24h" : "1h") as "1h" | "24h",
};
