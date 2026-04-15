type CircuitState = {
  failures: number;
  openUntil: number;
  lastLogAt: number;
};

const circuitStore = new Map<string, CircuitState>();
const LOG_INTERVAL_MS = 60000;

function shouldLog(state: CircuitState, now: number): boolean {
  return now - state.lastLogAt >= LOG_INTERVAL_MS;
}

function logCircuitEvent(
  key: string,
  state: CircuitState,
  now: number,
  message: string,
  error?: unknown,
): void {
  if (!shouldLog(state, now)) {
    return;
  }

  if (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.warn(`[CircuitBreaker:${key}] ${message} (${errorMessage})`);
  } else {
    console.warn(`[CircuitBreaker:${key}] ${message}`);
  }

  state.lastLogAt = now;
}

export class CircuitBreakerOpenError extends Error {
  constructor(key: string, openUntil: number) {
    super(`Circuit "${key}" is open until ${new Date(openUntil).toISOString()}`);
    this.name = "CircuitBreakerOpenError";
  }
}

interface CircuitBreakerOptions {
  timeoutMs?: number;
  failureThreshold?: number;
  openMs?: number;
}

export async function runWithCircuitBreaker<T>(
  key: string,
  operation: () => Promise<T>,
  options: CircuitBreakerOptions = {},
): Promise<T> {
  const timeoutMs = options.timeoutMs ?? 3000;
  const failureThreshold = options.failureThreshold ?? 3;
  const openMs = options.openMs ?? 30000;

  const now = Date.now();
  const state = circuitStore.get(key) ?? { failures: 0, openUntil: 0, lastLogAt: 0 };

  if (state.openUntil > now) {
    logCircuitEvent(
      key,
      state,
      now,
      `open, skipping operation until ${new Date(state.openUntil).toISOString()}`,
    );
    circuitStore.set(key, state);
    throw new CircuitBreakerOpenError(key, state.openUntil);
  }

  try {
    const result = await Promise.race([
      operation(),
      new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error(`Operation timeout after ${timeoutMs}ms`)), timeoutMs);
      }),
    ]);

    circuitStore.set(key, { failures: 0, openUntil: 0, lastLogAt: state.lastLogAt });
    return result;
  } catch (error) {
    const failures = state.failures + 1;
    const openUntil = failures >= failureThreshold ? now + openMs : 0;

    if (openUntil > 0) {
      logCircuitEvent(
        key,
        state,
        now,
        `opened for ${openMs}ms after ${failures} consecutive failures`,
        error,
      );
    } else {
      logCircuitEvent(
        key,
        state,
        now,
        `operation failed (${failures}/${failureThreshold})`,
        error,
      );
    }

    circuitStore.set(key, {
      failures: openUntil > 0 ? 0 : failures,
      openUntil,
      lastLogAt: state.lastLogAt,
    });

    throw error;
  }
}
