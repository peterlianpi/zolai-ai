/**
 * Simple in-process TTL cache for hot API data.
 * Use for data that's expensive to compute and changes infrequently.
 * Works across all requests in the same Node.js process.
 */

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

const store = new Map<string, CacheEntry<unknown>>();

export function cacheGet<T>(key: string): T | null {
  const entry = store.get(key) as CacheEntry<T> | undefined;
  if (!entry || Date.now() > entry.expiresAt) { store.delete(key); return null; }
  return entry.value;
}

export function cacheSet<T>(key: string, value: T, ttlMs: number): void {
  store.set(key, { value, expiresAt: Date.now() + ttlMs });
}

export async function cachedFetch<T>(key: string, ttlMs: number, fn: () => Promise<T>): Promise<T> {
  const cached = cacheGet<T>(key);
  if (cached !== null) return cached;
  const value = await fn();
  cacheSet(key, value, ttlMs);
  return value;
}

// Cleanup stale entries every 5 minutes
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [k, v] of store.entries()) {
      if (now > v.expiresAt) store.delete(k);
    }
  }, 5 * 60_000);
}
