import { Hono } from "hono";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import prisma from "@/lib/prisma";
import { ok, notFound, internalError, list, unauthorized } from "@/lib/api/response";
import { getSessionUserId } from "@/lib/auth/server-guards";
import { DifficultyLevel, ResourceType } from "@/lib/generated/prisma";
import type { Prisma } from "@/lib/generated/prisma";

const lessonSelect = {
  id: true, slug: true, title: true, description: true,
  resourceType: true, difficultyLevel: true, viewCount: true,
  completionCount: true, rating: true, ratingCount: true,
  durationMinutes: true, isFeatured: true, createdAt: true,
} satisfies Prisma.LearningResourceSelect;

const grammar = new Hono()

  .get(
    "/lessons",
    zValidator("query", z.object({
      difficulty:   z.nativeEnum(DifficultyLevel).optional(),
      resourceType: z.nativeEnum(ResourceType).optional(),
      limit:        z.coerce.number().int().min(1).max(50).default(10),
      page:         z.coerce.number().int().min(1).default(1),
      search:       z.string().optional(),
    })),
    async (c) => {
      try {
        const { difficulty, resourceType, limit, page, search } = c.req.valid("query");
        const where: Prisma.LearningResourceWhereInput = {
          status: "PUBLISHED",
          ...(difficulty   && { difficultyLevel: difficulty }),
          ...(resourceType && { resourceType }),
          ...(search && { OR: [
            { title:       { contains: search, mode: "insensitive" } },
            { description: { contains: search, mode: "insensitive" } },
          ]}),
        };
        const [lessons, total] = await Promise.all([
          prisma.learningResource.findMany({
            where, select: lessonSelect,
            orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
            skip: (page - 1) * limit, take: limit,
          }),
          prisma.learningResource.count({ where }),
        ]);
        return list(c, lessons, { total, page, limit, totalPages: Math.ceil(total / limit) });
      } catch {
        return internalError(c, "Failed to fetch grammar lessons");
      }
    }
  )

  .get("/lessons/:slug", async (c) => {
    try {
      const lesson = await prisma.learningResource.findFirst({
        where: { slug: c.req.param("slug") },
        select: {
          ...lessonSelect,
          content: true, isPremium: true, prerequisites: true,
          tags: true, updatedAt: true,
          author: { select: { id: true, name: true, image: true } },
        },
      });
      if (!lesson) return notFound(c, "Lesson not found");
      await prisma.learningResource.update({
        where: { id: lesson.id }, data: { viewCount: { increment: 1 } },
      });
      return ok(c, { lesson });
    } catch {
      return internalError(c, "Failed to fetch lesson");
    }
  })

  .post("/lessons/:slug/complete", async (c) => {
    const sessionUserId = await getSessionUserId(c);
    if (!sessionUserId) return unauthorized(c);
    try {
      const lesson = await prisma.learningResource.findFirst({
        where: { slug: c.req.param("slug") },
      });
      if (!lesson) return notFound(c, "Lesson not found");
      await prisma.learningResource.update({
        where: { id: lesson.id }, data: { completionCount: { increment: 1 } },
      });
      return ok(c, { message: "Lesson marked as complete" });
    } catch {
      return internalError(c, "Failed to mark lesson as complete");
    }
  })

  .get("/topics", async (c) => {
    try {
      const rows = await prisma.learningResource.findMany({
        where: { status: "PUBLISHED", resourceType: "GRAMMAR" },
        select: { tags: true },
      });
      const topics = [...new Set(rows.flatMap(r => r.tags ?? []))].sort();
      return ok(c, { topics });
    } catch {
      return internalError(c, "Failed to fetch grammar topics");
    }
  });

export default grammar;
