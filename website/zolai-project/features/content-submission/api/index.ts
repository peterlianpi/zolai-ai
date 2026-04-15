import { Hono } from "hono";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import prisma from "@/lib/prisma";
import { ResourceType } from "@/lib/generated/prisma";
import { ok, notFound, internalError, created, unauthorized, list } from "@/lib/api/response";
import { requirePermission, getSessionUserId, checkIsAdmin } from "@/lib/auth/server-guards";
import { PERMISSIONS } from "@/lib/auth/rbac";

const contentSubmission = new Hono()

  .get(
    "/submissions",
    zValidator("query", z.object({
      status: z.enum(["DRAFT", "REVIEW", "PUBLISHED", "ARCHIVED"]).optional(),
      limit:  z.coerce.number().int().min(1).max(50).default(10),
      page:   z.coerce.number().int().min(1).default(1),
    })),
    async (c) => {
      const userId = await getSessionUserId(c);
      if (!userId) return unauthorized(c);
      try {
        const { status, limit, page } = c.req.valid("query");
        const session = await requirePermission(c, PERMISSIONS.CONTENT_READ);
        const isAdmin = !(session instanceof Response);
        // Non-admins only see their own submissions
        const where = {
          ...(status && { status }),
          ...(!isAdmin && { authorId: userId }),
        };
        const [submissions, total] = await Promise.all([
          prisma.learningResource.findMany({
            where, orderBy: { createdAt: "desc" },
            skip: (page - 1) * limit, take: limit,
            select: { id: true, slug: true, title: true, description: true, resourceType: true, status: true, createdAt: true, author: { select: { id: true, name: true } } },
          }),
          prisma.learningResource.count({ where }),
        ]);
        return list(c, submissions, { total, page, limit, totalPages: Math.ceil(total / limit) });
      } catch { return internalError(c, "Failed to fetch submissions"); }
    }
  )

  .get("/submissions/:id", async (c) => {
    const userId = await getSessionUserId(c);
    if (!userId) return unauthorized(c);
    try {
      const sub = await prisma.learningResource.findUnique({ where: { id: c.req.param("id") } });
      if (!sub) return notFound(c, "Submission not found");
      const isAdmin = await checkIsAdmin(c);
      if (!isAdmin && sub.authorId !== userId) return unauthorized(c, "Not your submission");
      return ok(c, sub);
    } catch { return internalError(c, "Failed to fetch submission"); }
  })

  .post(
    "/submissions",
    zValidator("json", z.object({
      title:           z.string().min(1).max(200),
      description:     z.string().max(500).default(""),
      content:         z.string().min(10),
      resourceType:    z.nativeEnum(ResourceType),
      category:        z.string().optional(),
      tags:            z.array(z.string()).default([]),
      durationMinutes: z.number().int().min(1).optional(),
    })),
    async (c) => {
      const userId = await getSessionUserId(c);
      if (!userId) return unauthorized(c);
      try {
        const { title, description, content, resourceType, category, tags, durationMinutes } = c.req.valid("json");
        const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") + "-" + Date.now();
        const sub = await prisma.learningResource.create({
          data: { title, description, content, resourceType, status: "DRAFT", category, tags, durationMinutes, authorId: userId, slug, locale: "en" },
        });
        return created(c, sub);
      } catch { return internalError(c, "Failed to create submission"); }
    }
  )

  .post("/submissions/:id/submit-for-review", async (c) => {
    const userId = await getSessionUserId(c);
    if (!userId) return unauthorized(c);
    try {
      const sub = await prisma.learningResource.findUnique({ where: { id: c.req.param("id") } });
      if (!sub) return notFound(c, "Submission not found");
      if (sub.authorId !== userId) return unauthorized(c, "Not your submission");
      const updated = await prisma.learningResource.update({ where: { id: sub.id }, data: { status: "REVIEW" } });
      return ok(c, updated);
    } catch { return internalError(c, "Failed to submit for review"); }
  })

  .post("/submissions/:id/approve", async (c) => {
    if (!await checkIsAdmin(c)) return unauthorized(c, "Admin only");
    try {
      const sub = await prisma.learningResource.findUnique({ where: { id: c.req.param("id") } });
      if (!sub) return notFound(c, "Submission not found");
      const updated = await prisma.learningResource.update({ where: { id: sub.id }, data: { status: "PUBLISHED", publishedAt: new Date() } });
      return ok(c, updated);
    } catch { return internalError(c, "Failed to approve"); }
  })

  .post(
    "/submissions/:id/reject",
    zValidator("json", z.object({ reason: z.string().optional() })),
    async (c) => {
      if (!await checkIsAdmin(c)) return unauthorized(c, "Admin only");
      try {
        const sub = await prisma.learningResource.findUnique({ where: { id: c.req.param("id") } });
        if (!sub) return notFound(c, "Submission not found");
        const updated = await prisma.learningResource.update({ where: { id: sub.id }, data: { status: "ARCHIVED" } });
        return ok(c, updated);
      } catch { return internalError(c, "Failed to reject"); }
    }
  )

  .get("/stats", async (c) => {
    const userId = await getSessionUserId(c);
    if (!userId) return unauthorized(c);
    try {
      const isAdmin = await checkIsAdmin(c);
      const base = isAdmin ? {} : { authorId: userId };
      const [total, review, published] = await Promise.all([
        prisma.learningResource.count({ where: base }),
        prisma.learningResource.count({ where: { ...base, status: "REVIEW" } }),
        prisma.learningResource.count({ where: { ...base, status: "PUBLISHED" } }),
      ]);
      return ok(c, { total, review, published });
    } catch { return internalError(c, "Failed to fetch stats"); }
  });

export default contentSubmission;
