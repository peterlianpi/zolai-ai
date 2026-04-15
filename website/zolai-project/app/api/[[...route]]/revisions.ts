import { Hono } from "hono";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import prisma from "@/lib/prisma";
import { getSessionUserId } from "@/lib/auth/server-guards";
import { toAuditJson, adminMiddleware } from "@/lib/audit";
import { revalidatePath } from "next/cache";
import { ok, created, list, notFound } from "@/lib/api/response";

const revisionQuerySchema = z.object({
  postId: z.string().min(1, "Post ID is required"),
  page: z.coerce.number().default(1),
  limit: z.coerce.number().default(20),
  includeAutoDrafts: z.coerce.boolean().default(false),
});

const createRevisionSchema = z.object({
  postId: z.string().min(1, "Post ID is required"),
  title: z.string().min(1, "Title is required"),
  contentHtml: z.string(),
  contentRaw: z.string().optional(),
  excerpt: z.string().optional(),
  slug: z.string().optional(),
  isAutoDraft: z.boolean().default(false),
});

const revisions = new Hono()

  .get("/", zValidator("query", revisionQuerySchema), async (c) => {
    const { postId, page, limit, includeAutoDrafts } = c.req.valid("query");
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = { postId };
    if (!includeAutoDrafts) {
      where.isAutoDraft = false;
    }

    const [revisions, total] = await Promise.all([
      prisma.revision.findMany({
        where,
        include: {
          author: { select: { id: true, name: true, email: true } },
        },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.revision.count({ where }),
    ]);

    return list(c, revisions, {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  })

  .get("/:id", async (c) => {
    const id = c.req.param("id");

    const revision = await prisma.revision.findUnique({
      where: { id },
      include: {
        author: { select: { id: true, name: true } },
        post: { select: { id: true, title: true, slug: true, type: true } },
      },
    });

    if (!revision) {
      return notFound(c, "Revision not found");
    }

    return ok(c, revision);
  })

  .post("/", adminMiddleware, zValidator("json", createRevisionSchema), async (c) => {
    const body = c.req.valid("json");
    const userId = await getSessionUserId(c);

    const post = await prisma.post.findUnique({ where: { id: body.postId } });
    if (!post) {
      return notFound(c, "Post not found");
    }

    const revision = await prisma.revision.create({
      data: {
        postId: body.postId,
        title: body.title,
        contentHtml: body.contentHtml,
        contentRaw: body.contentRaw,
        excerpt: body.excerpt,
        slug: body.slug,
        isAutoDraft: body.isAutoDraft,
        authorId: userId ?? "",
      },
    });

    if (!body.isAutoDraft) {
      await prisma.auditLog.create({
        data: {
          action: "CREATE",
          entityType: "Revision",
          entityId: revision.id,
          newValues: toAuditJson({ postId: body.postId, title: body.title }),
          createdById: userId,
        },
      });
    }

    return created(c, revision);
  })

  .post("/:id/restore", adminMiddleware, async (c) => {
    const id = c.req.param("id");
    const userId = await getSessionUserId(c);

    const revision = await prisma.revision.findUnique({
      where: { id },
      include: { post: true },
    });

    if (!revision) {
      return notFound(c, "Revision not found");
    }

    const updatedPost = await prisma.post.update({
      where: { id: revision.postId },
      data: {
        title: revision.title,
        contentHtml: revision.contentHtml,
        excerpt: revision.excerpt,
        slug: revision.slug || revision.post.slug,
      },
    });

    await prisma.auditLog.create({
      data: {
        action: "RESTORE",
        entityType: "Post",
        entityId: updatedPost.id,
        oldValues: toAuditJson({ title: revision.post.title, contentHtml: revision.post.contentHtml }),
        newValues: toAuditJson({ title: revision.title, contentHtml: revision.contentHtml }),
        createdById: userId,
      },
    });

    revalidatePath(`/posts/${updatedPost.slug}`);
    revalidatePath(`/news/${updatedPost.slug}`);
    revalidatePath(`/pages/${updatedPost.slug}`);

    return ok(c, updatedPost);
  })

  .delete("/:id", adminMiddleware, async (c) => {
    const id = c.req.param("id");
    const userId = await getSessionUserId(c);

    const existing = await prisma.revision.findUnique({ where: { id } });
    if (!existing) {
      return notFound(c, "Revision not found");
    }

    await prisma.revision.delete({ where: { id } });

    await prisma.auditLog.create({
      data: {
        action: "DELETE",
        entityType: "Revision",
        entityId: id ?? "unknown",
        oldValues: toAuditJson(existing),
        createdById: userId,
      },
    });

    return ok(c, { id });
  })

  .delete("/post/:postId/autodrafts", adminMiddleware, async (c) => {
    const postId = c.req.param("postId");
    const userId = await getSessionUserId(c);

    const result = await prisma.revision.deleteMany({
      where: { postId, isAutoDraft: true },
    });

    await prisma.auditLog.create({
      data: {
        action: "DELETE",
        entityType: "Revision",
        entityId: `autodrafts-${postId}`,
        newValues: toAuditJson({ deletedCount: result.count }),
        createdById: userId,
      },
    });

    return ok(c, { deletedCount: result.count });
  });

export default revisions;
