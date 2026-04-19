import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { revalidateTag } from "next/cache";
import prisma from "@/lib/prisma";
import { getSessionUserId, getIpAndUa } from "@/lib/auth/server-guards";
import { toAuditJson, adminMiddleware } from "@/lib/audit";
import { lookupRedirect, recordRedirectHit } from "@/features/redirects/server/lookup";
import {
  createRedirectSchema,
  updateRedirectSchema,
  redirectListQuerySchema,
  redirectLookupQuerySchema,
} from "@/features/redirects/schemas";
import { conflict, created, list, notFound, ok, badRequest } from "@/lib/api/response";

const REDIRECTS_CACHE_TAG = "redirects";

const redirectsRouter = new Hono()
  .get("/", adminMiddleware, zValidator("query", redirectListQuerySchema), async (c) => {
    const { page, limit } = c.req.valid("query");
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      prisma.redirect.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.redirect.count(),
    ]);

    return list(c, data, { total, page, limit, totalPages: Math.ceil(total / limit) });
  })
  .post("/", adminMiddleware, zValidator("json", createRedirectSchema), async (c) => {
    try {
      const body = c.req.valid("json");
      const userId = await getSessionUserId(c);
      const { ipAddress, userAgent } = await getIpAndUa(c);

      const redirect = await prisma.redirect.create({ data: body });

      await prisma.auditLog.create({
        data: {
          action: "CREATE",
          entityType: "Redirect",
          entityId: redirect.id,
          newValues: toAuditJson(body),
          ipAddress,
          userAgent,
          createdById: userId,
        },
      });

      revalidateTag(REDIRECTS_CACHE_TAG, "max");
      return created(c, redirect);
    } catch (error) {
      const prismaError = error as { code?: string };
      if (prismaError?.code === "P2002") {
        return conflict(c, "A redirect with this source URL already exists.");
      }
      throw error;
    }
  })
  .patch("/:id", adminMiddleware, zValidator("json", updateRedirectSchema), async (c) => {
    try {
      const id = c.req.param("id");
      const body = c.req.valid("json");
      const userId = await getSessionUserId(c);
      const { ipAddress, userAgent } = await getIpAndUa(c);

      const existing = await prisma.redirect.findUnique({ where: { id } });
      if (!existing) return notFound(c, "Redirect not found");

      const redirect = await prisma.redirect.update({ where: { id }, data: body });

      await prisma.auditLog.create({
        data: {
          action: "UPDATE",
          entityType: "Redirect",
          entityId: redirect.id,
          oldValues: toAuditJson(existing),
          newValues: toAuditJson(body),
          ipAddress,
          userAgent,
          createdById: userId,
        },
      });

      revalidateTag(REDIRECTS_CACHE_TAG, "max");
      return ok(c, redirect);
    } catch (error) {
      const prismaError = error as { code?: string };
      if (prismaError?.code === "P2002") {
        return conflict(c, "A redirect with this source URL already exists.");
      }
      throw error;
    }
  })
  .delete("/:id", adminMiddleware, async (c) => {
    const id = c.req.param("id");
    if (!id) {
      return badRequest(c, "Redirect ID is required");
    }
    
    const userId = await getSessionUserId(c);
    const { ipAddress, userAgent } = await getIpAndUa(c);

    const existing = await prisma.redirect.findUnique({ where: { id } });
    if (!existing) return notFound(c, "Redirect not found");

    await prisma.redirect.delete({ where: { id } });
    await prisma.auditLog.create({
      data: {
        action: "DELETE",
        entityType: "Redirect",
        entityId: id,
        oldValues: toAuditJson(existing),
        ipAddress,
        userAgent,
        createdById: userId,
      },
    });

    revalidateTag(REDIRECTS_CACHE_TAG, "max");
    return ok(c, { id });
  })
  .get("/lookup", zValidator("query", redirectLookupQuerySchema), async (c) => {
    const { url } = c.req.valid("query");
    const redirect = await lookupRedirect(url);

    if (!redirect) return ok(c, null);

    recordRedirectHit(redirect.id);
    return ok(c, redirect);
  });

export default redirectsRouter;
