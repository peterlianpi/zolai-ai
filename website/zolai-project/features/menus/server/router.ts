import { Hono } from "hono";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import { revalidateTag } from "next/cache";
import prisma from "@/lib/prisma";
import { getSessionUserId, getIpAndUa } from "@/lib/auth/server-guards";
import { toAuditJson, adminMiddleware } from "@/lib/audit";
import { created, notFound, ok } from "@/lib/api/response";
import {
  PUBLIC_LAYOUT_CACHE_TAG,
} from "@/features/settings/server/constants";

const MENUS_CACHE_TAG = "menus";

const menuQuerySchema = z.object({
  location: z.string().optional(),
});

const createMenuSchema = z.object({
  name: z.string().min(1, "Menu name is required").max(100),
  slug: z.string().min(1).max(100).regex(/^[a-z0-9-]+$/, "Slug must be lowercase alphanumeric with hyphens"),
  location: z.string().max(50).optional(),
  description: z.string().max(500).optional(),
});

const updateMenuSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  location: z.string().max(50).optional(),
  description: z.string().max(500).optional(),
});

const createMenuItemSchema = z.object({
  menuId: z.string().min(1, "Menu ID is required"),
  parentId: z.string().optional(),
  label: z.string().min(1, "Label is required").max(100),
  url: z.string().url().optional().or(z.literal("")),
  postId: z.string().optional(),
  target: z.enum(["_blank", "_self"]).optional(),
  classes: z.string().max(200).optional(),
  order: z.number().int().default(0),
});

const updateMenuItemSchema = z.object({
  label: z.string().min(1).max(100).optional(),
  url: z.string().url().optional().or(z.literal("")).optional(),
  postId: z.string().optional().nullable(),
  target: z.enum(["_blank", "_self"]).optional(),
  classes: z.string().max(200).optional(),
  order: z.number().int().optional(),
  parentId: z.string().optional().nullable(),
});

const reorderItemsSchema = z.object({
  items: z.array(
    z.object({
      id: z.string(),
      order: z.number().int(),
      parentId: z.string().nullable(),
    }),
  ),
});

function revalidateMenuCaches() {
  revalidateTag(MENUS_CACHE_TAG, "max");
  revalidateTag(PUBLIC_LAYOUT_CACHE_TAG, "max");
}

const menusRouter = new Hono()
  .get("/", zValidator("query", menuQuerySchema), async (c) => {
    const { location } = c.req.valid("query");
    const where: Record<string, unknown> = {};
    if (location) where.location = location;

    const menus = await prisma.menu.findMany({
      where,
      select: {
        id: true,
        name: true,
        slug: true,
        location: true,
        items: {
          where: { parentId: null },
          orderBy: { order: "asc" },
          select: {
            id: true,
            label: true,
            url: true,
            target: true,
            classes: true,
            order: true,
            children: { orderBy: { order: "asc" }, select: { id: true, label: true, url: true, target: true, classes: true, order: true } },
          },
        },
      },
      orderBy: { name: "asc" },
    });

    return ok(c, menus);
  })
  .get("/public", async (c) => {
    const menus = await prisma.menu.findMany({
      where: { location: { not: null } },
      select: {
        id: true,
        name: true,
        slug: true,
        location: true,
        items: {
          where: { parentId: null },
          select: {
            id: true,
            label: true,
            url: true,
            target: true,
            classes: true,
            order: true,
            children: {
              select: {
                id: true,
                label: true,
                url: true,
                target: true,
                classes: true,
                order: true,
              },
              orderBy: { order: "asc" },
            },
          },
          orderBy: { order: "asc" },
        },
      },
      orderBy: { name: "asc" },
    });

    c.header("Cache-Control", "public, s-maxage=60, stale-while-revalidate=300");

    return ok(c, menus);
  })
  .get("/:id", async (c) => {
    const id = c.req.param("id");
    const menu = await prisma.menu.findUnique({
      where: { id },
      select: { id: true, name: true, slug: true, location: true, items: { orderBy: { order: "asc" }, select: { id: true, label: true, url: true, target: true, classes: true, order: true, parentId: true } } },
    });

    if (!menu) return notFound(c, "Menu not found");
    return ok(c, menu);
  })
  .post("/", adminMiddleware, zValidator("json", createMenuSchema), async (c) => {
    const body = c.req.valid("json");
    const userId = await getSessionUserId(c);
    const { ipAddress, userAgent } = await getIpAndUa(c);
    const menu = await prisma.menu.create({ data: body });

    await prisma.auditLog.create({
      data: {
        action: "CREATE",
        entityType: "Menu",
        entityId: menu.id,
        newValues: toAuditJson(body),
        ipAddress,
        userAgent,
        createdById: userId,
      },
    });

    revalidateMenuCaches();
    return created(c, menu);
  })
  .patch("/:id", adminMiddleware, zValidator("json", updateMenuSchema), async (c) => {
    const id = c.req.param("id");
    const body = c.req.valid("json");
    const userId = await getSessionUserId(c);
    const { ipAddress, userAgent } = await getIpAndUa(c);
    const existing = await prisma.menu.findUnique({ where: { id } });
    if (!existing) return notFound(c, "Menu not found");

    const menu = await prisma.menu.update({ where: { id }, data: body });
    await prisma.auditLog.create({
      data: {
        action: "UPDATE",
        entityType: "Menu",
        entityId: menu.id,
        oldValues: toAuditJson(existing),
        newValues: toAuditJson(body),
        ipAddress,
        userAgent,
        createdById: userId,
      },
    });

    revalidateMenuCaches();
    return ok(c, menu);
  })
  .delete("/:id", adminMiddleware, async (c) => {
    const id = c.req.param("id");
    const userId = await getSessionUserId(c);
    const { ipAddress, userAgent } = await getIpAndUa(c);
    const existing = await prisma.menu.findUnique({ where: { id } });
    if (!existing) return notFound(c, "Menu not found");

    await prisma.menu.delete({ where: { id } });
    await prisma.auditLog.create({
      data: {
        action: "DELETE",
        entityType: "Menu",
        entityId: id ?? "unknown",
        oldValues: toAuditJson(existing),
        ipAddress,
        userAgent,
        createdById: userId,
      },
    });

    revalidateMenuCaches();
    return ok(c, { id });
  })
  .post("/items", adminMiddleware, zValidator("json", createMenuItemSchema), async (c) => {
    const body = c.req.valid("json");
    const userId = await getSessionUserId(c);
    const menu = await prisma.menu.findUnique({ where: { id: body.menuId } });
    if (!menu) return notFound(c, "Menu not found");

    const item = await prisma.menuItem.create({ data: body });
    await prisma.auditLog.create({
      data: {
        action: "CREATE",
        entityType: "MenuItem",
        entityId: item.id,
        newValues: toAuditJson(body),
        createdById: userId,
      },
    });

    revalidateMenuCaches();
    return created(c, item);
  })
  .patch("/items/:id", adminMiddleware, zValidator("json", updateMenuItemSchema), async (c) => {
    const id = c.req.param("id");
    const body = c.req.valid("json");
    const userId = await getSessionUserId(c);
    const existing = await prisma.menuItem.findUnique({ where: { id } });
    if (!existing) return notFound(c, "Menu item not found");

    const item = await prisma.menuItem.update({ where: { id }, data: body });
    await prisma.auditLog.create({
      data: {
        action: "UPDATE",
        entityType: "MenuItem",
        entityId: item.id,
        oldValues: toAuditJson(existing),
        newValues: toAuditJson(body),
        createdById: userId,
      },
    });

    revalidateMenuCaches();
    return ok(c, item);
  })
  .delete("/items/:id", adminMiddleware, async (c) => {
    const id = c.req.param("id");
    const userId = await getSessionUserId(c);
    const existing = await prisma.menuItem.findUnique({ where: { id } });
    if (!existing) return notFound(c, "Menu item not found");

    await prisma.menuItem.delete({ where: { id } });
    await prisma.auditLog.create({
      data: {
        action: "DELETE",
        entityType: "MenuItem",
        entityId: id ?? "unknown",
        oldValues: toAuditJson(existing),
        createdById: userId,
      },
    });

    revalidateMenuCaches();
    return ok(c, { id });
  })
  .post("/items/reorder", adminMiddleware, zValidator("json", reorderItemsSchema), async (c) => {
    const { items } = c.req.valid("json");
    const userId = await getSessionUserId(c);

    await prisma.$transaction(
      items.map((item) =>
        prisma.menuItem.update({
          where: { id: item.id },
          data: { order: item.order, parentId: item.parentId },
        }),
      ),
    );

    await prisma.auditLog.create({
      data: {
        action: "UPDATE",
        entityType: "Menu",
        entityId: "reorder",
        newValues: toAuditJson({ count: items.length }),
        createdById: userId,
      },
    });

    revalidateMenuCaches();
    return ok(c, { count: items.length });
  });

export default menusRouter;
