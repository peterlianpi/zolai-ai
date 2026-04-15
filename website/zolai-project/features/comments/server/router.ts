import { Hono } from "hono";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import prisma from "@/lib/prisma";
import { getSessionUserId, getIpAndUa } from "@/lib/auth/server-guards";
import { toAuditJson, adminMiddleware } from "@/lib/audit";
import { revalidatePath } from "next/cache";
import { ok, created, list, notFound, error } from "@/lib/api/response";
import { safeDbQuery } from "@/lib/server/safe-db";
import { dispatchNotification } from "@/lib/notifications/dispatcher";
import { cachedFetch } from "@/lib/cache";

const commentQuerySchema = z.object({
  postId: z.string().optional(),
  status: z.string().optional(),
  search: z.string().optional(),
  page: z.coerce.number().default(1),
  limit: z.coerce.number().default(20),
});

const createCommentSchema = z.object({
  postId: z.string().min(1, "Post ID is required"),
  parentId: z.string().optional(),
  authorName: z.string().min(1, "Name is required").max(100),
  authorEmail: z.string().email("Invalid email").max(100).optional().or(z.literal("")),
  authorUrl: z.string().url().optional().or(z.literal("")),
  content: z.string().min(1, "Comment content is required").max(10000),
});

const updateCommentSchema = z.object({
  content: z.string().min(1).max(10000).optional(),
  status: z.enum(["APPROVED", "PENDING", "SPAM", "TRASH"]).optional(),
  authorName: z.string().min(1).max(100).optional(),
  authorEmail: z.string().email().max(100).optional(),
  authorUrl: z.string().url().optional().or(z.literal("")).optional(),
});

async function isCommentModerationEnabled(): Promise<boolean> {
  return cachedFetch("settings:comments_moderation", 60_000, async () => {
    const setting = await prisma.siteSetting.findUnique({ where: { key: "comments_moderation" } });
    return setting?.value === "true";
  });
}

async function isGuestPostingEnabled(): Promise<boolean> {
  return cachedFetch("settings:comments_guest_post", 60_000, async () => {
    const setting = await prisma.siteSetting.findUnique({ where: { key: "comments_guest_post" } });
    return setting?.value === "true";
  });
}

function calculateSpamScore(data: { authorName: string; content: string; authorUrl?: string; authorIp?: string }): number {
  let score = 0;
  const contentLower = data.content.toLowerCase();
  const nameLower = data.authorName.toLowerCase();

  if (contentLower.includes("casino") || contentLower.includes("viagra") || contentLower.includes("buy now")) score += 0.3;
  if (contentLower.includes("http://") || contentLower.includes("https://")) {
    const urlCount = (contentLower.match(/https?:\/\//g) || []).length;
    score += Math.min(urlCount * 0.1, 0.4);
  }
  if (data.authorUrl && (data.authorUrl.includes("casino") || data.authorUrl.includes("viagra"))) score += 0.3;
  if (nameLower.includes("casino") || nameLower.includes("viagra") || nameLower.includes("buy")) score += 0.2;
  if (data.content.length > 500 && (data.content.match(/https?:\/\//g) || []).length > 3) score += 0.2;
  if (data.authorIp && data.authorIp.startsWith("0.")) score += 0.1;

  return Math.min(score, 1.0);
}

const comments = new Hono()

  .get("/", zValidator("query", commentQuerySchema), async (c) => {
    const { postId, status, search, page, limit } = c.req.valid("query");
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};
    if (postId) where.postId = postId;
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { authorName: { contains: search } },
        { content: { contains: search } },
        { authorEmail: { contains: search } },
      ];
    }

    const [comments, total] = await safeDbQuery({
      key: "comments-admin-list",
      query: () => Promise.all([
        prisma.comment.findMany({
        where,
        select: {
          id: true,
          postId: true,
          parentId: true,
          authorName: true,
          authorEmail: true,
          authorUrl: true,
          content: true,
          status: true,
          spamScore: true,
          createdAt: true,
          updatedAt: true,
          author: { select: { id: true, name: true, email: true, role: true } },
          post: { select: { id: true, slug: true, type: true, locale: true } },
          parent: { select: { id: true, authorName: true, content: true } },
        },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        }),
        prisma.comment.count({ where }),
      ]),
      fallback: [[], 0],
      timeoutMs: 4000,
      failureThreshold: 3,
      openMs: 10000,
      logLabel: "Comments",
    });

    return list(c, comments, { total, page, limit, totalPages: Math.ceil(total / limit) });
  })

  .get("/stats", async (c) => {
    const [approved, pending, spam, trash, total] = await safeDbQuery({
      key: "comments-admin-stats",
      query: () => Promise.all([
        prisma.comment.count({ where: { status: "APPROVED" } }),
        prisma.comment.count({ where: { status: "PENDING" } }),
        prisma.comment.count({ where: { status: "SPAM" } }),
        prisma.comment.count({ where: { status: "TRASH" } }),
        prisma.comment.count(),
      ]),
      fallback: [0, 0, 0, 0, 0],
      timeoutMs: 3500,
      failureThreshold: 3,
      openMs: 10000,
      logLabel: "Comments",
    });

    return ok(c, { approved, pending, spam, trash, total });
  })

  .get("/post/:postId", zValidator("query", z.object({
    page: z.coerce.number().default(1),
    limit: z.coerce.number().default(20),
  })), async (c) => {
    const postId = c.req.param("postId");
    const { page, limit } = c.req.valid("query");
    const skip = (page - 1) * limit;

    const post = await prisma.post.findUnique({ where: { id: postId } });
    if (!post || post.status !== "PUBLISHED") {
      return notFound(c, "Post not found");
    }

    const where: Record<string, unknown> = { postId, status: "APPROVED" };

    const [comments, total] = await safeDbQuery({
      key: "comments-public-list",
      query: () => Promise.all([
        prisma.comment.findMany({
        where,
        select: {
          id: true,
          postId: true,
          parentId: true,
          authorName: true,
          authorEmail: true,
          content: true,
          status: true,
          createdAt: true,
          updatedAt: true,
          authorUrl: true,
          spamScore: true,
          authorIp: true,
          userAgent: true,
          author: { select: { id: true, name: true } },
          post: { select: { id: true, slug: true, type: true, locale: true } },
          children: {
            where: { status: "APPROVED" },
            select: {
              id: true,
              postId: true,
              parentId: true,
              authorName: true,
              authorEmail: true,
              authorUrl: true,
              content: true,
              status: true,
              spamScore: true,
              createdAt: true,
              updatedAt: true,
              authorIp: true,
              userAgent: true,
              author: { select: { id: true, name: true } },
              post: { select: { id: true, slug: true, type: true, locale: true } },
              parent: { select: { id: true, authorName: true, content: true } },
            },
            orderBy: { createdAt: "asc" },
          },
        },
        skip,
        take: limit,
        orderBy: { createdAt: "asc" },
        }),
        prisma.comment.count({ where }),
      ]),
      fallback: [[], 0],
      timeoutMs: 4000,
      failureThreshold: 3,
      openMs: 10000,
      logLabel: "Comments",
    });

    return list(c, comments, {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      allowComments: post.allowComments,
    });
  })

  .post("/", zValidator("json", createCommentSchema), async (c) => {
    const body = c.req.valid("json");
    const { ipAddress, userAgent } = await getIpAndUa(c);
    const actorUserId = await getSessionUserId(c);

    const post = await prisma.post.findUnique({
      where: { id: body.postId },
      select: { id: true, status: true, allowComments: true, authorId: true, slug: true, title: true },
    });
    if (!post || post.status !== "PUBLISHED") {
      return notFound(c, "Post not found");
    }
    if (!post.allowComments) {
      return error(c, "Comments are disabled for this post", "FORBIDDEN", 403);
    }

    const isGuestEnabled = await isGuestPostingEnabled();
    if (!isGuestEnabled) {
      return error(c, "Guest comments are not allowed. Please log in.", "FORBIDDEN", 403);
    }

    if (body.parentId) {
      const parent = await prisma.comment.findUnique({ where: { id: body.parentId } });
      if (!parent || parent.postId !== body.postId) {
        return notFound(c, "Parent comment not found");
      }
    }

    const spamScore = calculateSpamScore({
      authorName: body.authorName,
      content: body.content,
      authorUrl: body.authorUrl,
      authorIp: ipAddress ?? undefined,
    });

    const isModerationEnabled = await isCommentModerationEnabled();
    const status: "APPROVED" | "PENDING" = isModerationEnabled
      ? "PENDING"
      : "APPROVED";

    const comment = await prisma.comment.create({
      data: {
        postId: body.postId,
        parentId: body.parentId,
        authorName: body.authorName,
        authorEmail: body.authorEmail,
        authorUrl: body.authorUrl || null,
        content: body.content,
        status,
        spamScore,
        authorIp: ipAddress,
        userAgent,
        akismetMeta: { score: spamScore, ip: ipAddress, userAgent },
      },
      select: {
        id: true,
        postId: true,
        parentId: true,
        authorName: true,
        authorEmail: true,
        authorUrl: true,
        content: true,
        status: true,
        spamScore: true,
        createdAt: true,
        updatedAt: true,
        authorIp: true,
        userAgent: true,
        author: { select: { id: true, name: true, email: true, role: true } },
        post: { select: { id: true, slug: true, type: true, locale: true } },
      },
    });

    revalidatePath(`/posts/${post.slug}`);
    revalidatePath(`/news/${post.slug}`);

    await dispatchNotification({
      recipients: [{ userId: post.authorId }],
      title: "New comment on your post",
      description: `${body.authorName} commented on \"${post.title}\"`,
      type: "content",
      action: "comment.created",
      actorUserId: actorUserId ?? undefined,
      actorName: body.authorName,
      entityType: "comment",
      entityId: comment.id,
      link: `/posts/${post.slug}`,
      metadata: { postId: post.id },
      excludeActor: true,
    });

    return created(c, comment);
  })

  .patch("/:id", adminMiddleware, zValidator("json", updateCommentSchema), async (c) => {
    const id = c.req.param("id");
    const body = c.req.valid("json");
    const userId = await getSessionUserId(c);
    const { ipAddress, userAgent } = await getIpAndUa(c);

    const existing = await prisma.comment.findUnique({ where: { id } });
    if (!existing) {
      return notFound(c, "Comment not found");
    }

    const comment = await prisma.comment.update({
      where: { id },
      data: {
        ...body,
        moderatedAt: new Date(),
        moderatedById: userId,
      },
    });

    await prisma.auditLog.create({
      data: {
        action: "UPDATE",
        entityType: "Comment",
        entityId: comment.id,
        oldValues: toAuditJson(existing),
        newValues: toAuditJson(body),
        ipAddress,
        userAgent,
        createdById: userId,
      },
    });

    return ok(c, comment);
  })

  .delete("/:id", adminMiddleware, async (c) => {
    const id = c.req.param("id");
    const userId = await getSessionUserId(c);
    const { ipAddress, userAgent } = await getIpAndUa(c);

    const existing = await prisma.comment.findUnique({ where: { id } });
    if (!existing) {
      return notFound(c, "Comment not found");
    }

    await prisma.comment.delete({ where: { id } });

    await prisma.auditLog.create({
      data: {
        action: "DELETE",
        entityType: "Comment",
        entityId: id ?? "unknown",
        oldValues: toAuditJson(existing),
        ipAddress,
        userAgent,
        createdById: userId,
      },
    });

    return ok(c, { id });
  })

  .post("/bulk-action", adminMiddleware, zValidator("json", z.object({
    action: z.enum(["APPROVED", "SPAM", "TRASH", "DELETE"]),
    ids: z.array(z.string()),
  })), async (c) => {
    const { action, ids } = c.req.valid("json");
    const userId = await getSessionUserId(c);

    if (action === "DELETE") {
      await prisma.comment.deleteMany({ where: { id: { in: ids } } });
    } else {
      await prisma.comment.updateMany({
        where: { id: { in: ids } },
        data: { status: action, moderatedAt: new Date(), moderatedById: userId },
      });
    }

    await prisma.auditLog.create({
      data: {
        action: "UPDATE",
        entityType: "Comment",
        entityId: ids.join(",") || "none",
        newValues: toAuditJson({ action, count: ids.length }),
        createdById: userId,
      },
    });

    return ok(c, { action, count: ids.length });
  });

export default comments;
