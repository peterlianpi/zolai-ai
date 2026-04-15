import { Hono } from "hono";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import prisma from "@/lib/prisma";
import { adminMiddleware } from "@/lib/audit";
import { ok, created } from "@/lib/api/response";

const cookieConsent = new Hono()

  .post("/", zValidator("json", z.object({
    sessionId: z.string().min(1),
    preferences: z.object({
      necessary: z.boolean().default(true),
      analytics: z.boolean().default(false),
      marketing: z.boolean().default(false),
      functional: z.boolean().default(false),
    }),
    ip: z.string().optional(),
    userAgent: z.string().optional(),
  })), async (c) => {
    const body = c.req.valid("json");

    const consent = await prisma.cookieConsent.upsert({
      where: { sessionId: body.sessionId },
      update: {
        preferences: body.preferences,
        ip: body.ip,
        userAgent: body.userAgent,
      },
      create: {
        sessionId: body.sessionId,
        preferences: body.preferences,
        ip: body.ip,
        userAgent: body.userAgent,
      },
    });

    return created(c, consent);
  })

  .get("/stats", adminMiddleware, async (c) => {
    const total = await prisma.cookieConsent.count();
    const analyticsAccepted = await prisma.cookieConsent.count({
      where: { preferences: { path: ["analytics"], equals: true } },
    });
    const marketingAccepted = await prisma.cookieConsent.count({
      where: { preferences: { path: ["marketing"], equals: true } },
    });

    return ok(c, {
      total,
      analyticsAccepted,
      marketingAccepted,
      analyticsRate: total > 0 ? (analyticsAccepted / total) * 100 : 0,
      marketingRate: total > 0 ? (marketingAccepted / total) * 100 : 0,
    });
  });

export default cookieConsent;
