import type { Context } from "hono";
import { Redis } from "@upstash/redis";
import prisma from "@/lib/prisma";

interface RateLimitInfo {
  count: number;
  resetTime: number;
}

interface RateLimitConfig {
  globalPerMinute: number;
  authPer15Min: number;
  adminPerMinute: number;
  autoBlockEnabled: boolean;
  autoBlockThreshold: number;
  autoBlockDurationMinutes: number;
}

interface RateLimitRule {
  limit: number;
  windowMs: number;
  scope: "global" | "auth" | "admin";
}

const DEFAULT_CONFIG: RateLimitConfig = {
  globalPerMinute: 100,
  authPer15Min: 5,
  adminPerMinute: 100,  // Increased from 20 to 100 - authenticated admins need more lenient limits
  autoBlockEnabled: true,
  autoBlockThreshold: 3,
  autoBlockDurationMinutes: 60,
};

const CONFIG_CACHE_TTL_MS = 60_000;
const AUTH_ROUTE_MATCHERS = ["/api/auth", "/api/check-verification"];
const ADMIN_ROUTE_MATCHER = "/api/admin";

let configCache: { value: RateLimitConfig; expiresAt: number } | null = null;

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
  console.warn("Failed to initialize Redis client:", error);
}

// Fallback in-memory store
const memoryStore = new Map<string, RateLimitInfo>();
const exceedStore = new Map<string, RateLimitInfo>();

function getClientIp(c: Context): string {
  const forwardedFor = c.req.header("x-forwarded-for");
  const realIp = c.req.header("x-real-ip");
  return forwardedFor?.split(",")[0]?.trim() || realIp || "127.0.0.1";
}

async function getRateLimitConfig(): Promise<RateLimitConfig> {
  const now = Date.now();
  if (configCache && now < configCache.expiresAt) {
    return configCache.value;
  }

  try {
    const settings = await prisma.siteSetting.findMany({
      where: {
        key: {
          in: [
            "security.rateLimit.globalPerMinute",
            "security.rateLimit.authPer15Min",
            "security.rateLimit.adminPerMinute",
            "security.rateLimit.autoBlockEnabled",
            "security.rateLimit.autoBlockThreshold",
            "security.rateLimit.autoBlockDurationMinutes",
          ],
        },
      },
    });

    const map = new Map(settings.map((s) => [s.key, s.value]));
    const parsed: RateLimitConfig = {
      globalPerMinute:
        Number.parseInt(map.get("security.rateLimit.globalPerMinute") ?? "", 10) ||
        DEFAULT_CONFIG.globalPerMinute,
      authPer15Min:
        Number.parseInt(map.get("security.rateLimit.authPer15Min") ?? "", 10) || DEFAULT_CONFIG.authPer15Min,
      adminPerMinute:
        Number.parseInt(map.get("security.rateLimit.adminPerMinute") ?? "", 10) ||
        DEFAULT_CONFIG.adminPerMinute,
      autoBlockEnabled:
        (map.get("security.rateLimit.autoBlockEnabled") ?? String(DEFAULT_CONFIG.autoBlockEnabled)) === "true",
      autoBlockThreshold:
        Number.parseInt(map.get("security.rateLimit.autoBlockThreshold") ?? "", 10) ||
        DEFAULT_CONFIG.autoBlockThreshold,
      autoBlockDurationMinutes:
        Number.parseInt(map.get("security.rateLimit.autoBlockDurationMinutes") ?? "", 10) ||
        DEFAULT_CONFIG.autoBlockDurationMinutes,
    };

    configCache = { value: parsed, expiresAt: now + CONFIG_CACHE_TTL_MS };
    return parsed;
  } catch {
    return DEFAULT_CONFIG;
  }
}

function getRule(pathname: string, config: RateLimitConfig): RateLimitRule {
  if (pathname.startsWith(ADMIN_ROUTE_MATCHER)) {
    return { scope: "admin", limit: config.adminPerMinute, windowMs: 60_000 };
  }

  if (AUTH_ROUTE_MATCHERS.some((route) => pathname.startsWith(route))) {
    return { scope: "auth", limit: config.authPer15Min, windowMs: 15 * 60_000 };
  }

  return { scope: "global", limit: config.globalPerMinute, windowMs: 60_000 };
}

// ── IP block cache (avoid DB hit on every request) ───────────────────────────
const blockedIpCache = new Map<string, { blocked: boolean; expiresAt: number }>();
const IP_CACHE_TTL = 60_000; // 1 min

async function isIpBlocked(ip: string): Promise<boolean> {
  const now = Date.now();
  const cached = blockedIpCache.get(ip);
  if (cached && now < cached.expiresAt) return cached.blocked;

  try {
    const blocked = await prisma.blockedIp.findUnique({ where: { ip }, select: { expiresAt: true } });
    const isBlocked = !!blocked && (!blocked.expiresAt || blocked.expiresAt.getTime() > now);
    blockedIpCache.set(ip, { blocked: isBlocked, expiresAt: now + IP_CACHE_TTL });
    return isBlocked;
  } catch {
    return false;
  }
}

async function recordRateLimitExceeded(ip: string, path: string, rule: RateLimitRule): Promise<void> {
  try {
    await prisma.securityEvent.create({
      data: {
        type: "RATE_LIMIT_EXCEEDED",
        ip,
        severity: rule.scope === "auth" ? "HIGH" : "MEDIUM",
        details: {
          path,
          scope: rule.scope,
          limit: rule.limit,
          windowMs: rule.windowMs,
        },
      },
    });
  } catch {
    // Best-effort logging only.
  }
}

async function maybeAutoBlockIp(ip: string, config: RateLimitConfig): Promise<void> {
  if (!config.autoBlockEnabled) return;

  const key = `exceed_${ip}`;
  const now = Date.now();
  const existing = exceedStore.get(key);

  if (!existing || now > existing.resetTime) {
    exceedStore.set(key, { count: 1, resetTime: now + 60 * 60_000 });
    return;
  }

  existing.count += 1;
  if (existing.count < config.autoBlockThreshold) {
    return;
  }

  try {
    const expiresAt = new Date(now + config.autoBlockDurationMinutes * 60_000);
    await prisma.blockedIp.upsert({
      where: { ip },
      update: {
        reason: "Automatic temporary block due to repeated rate limit violations",
        expiresAt,
        hitCount: { increment: 1 },
      },
      create: {
        ip,
        reason: "Automatic temporary block due to repeated rate limit violations",
        expiresAt,
        hitCount: 1,
      },
    });
  } catch {
    // Ignore auto-block failures to avoid impacting request handling.
  }
}

/**
 * Rate limiter middleware for Hono with Redis fallback to in-memory.
 * Applies layered limits by route scope and logs violations.
 */
export function rateLimiter() {
  return async (c: Context, next: () => Promise<void>) => {
    const ip = getClientIp(c);
    const path = c.req.path;

    if (await isIpBlocked(ip)) {
      return c.json(
        { success: false, error: { code: "IP_BLOCKED", message: "Access blocked for this IP address" } },
        403
      );
    }

    const config = await getRateLimitConfig();
    const rule = getRule(path, config);
    const key = `ratelimit_${rule.scope}_${ip}`;
    const now = Date.now();

    // Try Redis first, fallback to in-memory
    if (redisClient) {
      try {
        const redisData = await redisClient.get<{ count: number; resetTime: number }>(key);

        if (!redisData || now > redisData.resetTime) {
          await redisClient.set(
            key,
            {
              count: 1,
              resetTime: now + rule.windowMs,
            },
            { ex: Math.ceil(rule.windowMs / 1000) }
          );

          c.header("X-RateLimit-Limit", rule.limit.toString());
          c.header("X-RateLimit-Remaining", (rule.limit - 1).toString());
          await next();
          return;
        }

        if (redisData.count >= rule.limit) {
          c.header("Retry-After", Math.ceil((redisData.resetTime - now) / 1000).toString());
          await recordRateLimitExceeded(ip, path, rule);
          await maybeAutoBlockIp(ip, config);
          return c.json(
            { success: false, error: { code: "TOO_MANY_REQUESTS", message: "Rate limit exceeded" } },
            429
          );
        }

        // Atomically increment and set expiry using a Lua script to prevent
        // a race condition where the key could persist indefinitely if expire
        // is never called after incr (e.g., due to a crash between the two calls).
        const ttlSeconds = Math.ceil(rule.windowMs / 1000);
        await redisClient.eval(
          `local c = redis.call('INCR', KEYS[1])
           if c == 1 then redis.call('EXPIRE', KEYS[1], ARGV[1]) end
           return c`,
          [key],
          [ttlSeconds]
        );

        c.header("X-RateLimit-Limit", rule.limit.toString());
        c.header("X-RateLimit-Remaining", (rule.limit - redisData.count - 1).toString());
        await next();
        return;
      } catch (redisError) {
        console.warn("Redis error, falling back to in-memory rate limiter:", redisError);
      }
    }

    // In-memory fallback implementation
    const now2 = Date.now();
    const record = memoryStore.get(key);

    // Atomic check-and-increment: compute new state before any await
    let newCount: number;
    let resetTime: number;

    if (!record || now2 > record.resetTime) {
      newCount = 1;
      resetTime = now2 + rule.windowMs;
    } else if (record.count >= rule.limit) {
      c.header("Retry-After", Math.ceil((record.resetTime - now2) / 1000).toString());
      // Fire-and-forget side effects after the decision is made
      recordRateLimitExceeded(ip, path, rule).catch(() => {});
      maybeAutoBlockIp(ip, config).catch(() => {});
      return c.json(
        { success: false, error: { code: "TOO_MANY_REQUESTS", message: "Rate limit exceeded" } },
        429
      );
    } else {
      newCount = record.count + 1;
      resetTime = record.resetTime;
    }

    // Single synchronous write — no async gap between decision and store update
    memoryStore.set(key, { count: newCount, resetTime });

    c.header("X-RateLimit-Limit", rule.limit.toString());
    c.header("X-RateLimit-Remaining", (rule.limit - newCount).toString());

    if (Math.random() < 0.01) {
      for (const [k, v] of memoryStore.entries()) {
        if (now2 > v.resetTime) {
          memoryStore.delete(k);
        }
      }
      for (const [k, v] of exceedStore.entries()) {
        if (now2 > v.resetTime) {
          exceedStore.delete(k);
        }
      }
    }

    await next();
  };
}