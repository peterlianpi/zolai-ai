import { Hono } from "hono";
import { revalidateTag } from "next/cache";
import prisma from "@/lib/prisma";
import { getSessionUserId, getIpAndUa } from "@/lib/auth/server-guards";
import { toAuditJson } from "@/lib/audit";
import { ok, notFound } from "@/lib/api/response";

const adminMediaRouter = new Hono()
  .delete("/:id", async (c) => {
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

export default adminMediaRouter;
