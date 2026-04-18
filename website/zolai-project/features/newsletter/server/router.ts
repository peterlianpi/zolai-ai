import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import {
  ok,
  created,
  badRequest,
  notFound,
  conflict,
  internalError,
  list,
  unauthorized,
} from "@/lib/api/response";
import { checkIsAdmin } from "@/lib/auth/server-guards";
import crypto from "crypto";
import {
  subscribeSchema,
  confirmSubscriberSchema,
  unsubscribeSchema,
  sendCampaignSchema,
  subscribersListSchema,
} from "@/features/newsletter/schemas/subscriber.schema";
import { sendEmail } from "@/lib/email/resend";
import { DEFAULT_SITE_NAME, DEFAULT_SITE_URL } from "@/lib/constants/site";

const app = new Hono()
  .post("/subscribe", zValidator("json", subscribeSchema), async (c) => {
    try {
      const input = c.req.valid("json");
      const existingSubscriber = await prisma.subscriber.findUnique({
        where: { email: input.email },
      });

      if (existingSubscriber) {
        if (existingSubscriber.status === "CONFIRMED") {
          return conflict(c, "Already subscribed with this email");
        }
        return created(c, {
          id: existingSubscriber.id,
          email: existingSubscriber.email,
          status: existingSubscriber.status,
          message: "Confirmation email sent",
        });
      }

      const token = crypto.randomBytes(32).toString("hex");
      const subscriber = await prisma.subscriber.create({
        data: {
          email: input.email,
          name: input.name || null,
          source: input.source || null,
          token,
          status: "PENDING",
        },
      });

      const confirmUrl = `${DEFAULT_SITE_URL}/api/newsletter/confirm?token=${token}`;
      try {
        await sendEmail({
          to: subscriber.email,
          subject: `Confirm your subscription to ${DEFAULT_SITE_NAME}`,
          html: `<p>Hi ${subscriber.name || "there"},</p><p>Click below to confirm your subscription:</p><p><a href="${confirmUrl}">${confirmUrl}</a></p><p>If you didn't subscribe, ignore this email.</p>`,
        });
      } catch (_e) {
      }
      return created(c, {
        id: subscriber.id,
        email: subscriber.email,
        status: subscriber.status,
        message: "Please check your email to confirm subscription",
      });
    } catch (_err) {
      return internalError(c, "Failed to process subscription");
    }
  })

  .post("/confirm", zValidator("json", confirmSubscriberSchema), async (c) => {
    try {
      const input = c.req.valid("json");

      const subscriber = await prisma.subscriber.findUnique({
        where: { token: input.token },
      });

      if (!subscriber) {
        return notFound(c, "Invalid or expired confirmation token");
      }

      if (subscriber.status === "CONFIRMED") {
        return ok(c, {
          id: subscriber.id,
          email: subscriber.email,
          status: subscriber.status,
          message: "Already confirmed",
        });
      }

      const updated = await prisma.subscriber.update({
        where: { id: subscriber.id },
        data: {
          status: "CONFIRMED",
          confirmedAt: new Date(),
        },
      });

      return ok(c, {
        id: updated.id,
        email: updated.email,
        status: updated.status,
        message: "Subscription confirmed",
      });
    } catch (_err) {
      return internalError(c, "Failed to confirm subscription");
    }
  })

  .post("/unsubscribe", zValidator("json", unsubscribeSchema), async (c) => {
    try {
      const input = c.req.valid("json");

      const subscriber = await prisma.subscriber.findUnique({
        where: { token: input.token },
      });

      if (!subscriber) {
        return notFound(c, "Invalid or expired unsubscribe token");
      }

      const updated = await prisma.subscriber.update({
        where: { id: subscriber.id },
        data: {
          status: "UNSUBSCRIBED",
          unsubscribedAt: new Date(),
        },
      });

      return ok(c, {
        id: updated.id,
        email: updated.email,
        status: updated.status,
        message: "Unsubscribed successfully",
      });
    } catch (_err) {
      return internalError(c, "Failed to unsubscribe");
    }
  })

  .get("/admin/subscribers", zValidator("query", subscribersListSchema), async (c) => {
    try {
      const isAdmin = await checkIsAdmin(c);
      if (!isAdmin) {
        return unauthorized(c, "Admin access required");
      }

      const query = c.req.valid("query");
      const where: Record<string, unknown> = {};

      if (query.status && query.status !== "ALL") {
        where.status = query.status;
      }

      if (query.search) {
        where.OR = [
          { email: { contains: query.search, mode: "insensitive" } },
          { name: { contains: query.search, mode: "insensitive" } },
        ];
      }

      const total = await prisma.subscriber.count({ where });
      const totalPages = Math.ceil(total / query.limit);

      const subscribers = await prisma.subscriber.findMany({
        where,
        select: {
          id: true,
          email: true,
          name: true,
          status: true,
          token: true,
          subscribedAt: true,
          confirmedAt: true,
          unsubscribedAt: true,
          source: true,
          moderatedById: true,
          moderator: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: { subscribedAt: "desc" },
        skip: (query.page - 1) * query.limit,
        take: query.limit,
      });

      return list(c, subscribers, {
        total,
        page: query.page,
        limit: query.limit,
        totalPages,
      });
    } catch (_err) {
      return internalError(c, "Failed to fetch subscribers");
    }
  })

  .get("/admin/subscribers/stats", async (c) => {
    try {
      const isAdmin = await checkIsAdmin(c);
      if (!isAdmin) {
        return unauthorized(c, "Admin access required");
      }

      const [total, confirmed, pending, unsubscribed, bounced] = await Promise.all([
        prisma.subscriber.count(),
        prisma.subscriber.count({ where: { status: "CONFIRMED" } }),
        prisma.subscriber.count({ where: { status: "PENDING" } }),
        prisma.subscriber.count({ where: { status: "UNSUBSCRIBED" } }),
        prisma.subscriber.count({ where: { status: "BOUNCED" } }),
      ]);

      return ok(c, {
        total,
        confirmed,
        pending,
        unsubscribed,
        bounced,
      });
    } catch (_err) {
      return internalError(c, "Failed to fetch stats");
    }
  })

  .patch(
    "/admin/subscribers/:id",
    zValidator("json", z.object({ status: z.enum(["PENDING", "CONFIRMED", "UNSUBSCRIBED", "BOUNCED"]) })),
    async (c) => {
      try {
        const isAdmin = await checkIsAdmin(c);
        if (!isAdmin) {
          return unauthorized(c, "Admin access required");
        }

        const id = c.req.param("id");
        const input = c.req.valid("json");

        const subscriber = await prisma.subscriber.findUnique({
          where: { id },
        });

        if (!subscriber) {
          return notFound(c, "Subscriber not found");
        }

        const updated = await prisma.subscriber.update({
          where: { id },
          data: {
            status: input.status,
            ...(input.status === "CONFIRMED" && { confirmedAt: new Date() }),
            ...(input.status === "UNSUBSCRIBED" && { unsubscribedAt: new Date() }),
          },
        });

        return ok(c, updated);
      } catch (_err) {
        return internalError(c, "Failed to update subscriber");
      }
    }
  )

  .post(
    "/admin/campaigns/:id/send",
    zValidator("json", sendCampaignSchema),
    async (c) => {
      try {
        const isAdmin = await checkIsAdmin(c);
        if (!isAdmin) {
          return unauthorized(c, "Admin access required");
        }

        const id = c.req.param("id");

        const campaign = await prisma.newsletterCampaign.findUnique({
          where: { id },
        });

        if (!campaign) {
          return notFound(c, "Campaign not found");
        }

        if (campaign.status !== "DRAFT" && campaign.status !== "SCHEDULED") {
          return badRequest(c, "Can only send draft or scheduled campaigns");
        }

        const subscribers = await prisma.subscriber.findMany({
          where: { status: "CONFIRMED" },
        });

        if (subscribers.length === 0) {
          return badRequest(c, "No confirmed subscribers to send to");
        }

        const BATCH = 50;
        let sentCount = 0;
        for (let i = 0; i < subscribers.length; i += BATCH) {
          const batch = subscribers.slice(i, i + BATCH);
          await Promise.allSettled(
            batch.map((sub) =>
              sendEmail({
                to: sub.email,
                subject: campaign.subject,
                html: `${campaign.body}<br><br><small><a href="${DEFAULT_SITE_URL}/api/newsletter/unsubscribe?token=${sub.token}">Unsubscribe</a></small>`,
              })
                .then(() => {
                  sentCount++;
                })
                .catch(() => {})
            )
          );
          if (i + BATCH < subscribers.length) await new Promise((r) => setTimeout(r, 100));
        }
        const updated = await prisma.newsletterCampaign.update({
          where: { id },
          data: {
            status: "SENT",
            sentAt: new Date(),
            sentCount,
          },
        });

        return ok(c, {
          ...updated,
          message: `Campaign queued to send to ${subscribers.length} subscribers`,
        });
      } catch (_err) {
        return internalError(c, "Failed to send campaign");
      }
    }
  )

  .delete("/admin/campaigns/:id", async (c) => {
    try {
      const isAdmin = await checkIsAdmin(c);
      if (!isAdmin) {
        return unauthorized(c, "Admin access required");
      }

      const id = c.req.param("id");

      const campaign = await prisma.newsletterCampaign.findUnique({
        where: { id },
      });

      if (!campaign) {
        return notFound(c, "Campaign not found");
      }

      if (campaign.status !== "DRAFT") {
        return badRequest(c, "Can only delete draft campaigns");
      }

      await prisma.newsletterCampaign.delete({
        where: { id },
      });

      return ok(c, { message: "Campaign deleted" });
    } catch (_err) {
      return internalError(c, "Failed to delete campaign");
    }
  });

export default app;
