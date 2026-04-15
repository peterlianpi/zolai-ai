import { runWithCircuitBreaker } from "@/lib/server/circuit-breaker";

interface SafeDbQueryOptions<T> {
  key: string;
  query: () => Promise<T>;
  fallback: T;
  timeoutMs?: number;
  failureThreshold?: number;
  openMs?: number;
  logLabel?: string;
}

export async function safeDbQuery<T>(options: SafeDbQueryOptions<T>): Promise<T> {
  const {
    key,
    query,
    fallback,
    timeoutMs = 3500,
    failureThreshold = 3,
    openMs = 10000,
    logLabel,
  } = options;

  if (process.env.NEXT_PHASE === "phase-production-build") {
    return fallback;
  }

  try {
    return await runWithCircuitBreaker(key, query, {
      timeoutMs,
      failureThreshold,
      openMs,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (logLabel) {
      console.warn(`[${logLabel}] Using fallback due to DB issue: ${message}`);
    }
    return fallback;
  }
}
