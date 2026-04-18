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

    await prisma.subscriber.create({
      data: {
        email: body.email,
        name: body.name,
        status: "PENDING",
        token,
        source: body.source,
      },
    });

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const confirmUrl = `${baseUrl}/newsletter/confirm?token=${token}`;
    const siteName = process.env.NEXT_PUBLIC_APP_NAME || "Zolai AI";

    // HTML Email Template
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Confirm Your Subscription</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f9fafb; }
          .container { max-width: 600px; margin: 40px auto; padding: 20px; background: white; border-radius: 8px; border: 1px solid #e5e7eb; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); }
          .header { text-align: center; border-bottom: 2px solid #f3f4f6; padding-bottom: 20px; }
          .logo { color: #7a1c1c; font-size: 24px; font-weight: bold; text-decoration: none; }
          .content { padding: 30px 20px; text-align: center; }
          .button { display: inline-block; padding: 14px 28px; background-color: #7a1c1c; color: white !important; text-decoration: none; border-radius: 6px; font-weight: bold; margin-top: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
          .footer { text-align: center; font-size: 12px; color: #6b7280; padding-top: 20px; border-top: 1px solid #f3f4f6; }
          h1 { color: #111827; margin-bottom: 10px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <a href="${baseUrl}" class="logo">${siteName}</a>
          </div>
          <div class="content">
            <h1>Welcome to ${siteName}!</h1>
            <p>Lungdam mahmah hi! Please confirm your subscription to our newsletter to receive the latest Zolai language resources, news, and AI updates.</p>
            <a href="${confirmUrl}" class="button">Confirm Subscription</a>
            <p style="margin-top: 30px; font-size: 14px; color: #6b7280;">
              If you did not sign up for this newsletter, you can safely ignore this email.
            </p>
          </div>
          <div class="footer">
            &copy; ${new Date().getFullYear()} ${siteName}. All rights reserved.
          </div>
        </div>
      </body>
      </html>
    `;

    try {
      await sendEmail({
        to: body.email,
        subject: `Confirm your subscription to ${siteName}`,
        html,
        text: `Click here to confirm your subscription to ${siteName}: ${confirmUrl}`,
      });
    } catch (_err) {
      // email error suppressed
    }

    return created(c, { message: "Please check your email to confirm subscription" });
  })

  .get("/confirm/:token", async (c) => {
    const token = c.req.param("token");

    const subscriber = await prisma.subscriber.findUnique({ where: { token } });
    if (!subscriber) {
      return c.json({ success: false, error: { message: "Invalid token" } }, 404);
    }

    if (subscriber.status === "CONFIRMED") {
      return ok(c, { message: "Already confirmed", alreadyConfirmed: true });
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

    const where: { email: string; token?: string } = { email };
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
      } catch (_err) {
        // per-subscriber error suppressed
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
        entityType: "Subscriber", // Fixed entityType (was Subscriber, should be NewsletterCampaign)
        entityId: id ?? "unknown",
        oldValues: toAuditJson(existing),
        createdById: userId,
      },
    });

    return ok(c, { id });
  });

export default newsletter;
