import type { MediaWhereInput } from "@/lib/generated/prisma/index";
import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { revalidateTag } from "next/cache";
import prisma from "@/lib/prisma";
import { getSessionUserId, getIpAndUa } from "@/lib/auth/server-guards";
import { toAuditJson } from "@/lib/audit";
import {
  createMediaSchema,
  updateMediaSchema,
} from "@/features/content/schemas";
import { ok, created, list, notFound } from "@/lib/api/response";

// ============================================
// MEDIA ROUTER
// ============================================

import { adminMiddleware } from "@/lib/audit";

const media = new Hono()

  // GET /api/media - List media with pagination
  .get("/", async (c) => {
    const page = parseInt(c.req.query("page") ?? "1");
    const limit = parseInt(c.req.query("limit") ?? "20");
    const mimeType = c.req.query("mimeType");
    const skip = (page - 1) * limit;

    const where: MediaWhereInput = {};
    if (mimeType) where.mimeType = mimeType;

    const [items, total] = await Promise.all([
      prisma.media.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.media.count({ where }),
    ]);

    return list(c, items, { total, page, limit, totalPages: Math.ceil(total / limit) });
  })

  // GET /api/media/:id - Get single media
  .get("/:id", async (c) => {
    const id = c.req.param("id");

    const item = await prisma.media.findUnique({ where: { id } });
    if (!item) {
      return notFound(c, "Media not found");
    }

    return ok(c, item);
  })

  // POST /api/media - Create media entry
  .post("/", adminMiddleware, zValidator("json", createMediaSchema), async (c) => {

    const body = c.req.valid("json");
    const userId = await getSessionUserId(c);
    const { ipAddress, userAgent } = await getIpAndUa(c);

    const item = await prisma.media.create({
      data: body,
    });

    await prisma.auditLog.create({
      data: {
        action: "CREATE",
        entityType: "Media",
        entityId: item.id,
        newValues: toAuditJson(body),
        ipAddress,
        userAgent,
        createdById: userId,
      },
    });

    revalidateTag("media", "max");
    revalidateTag("public-layout-data", "max");

    return created(c, item);
  })

  // PATCH /api/media/:id - Update media
  .patch("/:id", adminMiddleware, zValidator("json", updateMediaSchema), async (c) => {

    const id = c.req.param("id");
    const body = c.req.valid("json");
    const userId = await getSessionUserId(c);
    const { ipAddress, userAgent } = await getIpAndUa(c);

    const existing = await prisma.media.findUnique({ where: { id } });
    if (!existing) {
      return notFound(c, "Media not found");
    }

    const item = await prisma.media.update({
      where: { id },
      data: body,
    });

    await prisma.auditLog.create({
      data: {
        action: "UPDATE",
        entityType: "Media",
        entityId: item.id,
        oldValues: toAuditJson(existing),
        newValues: toAuditJson(body),
        ipAddress,
        userAgent,
        createdById: userId,
      },
    });

    revalidateTag("media", "max");
    revalidateTag("public-layout-data", "max");

    return ok(c, item);
  })

  // DELETE /api/media/:id - Delete media
  .delete("/:id", adminMiddleware, async (c) => {
    const id = c.req.param("id");
    const userId = await getSessionUserId(c);
    const { ipAddress, userAgent } = await getIpAndUa(c);

    const existing = await prisma.media.findUnique({ where: { id } });
    if (!existing) {
      return notFound(c, "Media not found");
    }

    await prisma.media.delete({ where: { id } });

    await prisma.auditLog.create({
      data: {
        action: "DELETE",
        entityType: "Media",
        entityId: id ?? "",
        oldValues: toAuditJson(existing),
        ipAddress: ipAddress ?? undefined,
        userAgent: userAgent ?? undefined,
        createdById: userId ?? undefined,
      },
    });

    revalidateTag("media", "max");
    revalidateTag("public-layout-data", "max");

    return ok(c, { id });
  });

export default media;
