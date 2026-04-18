import { Hono } from "hono";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import prisma from "@/lib/prisma";
import { ok, notFound, list } from "@/lib/api/response";
import { revalidateTag } from "next/cache";
import type { Prisma } from "@/lib/generated/prisma/index";
import type { PostType, PostStatus } from "@/lib/generated/prisma/enums";
import { safeDbQuery } from "@/lib/server/safe-db";
import { getSessionFromContext } from "@/lib/auth/server-guards";
import { requireMinRole, forbiddenRoleJson } from "@/lib/auth/server-guards";
import { dispatchNotification } from "@/lib/notifications/dispatcher";

// ============================================
// VALIDATION SCHEMAS
// ============================================

const adminPostsQuerySchema = z.object({
  search: z.string().optional(),
  type: z.string().optional(),
  status: z.string().optional(),
  locale: z.string().optional(),
  orderBy: z.enum(["createdAt", "publishedAt", "title", "modifiedAt"]).optional().default("createdAt"),
  orderDir: z.enum(["asc", "desc"]).optional().default("desc"),
  page: z.string().optional().default("1"),
  limit: z.string().optional().default("20"),
});

// ============================================
// ADMIN CONTENT ROUTER
// ============================================

const adminContent = new Hono()

  .use(async (c, next) => {
    const allowed = await requireMinRole(c, "EDITOR");
    if (!allowed) {
      return forbiddenRoleJson(c);
    }
    await next();
  })

  // GET /api/admin/posts - Get all posts (admin only)
  .get(
    "/posts",
    zValidator("query", adminPostsQuerySchema),
    async (c) => {
      const { search, type, status, locale, orderBy, orderDir, page, limit } = c.req.valid("query");
      const pageNum = parseInt(page);
      const limitNum = parseInt(limit);
      const skip = (pageNum - 1) * limitNum;

      const where: Record<string, unknown> = {};
      if (type && type !== "ALL") where.type = type as PostType;
      if (status && status !== "ALL") where.status = status as PostStatus;
      if (locale && locale !== "ALL") where.locale = locale;
      if (search) {
        where.OR = [
          { title: { contains: search, mode: "insensitive" as const } },
          { slug: { contains: search, mode: "insensitive" as const } },
        ];
      }

      const [posts, total] = await safeDbQuery({
        key: "admin-posts-list",
        query: () =>
          Promise.all([
          prisma.post.findMany({
          where,
          select: {
            id: true,
            title: true,
            slug: true,
            type: true,
            status: true,
            locale: true,
            publishedAt: true,
            createdAt: true,
          },
          skip,
          take: limitNum,
          orderBy: { [orderBy]: orderDir },
          }),
          prisma.post.count({ where }),
          ]),
        fallback: [[], 0],
        timeoutMs: 3500,
        failureThreshold: 3,
        openMs: 10000,
        logLabel: "AdminPosts",
      });

      const serializedPosts = posts.map(p => ({
        ...p,
        publishedAt: p.publishedAt?.toISOString() || null,
        createdAt: p.createdAt.toISOString(),
      }));

      return list(c, serializedPosts, {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      });
    },
  )

  // GET /api/admin/news - Get all news (admin only)
  .get(
    "/news",
    zValidator("query", adminPostsQuerySchema),
    async (c) => {
      const { search, status, locale, orderBy, orderDir, page, limit } = c.req.valid("query");
      const pageNum = parseInt(page);
      const limitNum = parseInt(limit);
      const skip = (pageNum - 1) * limitNum;

      const where: Prisma.PostWhereInput = { type: "NEWS" };
      if (status && status !== "ALL") where.status = status as PostStatus;
      if (locale && locale !== "ALL") where.locale = locale;
      if (search) {
        where.OR = [
          { title: { contains: search, mode: "insensitive" as const } },
          { slug: { contains: search, mode: "insensitive" as const } },
        ];
      }

      const [posts, total] = await safeDbQuery({
        key: "admin-news-list",
        query: () =>
          Promise.all([
          prisma.post.findMany({
          where,
          select: {
            id: true,
            title: true,
            slug: true,
            type: true,
            status: true,
            locale: true,
            publishedAt: true,
            createdAt: true,
          },
          skip,
          take: limitNum,
          orderBy: { [orderBy]: orderDir },
          }),
          prisma.post.count({ where }),
          ]),
        fallback: [[], 0],
        timeoutMs: 3500,
        failureThreshold: 3,
        openMs: 10000,
        logLabel: "AdminNews",
      });

      const serializedPosts = posts.map(p => ({
        ...p,
        publishedAt: p.publishedAt?.toISOString() || null,
        createdAt: p.createdAt.toISOString(),
      }));

      return list(c, serializedPosts, {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      });
    },
  )

  // GET /api/admin/pages - Get all pages (admin only)
  .get(
    "/pages",
    zValidator("query", adminPostsQuerySchema),
    async (c) => {
      const { search, status, locale, orderBy, orderDir, page, limit } = c.req.valid("query");
      const pageNum = parseInt(page);
      const limitNum = parseInt(limit);
      const skip = (pageNum - 1) * limitNum;

      const where: Prisma.PostWhereInput = { type: "PAGE" };
      if (status && status !== "ALL") where.status = status as PostStatus;
      if (locale && locale !== "ALL") where.locale = locale;
      if (search) {
        where.OR = [
          { title: { contains: search, mode: "insensitive" as const } },
          { slug: { contains: search, mode: "insensitive" as const } },
        ];
      }

      const [posts, total] = await safeDbQuery({
        key: "admin-pages-list",
        query: () =>
          Promise.all([
          prisma.post.findMany({
          where,
          select: {
            id: true,
            title: true,
            slug: true,
            type: true,
            status: true,
            locale: true,
            publishedAt: true,
            createdAt: true,
            menuOrder: true,
          },
          skip,
          take: limitNum,
          orderBy: orderBy === "title"
            ? { title: orderDir }
            : orderBy === "publishedAt"
              ? { publishedAt: orderDir }
              : orderBy === "modifiedAt"
                ? { modifiedAt: orderDir }
                : { menuOrder: orderDir },
          }),
          prisma.post.count({ where }),
          ]),
        fallback: [[], 0],
        timeoutMs: 3500,
        failureThreshold: 3,
        openMs: 10000,
        logLabel: "AdminPages",
      });

      const serializedPosts = posts.map(p => ({
        ...p,
        publishedAt: p.publishedAt?.toISOString() || null,
        createdAt: p.createdAt.toISOString(),
      }));

      return list(c, serializedPosts, {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      });
    },
  )

  // POST /api/admin/posts/:id/publish - Publish a post
  .post("/posts/:id/publish", async (c) => {
    const id = c.req.param("id");
    const session = await getSessionFromContext(c);
    const post = await prisma.post.findUnique({
      where: { id },
      select: { id: true, slug: true, title: true, authorId: true },
    });
    if (!post) {
      return notFound(c, "Post not found");
    }

    await prisma.post.update({
      where: { id },
      data: { status: "PUBLISHED", publishedAt: new Date() },
    });

    revalidateTag("content", "max");
    revalidateTag("home-page-data", "max");

    await dispatchNotification({
      recipients: [{ userId: post.authorId }],
      title: "Post published",
      description: `Your post "${post.title}" has been published.`,
      type: "content",
      action: "post.published",
      actorUserId: session?.user?.id,
      actorName: session?.user?.name,
      entityType: "post",
      entityId: post.id,
      link: "/posts/" + post.slug,
      excludeActor: false,
    });

    return ok(c, { id });
  })

  // POST /api/admin/posts/:id/unpublish - Unpublish a post
  .post("/posts/:id/unpublish", async (c) => {
    const id = c.req.param("id");
    await prisma.post.update({
      where: { id },
      data: { status: "DRAFT", publishedAt: null },
    });

    revalidateTag("content", "max");
    revalidateTag("home-page-data", "max");

    return ok(c, { id });
  })

  // DELETE /api/admin/posts/:id - Delete a post
  .delete("/posts/:id", async (c) => {
    const id = c.req.param("id");
    await prisma.post.delete({ where: { id } });

    revalidateTag("content", "max");
    revalidateTag("home-page-data", "max");

    return ok(c, { id });
  });

export default adminContent;
