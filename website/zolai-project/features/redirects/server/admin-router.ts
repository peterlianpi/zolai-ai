import { Hono } from "hono";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import prisma from "@/lib/prisma";
import type { RedirectWhereInput } from "@/lib/generated/prisma/models";

const adminRedirectsRouter = new Hono()
  .get(
    "/",
    zValidator("query", z.object({
      enabled: z.string().optional(),
      page: z.string().optional().default("1"),
      limit: z.string().optional().default("20"),
    })),
    async (c) => {
      const { enabled, page, limit } = c.req.valid("query");
      const pageNum = parseInt(page);
      const limitNum = parseInt(limit);
      const skip = (pageNum - 1) * limitNum;

      const where: RedirectWhereInput = {};
      if (enabled === "true") where.enabled = true;
      if (enabled === "false") where.enabled = false;

      const [redirects, total] = await Promise.all([
        prisma.redirect.findMany({
          where,
          skip,
          take: limitNum,
          orderBy: { createdAt: "desc" },
        }),
        prisma.redirect.count({ where }),
      ]);

      return c.json({
        success: true,
        data: {
          redirects: redirects.map(r => ({
            ...r,
            createdAt: r.createdAt.toISOString(),
          })),
          meta: {
            total,
            page: pageNum,
            limit: limitNum,
            totalPages: Math.ceil(total / limitNum),
          },
        },
      });
    },
  );

export default adminRedirectsRouter;
