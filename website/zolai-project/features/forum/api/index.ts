import { Hono } from "hono";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import prisma from "@/lib/prisma";
import { ok, notFound, internalError, created, list } from "@/lib/api/response";
import { getSessionUserId } from "@/lib/auth/server-guards";

const FORUM_TYPE = "ARTICLE" as const; // reuse LearningResource with this type for forum posts

function toSlug(title: string) {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") + "-" + Date.now();
}

const forum = new Hono()

  .get(
    "/posts",
    zValidator("query", z.object({
      category: z.string().optional(),
      limit:    z.coerce.number().int().min(1).max(50).default(10),
      page:     z.coerce.number().int().min(1).default(1),
      sort:     z.enum(["latest", "top", "answered"]).default("latest"),
      search:   z.string().optional(),
    })),
    async (c) => {
      try {
        const { category, limit, page, sort, search } = c.req.valid("query");
        const where = {
          resourceType: FORUM_TYPE,
          status: "PUBLISHED" as const,
          ...(category && { category }),
          ...(search && { OR: [
            { title:   { contains: search, mode: "insensitive" as const } },
            { content: { contains: search, mode: "insensitive" as const } },
          ]}),
        };
        const orderBy =
          sort === "top"      ? [{ viewCount: "desc" as const }] :
          sort === "answered" ? [{ answerCount: "desc" as const }] :
                                [{ createdAt: "desc" as const }];

        const [posts, total] = await Promise.all([
          prisma.learningResource.findMany({
            where, orderBy,
            skip: (page - 1) * limit, take: limit,
            select: { id: true, slug: true, title: true, description: true, category: true, tags: true, viewCount: true, answerCount: true, createdAt: true, author: { select: { id: true, name: true, image: true } } },
          }),
          prisma.learningResource.count({ where }),
        ]);
        return list(c, posts, { total, page, limit, totalPages: Math.ceil(total / limit) });
      } catch { return internalError(c, "Failed to fetch posts"); }
    }
  )

  .get("/categories", async (c) => {
    try {
      const rows = await prisma.learningResource.groupBy({
        by: ["category"],
        where: { resourceType: FORUM_TYPE, status: "PUBLISHED", category: { not: null } },
        _count: { id: true },
        orderBy: { _count: { id: "desc" } },
      });
      return ok(c, rows.map(r => ({ category: r.category, count: r._count.id })));
    } catch { return internalError(c, "Failed to fetch categories"); }
  })

  .get("/posts/:slug", async (c) => {
    try {
      const post = await prisma.learningResource.findFirst({
        where: { slug: c.req.param("slug"), resourceType: FORUM_TYPE },
        select: { author: { select: { id: true, name: true, image: true } } },
      });
      if (!post) return notFound(c, "Post not found");
      await prisma.learningResource.update({ where: { id: post.id }, data: { viewCount: { increment: 1 } } });
      return ok(c, post);
    } catch { return internalError(c, "Failed to fetch post"); }
  })

  .post(
    "/posts",
    zValidator("json", z.object({
      title:    z.string().min(1).max(200),
      content:  z.string().min(10),
      category: z.string().default("general"),
      tags:     z.array(z.string()).default([]),
    })),
    async (c) => {
      const userId = await getSessionUserId(c);
      if (!userId) return ok(c, { error: "Unauthorized" });
      try {
        const { title, content, category, tags } = c.req.valid("json");
        const post = await prisma.learningResource.create({
          data: { title, content, description: content.slice(0, 150), resourceType: FORUM_TYPE, status: "PUBLISHED", category, tags, authorId: userId, slug: toSlug(title), locale: "en" },
        });
        return created(c, post);
      } catch { return internalError(c, "Failed to create post"); }
    }
  );

export default forum;
