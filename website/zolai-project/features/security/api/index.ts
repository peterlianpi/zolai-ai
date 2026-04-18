import { Hono } from "hono";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import prisma from "@/lib/prisma";
import { getSessionUserId } from "@/lib/auth/server-guards";
import { toAuditJson } from "@/lib/audit";
import { auth } from "@/lib/auth";
import { ok, created, list, notFound, unauthorized, internalError, forbidden } from "@/lib/api/response";
import { requireMinRole } from "@/lib/auth/server-guards";
import {
  clearMonitorSilence,
  getMonitorIncidents,
  getRecentMonitorAlerts,
  setMonitorSilence,
} from "@/lib/services/telegram-monitor";
import lockoutRouter from "@/features/auth/api/lockout";

const security = new Hono()

  // Device session management endpoints
  .get("/device-sessions", async (c) => {
    const userId = await getSessionUserId(c);
    if (!userId) {
      return unauthorized(c, "Not authenticated");
    }

    try {
      const sessions = await auth.api.listDeviceSessions({
        headers: c.req.raw.headers,
      });

      return ok(c, sessions);
    } catch (_err) {
      return internalError(c, "Failed to fetch device sessions");
    }
  })

  .post("/device-sessions/:sessionId/revoke", async (c) => {
    const sessionToken = c.req.param("sessionId");
    const userId = await getSessionUserId(c);
    if (!userId) {
      return unauthorized(c, "Not authenticated");
    }

    try {
      await auth.api.revokeDeviceSession({
        body: { sessionToken },
        headers: c.req.raw.headers,
      });

      // Log security event
      await prisma.securityEvent.create({
        data: {
          type: "DEVICE_SESSION_REVOKED",
          userId,
          details: toAuditJson({ sessionToken, revokedBy: userId }),
          severity: "MEDIUM",
        },
      });

      return ok(c, { sessionToken });
    } catch (_err) {
      return internalError(c, "Failed to revoke session");
    }
  })

  .post("/device-sessions/revoke-all-others", async (c) => {
    const userId = await getSessionUserId(c);
    if (!userId) {
      return unauthorized(c, "Not authenticated");
    }

    try {
      await auth.api.revokeOtherSessions({
        headers: c.req.raw.headers,
      });

      // Log security event
      await prisma.securityEvent.create({
        data: {
          type: "ALL_OTHER_SESSIONS_REVOKED",
          userId,
          details: toAuditJson({ revokedBy: userId }),
          severity: "MEDIUM",
        },
      });

      return ok(c, { userId });
    } catch (_err) {
      return internalError(c, "Failed to revoke sessions");
    }
  })

  // Security alerts endpoints
  .get("/alerts", async (c) => {
    const userId = await getSessionUserId(c);
    if (!userId) {
      return unauthorized(c, "Not authenticated");
    }

    const alerts = await prisma.securityAlert.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    return ok(c, alerts);
  })

  .post("/alerts/:alertId/mark-read", async (c) => {
    const alertId = c.req.param("alertId");
    const userId = await getSessionUserId(c);
    if (!userId) {
      return unauthorized(c, "Not authenticated");
    }

    const alert = await prisma.securityAlert.findFirst({
      where: { id: alertId, userId },
    });

    if (!alert) {
      return notFound(c, "Alert not found");
    }

    const updatedAlert = await prisma.securityAlert.update({
      where: { id: alertId },
      data: { isRead: true },
    });

    return ok(c, updatedAlert);
  })

  .post("/alerts/:alertId/resolve", async (c) => {
    const alertId = c.req.param("alertId");
    const userId = await getSessionUserId(c);
    if (!userId) {
      return unauthorized(c, "Not authenticated");
    }

    const alert = await prisma.securityAlert.findFirst({
      where: { id: alertId, userId },
    });

    if (!alert) {
      return notFound(c, "Alert not found");
    }

    const updatedAlert = await prisma.securityAlert.update({
      where: { id: alertId },
      data: { 
        isResolved: true,
        resolvedAt: new Date(),
        resolvedBy: userId,
      },
    });

    return ok(c, updatedAlert);
  })

  // Security settings endpoints
  .get("/settings", async (c) => {
    const userId = await getSessionUserId(c);
    if (!userId) {
      return unauthorized(c, "Not authenticated");
    }

    const settings = await prisma.securitySettings.findUnique({
      where: { userId },
    });

    return ok(c, settings || {
      userId,
      twoFactorEnabled: false,
      emailNotificationsEnabled: true,
      suspiciousActivityAlerts: true,
      newDeviceAlerts: true,
      locationBasedAlerts: false,
      sessionTimeout: 30,
      maxSessions: 5,
    });
  })

  .put("/settings", zValidator("json", z.object({
    emailNotificationsEnabled: z.boolean().optional(),
    suspiciousActivityAlerts: z.boolean().optional(),
    newDeviceAlerts: z.boolean().optional(),
    locationBasedAlerts: z.boolean().optional(),
    sessionTimeout: z.number().min(5).max(1440).optional(), // 5 min to 24 hours
    maxSessions: z.number().min(1).max(20).optional(),
  })), async (c) => {
    const body = c.req.valid("json");
    const userId = await getSessionUserId(c);
    if (!userId) {
      return unauthorized(c, "Not authenticated");
    }

    const settings = await prisma.securitySettings.upsert({
      where: { userId },
      create: {
        userId,
        ...body,
      },
      update: body,
    });

    return ok(c, settings);
  })

   .get("/events", zValidator("query", z.object({
     type: z.string().optional(),
     severity: z.string().optional(),
     page: z.coerce.number().default(1),
     limit: z.coerce.number().default(50),
   })), async (c) => {
     // Check if user has sufficient role for security events (admin/moderator)
     if (!(await requireMinRole(c, "ADMIN"))) {
       return forbidden(c, "Insufficient role");
     }
    const { type, severity, page, limit } = c.req.valid("query");
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};
    if (type) where.type = type;
    if (severity) where.severity = severity;

    const [events, total] = await Promise.all([
      prisma.securityEvent.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.securityEvent.count({ where }),
    ]);

    return list(c, events, { total, page, limit, totalPages: Math.ceil(total / limit) });
  })

   .get("/blocked-ips", async (c) => {
     // Check if user has sufficient role for blocked IPs (admin/moderator)
     if (!(await requireMinRole(c, "ADMIN"))) {
       return forbidden(c, "Insufficient role");
     }
     
     const blockedIps = await prisma.blockedIp.findMany({
       include: {
         blocker: { select: { id: true, name: true } },
       },
       orderBy: { createdAt: "desc" },
     });
 
     return ok(c, blockedIps);
   })

   .post("/blocked-ips", zValidator("json", z.object({
     ip: z.string(),
     reason: z.string().min(1, "Reason is required"),
     expiresAt: z.string().datetime().optional(),
   })), async (c) => {
     // Check if user has sufficient role for blocked IPs (admin/moderator)
     if (!(await requireMinRole(c, "ADMIN"))) {
       return forbidden(c, "Insufficient role");
     }
    const body = c.req.valid("json");
    const userId = await getSessionUserId(c);

    const blockedIp = await prisma.blockedIp.upsert({
      where: { ip: body.ip },
      update: {
        reason: body.reason,
        expiresAt: body.expiresAt ? new Date(body.expiresAt) : null,
        hitCount: { increment: 1 },
      },
      create: {
        ip: body.ip,
        reason: body.reason,
        expiresAt: body.expiresAt ? new Date(body.expiresAt) : null,
        blockedById: userId,
      },
    });

    await prisma.securityEvent.create({
      data: {
        type: "IP_BLOCKED",
        ip: body.ip,
        details: toAuditJson({ reason: body.reason }),
        severity: "HIGH",
        userId,
      },
    });

    return created(c, blockedIp);
  })

   .delete("/blocked-ips/:ip", async (c) => {
     // Check if user has sufficient role for blocked IPs (admin/moderator)
     if (!(await requireMinRole(c, "ADMIN"))) {
       return forbidden(c, "Insufficient role");
     }
     
     const ip = c.req.param("ip");
     const userId = await getSessionUserId(c);

     const existing = await prisma.blockedIp.findUnique({ where: { ip } });
     if (!existing) {
       return notFound(c, "Blocked IP not found");
     }

     await prisma.blockedIp.delete({ where: { ip } });

     await prisma.auditLog.create({
       data: {
         action: "DELETE",
         entityType: "BlockedIp",
         entityId: ip ?? "unknown",
         oldValues: toAuditJson(existing),
         createdById: userId,
       },
     });

     return ok(c, { ip });
   })

  .post("/log-event", zValidator("json", z.object({
    type: z.enum([
      "BRUTE_FORCE", 
      "SUSPICIOUS_LOGIN", 
      "RATE_LIMIT_EXCEEDED", 
      "INVALID_TOKEN", 
      "SQL_INJECTION_ATTEMPT", 
      "XSS_ATTEMPT", 
      "FILE_UPLOAD_BLOCKED",
      "DEVICE_SESSION_CREATED",
      "DEVICE_SESSION_REVOKED",
      "ALL_OTHER_SESSIONS_REVOKED",
      "PASSWORD_BREACH_DETECTED",
      "CAPTCHA_FAILED",
      "NEW_DEVICE_LOGIN",
      "UNUSUAL_LOCATION_LOGIN"
    ]),
    ip: z.string().optional(),
    userAgent: z.string().optional(),
    userId: z.string().optional(),
    email: z.string().optional(),
    details: z.record(z.string(), z.unknown()).optional(),
    severity: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]).default("MEDIUM"),
  })), async (c) => {
    const body = c.req.valid("json");

    const event = await prisma.securityEvent.create({
      data: {
        type: body.type,
        ip: body.ip,
        userAgent: body.userAgent,
        userId: body.userId,
        email: body.email,
        details: body.details as object,
        severity: body.severity,
      },
    });

    return created(c, event);
  })

   .get("/stats", zValidator("query", z.object({
     timeRange: z.enum(["24h", "7d", "30d"]).optional(),
   })), async (c) => {
     // Check if user has sufficient role for security stats (admin/moderator)
     if (!(await requireMinRole(c, "ADMIN"))) {
       return forbidden(c, "Insufficient role");
     }
    const { timeRange = "24h" } = c.req.valid("query");
    const now = new Date();
    const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const last7d = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const last30d = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const selectedWindowStart = timeRange === "7d" ? last7d : timeRange === "30d" ? last30d : last24h;

    const [
      totalEvents,
      events24h,
      events7d,
      events30d,
      eventsInSelectedRange,
      criticalEvents,
      blockedIps,
      bruteForceAttempts,
    ] = await Promise.all([
      prisma.securityEvent.count(),
      prisma.securityEvent.count({ where: { createdAt: { gte: last24h } } }),
      prisma.securityEvent.count({ where: { createdAt: { gte: last7d } } }),
      prisma.securityEvent.count({ where: { createdAt: { gte: last30d } } }),
      prisma.securityEvent.count({ where: { createdAt: { gte: selectedWindowStart } } }),
      prisma.securityEvent.count({ where: { severity: "CRITICAL" } }),
      prisma.blockedIp.count(),
      prisma.securityEvent.count({ where: { type: "BRUTE_FORCE" } }),
    ]);

    return ok(c, {
      totalEvents,
      events24h,
      events7d,
      events30d,
      selectedTimeRange: timeRange,
      eventsInSelectedRange,
      criticalEvents,
      blockedIps,
      bruteForceAttempts,
    });
  })

   .get("/rate-limit-config", async (c) => {
     // Check if user has sufficient role for rate limit config (admin/moderator)
     if (!(await requireMinRole(c, "ADMIN"))) {
       return forbidden(c, "Insufficient role");
     }
    const keys = [
      "security.rateLimit.globalPerMinute",
      "security.rateLimit.authPer15Min",
      "security.rateLimit.adminPerMinute",
      "security.rateLimit.autoBlockEnabled",
      "security.rateLimit.autoBlockThreshold",
      "security.rateLimit.autoBlockDurationMinutes",
      "security.captcha.recaptchaSiteKey",
      "security.captcha.recaptchaSecretKey",
      "security.captcha.hcaptchaSiteKey",
      "security.captcha.hcaptchaSecretKey",
    ];

    const settings = await prisma.siteSetting.findMany({
      where: { key: { in: keys } },
    });

    const map = new Map(settings.map((s) => [s.key, s.value]));

    return ok(c, {
      globalPerMinute: Number.parseInt(map.get("security.rateLimit.globalPerMinute") ?? "100", 10),
      authPer15Min: Number.parseInt(map.get("security.rateLimit.authPer15Min") ?? "5", 10),
      adminPerMinute: Number.parseInt(map.get("security.rateLimit.adminPerMinute") ?? "20", 10),
      autoBlockEnabled: (map.get("security.rateLimit.autoBlockEnabled") ?? "true") === "true",
      autoBlockThreshold: Number.parseInt(map.get("security.rateLimit.autoBlockThreshold") ?? "3", 10),
      autoBlockDurationMinutes: Number.parseInt(
        map.get("security.rateLimit.autoBlockDurationMinutes") ?? "60",
        10
      ),
      recaptchaSiteKey: map.get("security.captcha.recaptchaSiteKey") ?? "",
      recaptchaSecretKey: map.get("security.captcha.recaptchaSecretKey") ?? "",
      hcaptchaSiteKey: map.get("security.captcha.hcaptchaSiteKey") ?? "",
      hcaptchaSecretKey: map.get("security.captcha.hcaptchaSecretKey") ?? "",
    });
  })

   .put("/rate-limit-config", zValidator("json", z.object({
     globalPerMinute: z.number().int().min(10).max(5000).optional(),
     authPer15Min: z.number().int().min(1).max(100).optional(),
     adminPerMinute: z.number().int().min(1).max(1000).optional(),
     autoBlockEnabled: z.boolean().optional(),
     autoBlockThreshold: z.number().int().min(1).max(50).optional(),
     autoBlockDurationMinutes: z.number().int().min(5).max(10080).optional(),
     recaptchaSiteKey: z.string().optional(),
     recaptchaSecretKey: z.string().optional(),
     hcaptchaSiteKey: z.string().optional(),
     hcaptchaSecretKey: z.string().optional(),
   })), async (c) => {
     // Check if user has sufficient role for rate limit config (admin/moderator)
     if (!(await requireMinRole(c, "ADMIN"))) {
       return forbidden(c, "Insufficient role");
     }
    const body = c.req.valid("json");

    const upserts = [];
    if (body.globalPerMinute !== undefined) {
      upserts.push(prisma.siteSetting.upsert({
        where: { key: "security.rateLimit.globalPerMinute" },
        create: { key: "security.rateLimit.globalPerMinute", value: String(body.globalPerMinute) },
        update: { value: String(body.globalPerMinute) },
      }));
    }
    if (body.authPer15Min !== undefined) {
      upserts.push(prisma.siteSetting.upsert({
        where: { key: "security.rateLimit.authPer15Min" },
        create: { key: "security.rateLimit.authPer15Min", value: String(body.authPer15Min) },
        update: { value: String(body.authPer15Min) },
      }));
    }
    if (body.adminPerMinute !== undefined) {
      upserts.push(prisma.siteSetting.upsert({
        where: { key: "security.rateLimit.adminPerMinute" },
        create: { key: "security.rateLimit.adminPerMinute", value: String(body.adminPerMinute) },
        update: { value: String(body.adminPerMinute) },
      }));
    }
    if (body.autoBlockEnabled !== undefined) {
      upserts.push(prisma.siteSetting.upsert({
        where: { key: "security.rateLimit.autoBlockEnabled" },
        create: { key: "security.rateLimit.autoBlockEnabled", value: String(body.autoBlockEnabled) },
        update: { value: String(body.autoBlockEnabled) },
      }));
    }
    if (body.autoBlockThreshold !== undefined) {
      upserts.push(prisma.siteSetting.upsert({
        where: { key: "security.rateLimit.autoBlockThreshold" },
        create: { key: "security.rateLimit.autoBlockThreshold", value: String(body.autoBlockThreshold) },
        update: { value: String(body.autoBlockThreshold) },
      }));
    }
    if (body.autoBlockDurationMinutes !== undefined) {
      upserts.push(prisma.siteSetting.upsert({
        where: { key: "security.rateLimit.autoBlockDurationMinutes" },
        create: { key: "security.rateLimit.autoBlockDurationMinutes", value: String(body.autoBlockDurationMinutes) },
        update: { value: String(body.autoBlockDurationMinutes) },
      }));
    }
    if (body.recaptchaSiteKey !== undefined) {
      upserts.push(prisma.siteSetting.upsert({
        where: { key: "security.captcha.recaptchaSiteKey" },
        create: { key: "security.captcha.recaptchaSiteKey", value: body.recaptchaSiteKey },
        update: { value: body.recaptchaSiteKey },
      }));
      // Also sync to public key so providers.tsx can read it
      upserts.push(prisma.siteSetting.upsert({
        where: { key: "recaptcha_site_key" },
        create: { key: "recaptcha_site_key", value: body.recaptchaSiteKey },
        update: { value: body.recaptchaSiteKey },
      }));
    }
    if (body.recaptchaSecretKey !== undefined) {
      upserts.push(prisma.siteSetting.upsert({
        where: { key: "security.captcha.recaptchaSecretKey" },
        create: { key: "security.captcha.recaptchaSecretKey", value: body.recaptchaSecretKey },
        update: { value: body.recaptchaSecretKey },
      }));
    }
    if (body.hcaptchaSiteKey !== undefined) {
      upserts.push(prisma.siteSetting.upsert({
        where: { key: "security.captcha.hcaptchaSiteKey" },
        create: { key: "security.captcha.hcaptchaSiteKey", value: body.hcaptchaSiteKey },
        update: { value: body.hcaptchaSiteKey },
      }));
    }
    if (body.hcaptchaSecretKey !== undefined) {
      upserts.push(prisma.siteSetting.upsert({
        where: { key: "security.captcha.hcaptchaSecretKey" },
        create: { key: "security.captcha.hcaptchaSecretKey", value: body.hcaptchaSecretKey },
        update: { value: body.hcaptchaSecretKey },
      }));
    }

    await prisma.$transaction(upserts);

     return ok(c, body);
   })

   .get("/monitor/alerts", zValidator("query", z.object({
     limit: z.coerce.number().int().min(1).max(200).default(50),
   })), async (c) => {
     if (!(await requireMinRole(c, "ADMIN"))) {
       return forbidden(c, "Insufficient role");
     }

     const { limit } = c.req.valid("query");
     const alerts = await getRecentMonitorAlerts(limit);
     return ok(c, alerts);
   })

   .get("/monitor/incidents", async (c) => {
     if (!(await requireMinRole(c, "ADMIN"))) {
       return forbidden(c, "Insufficient role");
     }

     const incidents = await getMonitorIncidents();
     return ok(c, incidents);
   })

   .post("/monitor/incidents/:source/silence", zValidator("json", z.object({
     minutes: z.coerce.number().int().min(1).max(10080).optional(),
   })), async (c) => {
     if (!(await requireMinRole(c, "ADMIN"))) {
       return forbidden(c, "Insufficient role");
     }

     const source = c.req.param("source");
     const { minutes } = c.req.valid("json");
     const silencedUntil = await setMonitorSilence(source, minutes);
     return ok(c, { source, silencedUntil });
   })

   .delete("/monitor/incidents/:source/silence", async (c) => {
     if (!(await requireMinRole(c, "ADMIN"))) {
       return forbidden(c, "Insufficient role");
     }

     const source = c.req.param("source");
     await clearMonitorSilence(source);
     return ok(c, { source, cleared: true });
   })
   .route("/lockout", lockoutRouter);

export default security;
