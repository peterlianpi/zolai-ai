import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { ok, unauthorized, notFound, forbidden, created, badRequest } from "@/lib/api/response";
import { z } from "zod";
import { requireMinRole } from "@/lib/auth/server-guards";

const createTemplateSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  subject: z.string().min(1),
  body: z.string().min(1),
  type: z.string().min(1),
  variables: z.record(z.string(), z.string()).optional(),
  isActive: z.boolean().optional().default(true),
});

const updateTemplateSchema = z.object({
  name: z.string().min(1).optional(),
  subject: z.string().min(1).optional(),
  body: z.string().min(1).optional(),
  variables: z.record(z.string(), z.string()).optional(),
  isActive: z.boolean().optional(),
});

const sendBulkSchema = z.object({
  templateId: z.string().optional(),
  title: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
  type: z.string().min(1),
  userIds: z.array(z.string()).min(1),
  variables: z.record(z.string(), z.string()).optional(),
});

const app = new Hono()

  // Get all notifications for the current user
  .get("/", async (c) => {
    const session = await auth.api.getSession({
      headers: c.req.raw.headers,
    });

    if (!session) {
      return unauthorized(c);
    }

    const notifications = await prisma.notification.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        title: true,
        description: true,
        type: true,
        action: true,
        actorUserId: true,
        actorName: true,
        metadata: true,
        link: true,
        entityType: true,
        entityId: true,
        read: true,
        readAt: true,
        createdAt: true,
        userId: true,
      },
      take: 20,
    });

    return ok(c, notifications);
  })

  // Mark a notification as read (idempotent with race condition prevention)
  .post("/:id/read", async (c) => {
    const session = await auth.api.getSession({
      headers: c.req.raw.headers,
    });

    if (!session) {
      return unauthorized(c);
    }

    const notificationId = c.req.param("id");

    // Use Prisma's interactive transaction to prevent race conditions
    const result = await prisma.$transaction(
      async (tx) => {
        // First, retrieve the current notification state
        const notification = await tx.notification.findUnique({
          where: {
            id: notificationId,
          },
        });

        if (!notification) {
          return { success: false, code: "NOT_FOUND" as const };
        }

        if (notification.userId !== session.user.id) {
          return { success: false, code: "FORBIDDEN" as const };
        }

        // Check if already read - skip update if so (idempotent)
        if (notification.readAt !== null) {
          console.debug(
            `[Notifications] Skipping update for already-read notification: ${notificationId}`,
          );
          return { success: true, code: "ALREADY_READ" as const };
        }

        // Use atomic update with condition to prevent race conditions
        // This ensures the update only happens if readAt is still null
        const updated = await tx.notification.updateMany({
          where: {
            id: notificationId,
            readAt: null, // Atomic check - only update if still unread
          },
          data: {
            read: true,
            readAt: new Date(),
          },
        });

        // If no rows were updated, another process already marked it as read
        if (updated.count === 0) {
          console.debug(
            `[Notifications] Race condition avoided for notification: ${notificationId}`,
          );
          return { success: true, code: "ALREADY_READ" as const };
        }

        return { success: true, code: "UPDATED" as const };
      },
      {
        // Use Serializable isolation to prevent race conditions
        isolationLevel: "Serializable",
      },
    );

    if (result.code === "NOT_FOUND") {
      return notFound(c, "Notification not found");
    }

    if (result.code === "FORBIDDEN") {
      return forbidden(c);
    }

    // Return success regardless of whether we updated or it was already read
    // This ensures idempotency - calling multiple times is safe
    return ok(c, { status: result.code });
  })

  // Mark all notifications as read
  .post("/read-all", async (c) => {
    const session = await auth.api.getSession({
      headers: c.req.raw.headers,
    });

    if (!session) {
      return unauthorized(c);
    }

    // Use updateMany with read: false condition to only update unread notifications
    // This is already idempotent - calling multiple times has no side effects
    const result = await prisma.notification.updateMany({
      where: {
        userId: session.user.id,
        read: false,
      },
      data: {
        read: true,
        readAt: new Date(),
      },
    });

    console.debug(
      `[Notifications] Marked ${result.count} notifications as read for user: ${session.user.id}`,
    );

    return ok(c, { updatedCount: result.count });
  })

  // Get unread notification count
  .get("/unread-count", async (c) => {
    const session = await auth.api.getSession({
      headers: c.req.raw.headers,
    });

    if (!session) {
      return unauthorized(c);
    }

    const count = await prisma.notification.count({
      where: {
        userId: session.user.id,
        read: false,
      },
    });

    return ok(c, { count });
  })

  // ============================================
  // NOTIFICATION TEMPLATES (Admin Only)
  // ============================================

  // Get all notification templates (admin only)
  .get("/templates", async (c) => {
    const session = await auth.api.getSession({
      headers: c.req.raw.headers,
    });

    if (!session) {
      return unauthorized(c);
    }

    // Check if user is admin
    if (!(await requireMinRole(c, "ADMIN"))) {
      return forbidden(c);
    }

    const templates = await prisma.notificationTemplate.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    return ok(c, templates);
  })

  // Create a new notification template (admin only)
  .post("/templates", zValidator("json", createTemplateSchema), async (c) => {
    const session = await auth.api.getSession({
      headers: c.req.raw.headers,
    });

    if (!session) {
      return unauthorized(c);
    }

    if (!(await requireMinRole(c, "ADMIN"))) {
      return forbidden(c);
    }

    try {
      const data = c.req.valid("json");

      // Check if slug already exists
      const existing = await prisma.notificationTemplate.findUnique({
        where: { slug: data.slug },
      });

      if (existing) {
        return badRequest(c, "Template with this slug already exists");
      }

      const template = await prisma.notificationTemplate.create({
        data,
      });

      return created(c, template);
    } catch (error) {
      throw error;
    }
  })

  // Get a notification template by id (admin only)
  .get("/templates/:id", async (c) => {
    const session = await auth.api.getSession({
      headers: c.req.raw.headers,
    });

    if (!session) {
      return unauthorized(c);
    }

    if (!(await requireMinRole(c, "ADMIN"))) {
      return forbidden(c);
    }

    const templateId = c.req.param("id");
    const template = await prisma.notificationTemplate.findUnique({
      where: { id: templateId },
    });

    if (!template) {
      return notFound(c, "Template not found");
    }

    return ok(c, template);
  })

  // Update a notification template (admin only)
  .put("/templates/:id", zValidator("json", updateTemplateSchema), async (c) => {
    const session = await auth.api.getSession({
      headers: c.req.raw.headers,
    });

    if (!session) {
      return unauthorized(c);
    }

    if (!(await requireMinRole(c, "ADMIN"))) {
      return forbidden(c);
    }

    const templateId = c.req.param("id");

    try {
      const data = c.req.valid("json");

      const template = await prisma.notificationTemplate.findUnique({
        where: { id: templateId },
      });

      if (!template) {
        return notFound(c, "Template not found");
      }

      const updated = await prisma.notificationTemplate.update({
        where: { id: templateId },
        data,
      });

      return ok(c, updated);
    } catch (error) {
      throw error;
    }
  })

  // Delete a notification template (admin only)
  .delete("/templates/:id", async (c) => {
    const session = await auth.api.getSession({
      headers: c.req.raw.headers,
    });

    if (!session) {
      return unauthorized(c);
    }

    if (!(await requireMinRole(c, "ADMIN"))) {
      return forbidden(c);
    }

    const templateId = c.req.param("id");

    const template = await prisma.notificationTemplate.findUnique({
      where: { id: templateId },
    });

    if (!template) {
      return notFound(c, "Template not found");
    }

    await prisma.notificationTemplate.delete({
      where: { id: templateId },
    });

    return ok(c, { success: true });
  })

  // ============================================
  // BULK NOTIFICATIONS
  // ============================================

  // Send bulk notifications using a template (admin only)
  .post("/send-bulk", zValidator("json", sendBulkSchema), async (c) => {
    const session = await auth.api.getSession({
      headers: c.req.raw.headers,
    });

    if (!session) {
      return unauthorized(c);
    }

    if (!(await requireMinRole(c, "ADMIN"))) {
      return forbidden(c);
    }

    try {
      const data = c.req.valid("json");

      // If using a template, validate it exists
      let template = null;
      if (data.templateId) {
        template = await prisma.notificationTemplate.findUnique({
          where: { id: data.templateId },
        });
        if (!template) {
          return notFound(c, "Template not found");
        }
        if (!template.isActive) {
          return badRequest(c, "Template is not active");
        }
      }

      // Validate all user IDs exist
      const users = await prisma.user.findMany({
        where: {
          id: { in: data.userIds },
        },
        select: { id: true },
      });

      if (users.length !== data.userIds.length) {
        return badRequest(c, "Some user IDs are invalid");
      }

      // Create notifications for all users
      const notifications = data.userIds.map((userId) => ({
        title: template?.subject || data.title!,
        description: template?.body || data.description!,
        type: data.type,
        userId,
        entityType: null,
        entityId: null,
      }));

      const created = await prisma.notification.createMany({
        data: notifications,
      });

      return ok(c, {
        success: true,
        createdCount: created.count,
        message: `Sent ${created.count} notifications`,
      });
    } catch (error) {
      throw error;
    }
  });

export default app;
