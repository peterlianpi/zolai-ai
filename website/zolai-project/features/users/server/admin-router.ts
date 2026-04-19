import prisma from "@/lib/prisma";
import { Hono } from "hono";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import { ok, notFound, list, unauthorized } from "@/lib/api/response";
import { checkIsSuperAdmin } from "@/lib/auth/server-guards";

const adminUsersQuerySchema = z.object({
  search: z.string().optional(),
  role:   z.string().optional(),
  page:   z.string().optional().default("1"),
  limit:  z.string().optional().default("10"),
});

const adminRouter = new Hono()
  .get(
    "/",
    zValidator("query", adminUsersQuerySchema),
    async (c) => {
      const { search, role, page, limit } = c.req.valid("query");
      const pageNum = parseInt(page);
      const limitNum = parseInt(limit);
      const skip = (pageNum - 1) * limitNum;

      const where = {
        ...(search && { OR: [
          { name: { contains: search, mode: "insensitive" as const } },
          { email: { contains: search, mode: "insensitive" as const } },
        ]}),
        ...(role && { role: role as never }),
      };

      const [users, total] = await Promise.all([
        prisma.user.findMany({
          where,
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            banned: true,
            emailVerified: true,
            createdAt: true,
          },
          skip,
          take: limitNum,
          orderBy: { createdAt: "desc" },
        }),
        prisma.user.count({ where }),
      ]);

      return list(c, users, {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      });
    },
  )

  .patch(
    "/:id/role",
    zValidator("json", z.object({ role: z.string().min(1) })),
    async (c) => {
      if (!await checkIsSuperAdmin(c)) return unauthorized(c, "Super admin only");
      const { role } = c.req.valid("json");
      const user = await prisma.user.update({
        where: { id: c.req.param("id") },
        data: { role: role as never },
        select: { id: true, role: true },
      });
      return ok(c, user);
    }
  )

  .post("/:id/ban", async (c) => {
    if (!await checkIsSuperAdmin(c)) return unauthorized(c, "Super admin only");
    const id = c.req.param("id");
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      return notFound(c, "User not found");
    }

    await prisma.user.update({
      where: { id },
      data: { banned: true, banReason: "Banned by admin" },
    });

    return ok(c, { id });
  })

  .post("/:id/unban", async (c) => {
    if (!await checkIsSuperAdmin(c)) return unauthorized(c, "Super admin only");
    const id = c.req.param("id");
    await prisma.user.update({
      where: { id },
      data: { banned: false, banReason: null },
    });

    return ok(c, { id });
  })

  .delete("/:id", async (c) => {
    if (!await checkIsSuperAdmin(c)) return unauthorized(c, "Super admin only");
    const id = c.req.param("id");
    await prisma.user.delete({ where: { id } });
    return ok(c, { id });
  });

export default adminRouter;
