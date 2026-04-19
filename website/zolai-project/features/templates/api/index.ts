import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth/server-guards";
import { ok, error as apiError, notFound } from "@/lib/api/response";

const templateSchema = z.object({
  name: z.string().min(1).max(100),
  slug: z.string().min(1).max(100),
  description: z.string().optional(),
  thumbnail: z.string().url().optional(),
  htmlTemplate: z.string().min(1),
  cssTemplate: z.string().optional(),
  slots: z.array(z.string()).default([]),
  featured: z.boolean().default(false),
});

const updateTemplateSchema = templateSchema.partial();

export const templatesRouter = new Hono()
  .get("/", async (c) => {
    const templates = await prisma.pageTemplate.findMany({
      orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        thumbnail: true,
        featured: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: { posts: true },
        },
      },
    });

    return ok(c, templates);
  })
  .get("/:id", async (c) => {
    const { id } = c.req.param();

    const template = await prisma.pageTemplate.findUnique({
      where: { id },
      include: {
        _count: {
          select: { posts: true },
        },
      },
    });

    if (!template) {
      return notFound(c, "Template not found");
    }

    return ok(c, template);
  })
  .post("/", requireAdmin, zValidator("json", templateSchema), async (c) => {
    const data = c.req.valid("json");

    const existing = await prisma.pageTemplate.findFirst({
      where: {
        OR: [{ slug: data.slug }, { name: data.name }],
      },
    });

    if (existing) {
      return apiError(c, "Template with this name or slug already exists", 409);
    }

    const template = await prisma.pageTemplate.create({
      data: {
        ...data,
        slots: data.slots as unknown as never,
      },
    });

    return ok(c, template, 201);
  })
  .patch("/:id", requireAdmin, zValidator("json", updateTemplateSchema), async (c) => {
    const { id } = c.req.param();
    const data = c.req.valid("json");

    const existing = await prisma.pageTemplate.findUnique({
      where: { id },
    });

    if (!existing) {
      return notFound(c, "Template not found");
    }

    if (data.slug || data.name) {
      const conflict = await prisma.pageTemplate.findFirst({
        where: {
          AND: [
            { id: { not: id } },
            {
              OR: [
                ...(data.slug ? [{ slug: data.slug }] : []),
                ...(data.name ? [{ name: data.name }] : []),
              ],
            },
          ],
        },
      });

      if (conflict) {
        return apiError(c, "Template with this name or slug already exists", 409);
      }
    }

    const template = await prisma.pageTemplate.update({
      where: { id },
      data: {
        ...data,
        ...(data.slots && { slots: data.slots as unknown as never }),
      },
    });

    return ok(c, template);
  })
  .delete("/:id", requireAdmin, async (c) => {
    const { id } = c.req.param();

    const existing = await prisma.pageTemplate.findUnique({
      where: { id },
      include: {
        _count: {
          select: { posts: true },
        },
      },
    });

    if (!existing) {
      return notFound(c, "Template not found");
    }

    if (existing._count.posts > 0) {
      return apiError(
        c,
        `Cannot delete template. It is used by ${existing._count.posts} post(s)`,
        409
      );
    }

    await prisma.pageTemplate.delete({
      where: { id },
    });

    return ok(c, { message: "Template deleted successfully" });
  });

export default templatesRouter;
