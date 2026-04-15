import { Hono } from "hono";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import prisma from "@/lib/prisma";
import { getSessionUserId } from "@/lib/auth/server-guards";
import { toAuditJson } from "@/lib/audit";
import { sendEmail } from "@/lib/email/resend";
import { ok, created, list, error, notFound, forbidden } from "@/lib/api/response";
import { requireMinRole } from "@/lib/auth/server-guards";

const subscriberQuerySchema = z.object({
  status: z.string().optional(),
  search: z.string().optional(),
  page: z.coerce.number().default(1),
  limit: z.coerce.number().default(20),
});

const campaignQuerySchema = z.object({
  status: z.string().optional(),
  search: z.string().optional(),
  page: z.coerce.number().default(1),
  limit: z.coerce.number().default(20),
});

const updateSubscriberSchema = z.object({
  status: z.enum(["PENDING", "CONFIRMED", "UNSUBSCRIBED", "BOUNCED"]).optional(),
  name: z.string().max(100).optional().nullable(),
});

const createSubscriberSchema = z.object({
  email: z.string().email("Invalid email address"),
  name: z.string().max(100).optional(),
  source: z.string().max(100).optional(),
});

const createCampaignSchema = z.object({
  name: z.string().min(1, "Campaign name is required"),
  subject: z.string().min(1, "Subject is required"),
  body: z.string().min(1, "Body is required"),
  scheduledAt: z.string().datetime().optional(),
});

const updateCampaignSchema = createCampaignSchema.partial();

const newsletter = new Hono()

   .get("/subscribers", zValidator("query", subscriberQuerySchema), async (c) => {
     // Check if user has sufficient role for newsletter subscribers (admin/moderator)
     if (!(await requireMinRole(c, "ADMIN"))) {
       return forbidden(c, "Insufficient role");
     }
    const { status, search, page, limit } = c.req.valid("query");
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { email: { contains: search } },
        { name: { contains: search } },
      ];
    }

    const [subscribers, total] = await Promise.all([
      prisma.subscriber.findMany({
        where,
        orderBy: { subscribedAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.subscriber.count({ where }),
    ]);

    return list(c, subscribers, { total, page, limit, totalPages: Math.ceil(total / limit) });
  })

   .get("/subscribers/stats", async (c) => {
     // Check if user has sufficient role for newsletter subscriber stats (admin/moderator)
     if (!(await requireMinRole(c, "ADMIN"))) {
       return forbidden(c, "Insufficient role");
     }
    const [confirmed, pending, unsubscribed, bounced, total] = await Promise.all([
      prisma.subscriber.count({ where: { status: "CONFIRMED" } }),
      prisma.subscriber.count({ where: { status: "PENDING" } }),
      prisma.subscriber.count({ where: { status: "UNSUBSCRIBED" } }),
      prisma.subscriber.count({ where: { status: "BOUNCED" } }),
      prisma.subscriber.count(),
    ]);

    return ok(c, { confirmed, pending, unsubscribed, bounced, total });
  })

   .patch("/subscribers/:id", zValidator("json", updateSubscriberSchema), async (c) => {
     // Check if user has sufficient role for updating subscribers (admin/moderator)
     if (!(await requireMinRole(c, "ADMIN"))) {
       return forbidden(c, "Insufficient role");
     }
    const id = c.req.param("id");
    const body = c.req.valid("json");
    const userId = await getSessionUserId(c);

    const existing = await prisma.subscriber.findUnique({ where: { id } });
    if (!existing) {
      return notFound(c, "Subscriber not found");
    }

    const subscriber = await prisma.subscriber.update({
      where: { id },
      data: body,
    });

    await prisma.auditLog.create({
      data: {
        action: "UPDATE",
        entityType: "Subscriber",
        entityId: id ?? "unknown",
        oldValues: toAuditJson(existing),
        newValues: toAuditJson(body),
        createdById: userId,
      },
    });

    return ok(c, subscriber);
  })

   .delete("/subscribers/:id", async (c) => {
     // Check if user has sufficient role for deleting subscribers (admin/moderator)
     if (!(await requireMinRole(c, "ADMIN"))) {
       return forbidden(c, "Insufficient role");
     }
    const id = c.req.param("id");
    const userId = await getSessionUserId(c);

    const existing = await prisma.subscriber.findUnique({ where: { id } });
    if (!existing) {
      return notFound(c, "Subscriber not found");
    }

    await prisma.subscriber.delete({ where: { id } });

    await prisma.auditLog.create({
      data: {
        action: "DELETE",
        entityType: "Subscriber",
        entityId: id ?? "unknown",
        oldValues: toAuditJson(existing),
        createdById: userId,
      },
    });

    return ok(c, { id });
  })

  .post("/subscribe", zValidator("json", createSubscriberSchema), async (c) => {
    const body = c.req.valid("json");

    const existing = await prisma.subscriber.findUnique({
      where: { email: body.email },
    });

    if (existing) {
      if (existing.status === "UNSUBSCRIBED") {
        return error(c, "This email has unsubscribed", "UNSUBSCRIBED", 400);
      }
      return ok(c, { message: "Already subscribed" });
    }

    const token = crypto.randomUUID();

    const _subscriber = await prisma.subscriber.create({
      data: {
        email: body.email,
        name: body.name,
        status: "PENDING",
        token,
        source: body.source,
      },
    });

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://zolai.ai";
    const confirmUrl = `${baseUrl}/api/newsletter/confirm/${token}`;

    try {
      await sendEmail({
        to: body.email,
        subject: "Confirm your subscription to Zolai AI",
        text: `Click here to confirm your subscription: ${confirmUrl}`,
      });
    } catch (err) {
      console.error("[Newsletter] Failed to send confirmation email:", err);
    }

    return created(c, { message: "Please check your email to confirm subscription" });
  })

  .get("/confirm/:token", async (c) => {
    const token = c.req.param("token");

    const subscriber = await prisma.subscriber.findUnique({ where: { token } });
    if (!subscriber) {
      return notFound(c, "Invalid token");
    }

    if (subscriber.status === "CONFIRMED") {
      return ok(c, { message: "Already confirmed" });
    }

    await prisma.subscriber.update({
      where: { id: subscriber.id },
      data: { status: "CONFIRMED", confirmedAt: new Date() },
    });

    return ok(c, { message: "Subscription confirmed!" });
  })

  .post("/unsubscribe", zValidator("json", z.object({
    email: z.string().email(),
    token: z.string().optional(),
  })), async (c) => {
    const { email, token } = c.req.valid("json");

    const where: Record<string, unknown> = { email };
    if (token) where.token = token;

    const subscriber = await prisma.subscriber.findFirst({ where });
    if (!subscriber) {
      return notFound(c, "Subscriber not found");
    }

    await prisma.subscriber.update({
      where: { id: subscriber.id },
      data: { status: "UNSUBSCRIBED", unsubscribedAt: new Date() },
    });

    return ok(c, { message: "Successfully unsubscribed" });
  })

   .get("/campaigns", zValidator("query", campaignQuerySchema), async (c) => {
     // Check if user has sufficient role for newsletter campaigns (admin/moderator)
     if (!(await requireMinRole(c, "ADMIN"))) {
       return forbidden(c, "Insufficient role");
     }
    const { status, search, page, limit } = c.req.valid("query");
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { subject: { contains: search } },
      ];
    }

    const [campaigns, total] = await Promise.all([
      prisma.newsletterCampaign.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.newsletterCampaign.count({ where }),
    ]);

    return list(c, campaigns, { total, page, limit, totalPages: Math.ceil(total / limit) });
  })

   .get("/campaigns/stats", async (c) => {
     // Check if user has sufficient role for newsletter campaign stats (admin/moderator)
     if (!(await requireMinRole(c, "ADMIN"))) {
       return forbidden(c, "Insufficient role");
     }
    const [totalCampaigns, draftCampaigns, sentCampaigns, aggregate] = await Promise.all([
      prisma.newsletterCampaign.count(),
      prisma.newsletterCampaign.count({ where: { status: "DRAFT" } }),
      prisma.newsletterCampaign.count({ where: { status: "SENT" } }),
      prisma.newsletterCampaign.aggregate({
        _sum: { sentCount: true, openCount: true, clickCount: true },
      }),
    ]);

    const totalSent = aggregate._sum.sentCount ?? 0;
    const totalOpens = aggregate._sum.openCount ?? 0;
    const totalClicks = aggregate._sum.clickCount ?? 0;

    return ok(c, {
      totalCampaigns,
      draftCampaigns,
      sentCampaigns,
      totalSent,
      avgOpenRate: totalSent > 0 ? totalOpens / totalSent : 0,
      avgClickRate: totalSent > 0 ? totalClicks / totalSent : 0,
    });
  })

   .post("/campaigns", zValidator("json", createCampaignSchema), async (c) => {
     // Check if user has sufficient role for creating newsletter campaigns (admin/moderator)
     if (!(await requireMinRole(c, "ADMIN"))) {
       return forbidden(c, "Insufficient role");
     }
    const body = c.req.valid("json");
    const userId = await getSessionUserId(c);

    const campaign = await prisma.newsletterCampaign.create({
      data: {
        name: body.name,
        subject: body.subject,
        body: body.body,
        scheduledAt: body.scheduledAt ? new Date(body.scheduledAt) : null,
        status: body.scheduledAt ? "SCHEDULED" : "DRAFT",
      },
    });

    await prisma.auditLog.create({
      data: {
        action: "CREATE",
        entityType: "NewsletterCampaign",
        entityId: campaign.id,
        newValues: toAuditJson({ name: body.name, subject: body.subject }),
        createdById: userId,
      },
    });

    return created(c, campaign);
  })

   .patch("/campaigns/:id", zValidator("json", updateCampaignSchema), async (c) => {
     // Check if user has sufficient role for updating newsletter campaigns (admin/moderator)
     if (!(await requireMinRole(c, "ADMIN"))) {
       return forbidden(c, "Insufficient role");
     }
    const id = c.req.param("id");
    const body = c.req.valid("json");
    const userId = await getSessionUserId(c);

    const existing = await prisma.newsletterCampaign.findUnique({ where: { id } });
    if (!existing) {
      return notFound(c, "Campaign not found");
    }

    const campaign = await prisma.newsletterCampaign.update({
      where: { id },
      data: {
        ...body,
        scheduledAt: body.scheduledAt ? new Date(body.scheduledAt) : existing.scheduledAt,
      },
    });

    await prisma.auditLog.create({
      data: {
        action: "UPDATE",
        entityType: "NewsletterCampaign",
        entityId: id ?? "unknown",
        oldValues: toAuditJson(existing),
        newValues: toAuditJson(body),
        createdById: userId,
      },
    });

    return ok(c, campaign);
  })

   .post("/campaigns/:id/send", async (c) => {
     // Check if user has sufficient role for sending newsletter campaigns (admin/moderator)
     if (!(await requireMinRole(c, "ADMIN"))) {
       return forbidden(c, "Insufficient role");
     }
    const id = c.req.param("id");
    const userId = await getSessionUserId(c);

    const campaign = await prisma.newsletterCampaign.findUnique({ where: { id } });
    if (!campaign) {
      return notFound(c, "Campaign not found");
    }

    const subscribers = await prisma.subscriber.findMany({
      where: { status: "CONFIRMED" },
      select: { email: true, name: true },
    });

    let sentCount = 0;
    for (const subscriber of subscribers) {
      try {
        const personalizedBody = campaign.body
          .replace(/\{\{name\}\}/g, subscriber.name || "Subscriber")
          .replace(/\{\{email\}\}/g, subscriber.email);

        await sendEmail({
          to: subscriber.email,
          subject: campaign.subject,
          html: personalizedBody,
          text: personalizedBody.replace(/<[^>]*>/g, ""),
        });
        sentCount++;
      } catch (err) {
        console.error(`[Newsletter] Failed to send to ${subscriber.email}:`, err);
      }
    }

    await prisma.newsletterCampaign.update({
      where: { id },
      data: { status: "SENT", sentCount, sentAt: new Date() },
    });

    await prisma.auditLog.create({
      data: {
        action: "COMPLETE",
        entityType: "NewsletterCampaign",
        entityId: id ?? "unknown",
        newValues: toAuditJson({ sentCount }),
        createdById: userId,
      },
    });

    return ok(c, { sentCount, total: subscribers.length });
  })

   .delete("/campaigns/:id", async (c) => {
     // Check if user has sufficient role for deleting newsletter campaigns (admin/moderator)
     if (!(await requireMinRole(c, "ADMIN"))) {
       return forbidden(c, "Insufficient role");
     }
    const id = c.req.param("id");
    const userId = await getSessionUserId(c);

    const existing = await prisma.newsletterCampaign.findUnique({ where: { id } });
    if (!existing) {
      return notFound(c, "Campaign not found");
    }

    await prisma.newsletterCampaign.delete({ where: { id } });

    await prisma.auditLog.create({
      data: {
        action: "DELETE",
        entityType: "NewsletterCampaign",
        entityId: id ?? "unknown",
        oldValues: toAuditJson(existing),
        createdById: userId,
      },
    });

    return ok(c, { id });
  });

export default newsletter;
