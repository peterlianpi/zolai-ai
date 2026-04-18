import { Hono } from "hono";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import prisma from "@/lib/prisma";
import { ok, notFound, internalError } from "@/lib/api/response";
import { _getSessionUserId } from "@/lib/auth/server-guards";

const LEVEL_ORDER = ["A1", "A2", "B1", "B2", "C1", "C2"];

const lessons = new Hono()

  // GET /api/lessons/plans?level=A1
  .get(
    "/plans",
    zValidator("query", z.object({ level: z.enum(["A1","A2","B1","B2","C1","C2"]).optional() })),
    async (c) => {
      try {
        const { level } = c.req.valid("query");
        const plans = await prisma.lessonPlan.findMany({
          where: { isActive: true, ...(level && { level }) },
          select: { units: { orderBy: { order: "asc" }, select: { id: true, lessons: { select: { id: true, title: true, type: true, xpReward: true, order: true }, orderBy: { order: "asc" } } } } },
          orderBy: [{ level: "asc" }, { order: "asc" }],
        });
        // Sort by CEFR level order
        plans.sort((a, b) => LEVEL_ORDER.indexOf(a.level) - LEVEL_ORDER.indexOf(b.level));
        return ok(c, plans);
      } catch { return internalError(c, "Failed to fetch lesson plans"); }
    }
  )

  // GET /api/lessons/plans/:slug
  .get("/plans/:slug", async (c) => {
    try {
      const plan = await prisma.lessonPlan.findUnique({
        where: { slug: c.req.param("slug") },
        select: { units: { orderBy: { order: "asc" }, select: { id: true, lessons: { select: { id: true, title: true, type: true, xpReward: true, order: true }, orderBy: { order: "asc" } } } } },
      });
      if (!plan) return notFound(c, "Lesson plan not found");
      return ok(c, plan);
    } catch { return internalError(c, "Failed to fetch lesson plan"); }
  })

  // GET /api/lessons/:id — single lesson with user progress
  .get("/lesson/:id", async (c) => {
    try {
      const lesson = await prisma.lesson.findUnique({ where: { id: c.req.param("id") } });
      if (!lesson) return notFound(c, "Lesson not found");
      return ok(c, lesson);
    } catch { return internalError(c, "Failed to fetch lesson"); }
  })

  // POST /api/lessons/progress — submit lesson attempt
  .post(
    "/progress",
    zValidator("json", z.object({
      lessonId: z.string(),
      score:    z.number().int().min(0).max(100),
      userId:   z.string(),
    })),
    async (c) => {
      try {
        const { lessonId, score, userId } = c.req.valid("json");
        const lesson = await prisma.lesson.findUnique({ where: { id: lessonId }, select: { xpReward: true } });
        if (!lesson) return notFound(c, "Lesson not found");

        const xpEarned = score >= 80 ? lesson.xpReward : Math.floor(lesson.xpReward * score / 100);
        const status = score >= 80 ? (score === 100 ? "MASTERED" : "COMPLETE") : "IN_PROGRESS";

        const progress = await prisma.userLessonProgress.upsert({
          where: { userId_lessonId: { userId, lessonId } },
          create: { userId, lessonId, score, xpEarned, status, attempts: 1, lastAttemptAt: new Date(), ...(status !== "IN_PROGRESS" ? { completedAt: new Date() } : {}) },
          update: { score: { set: score }, xpEarned: { increment: xpEarned }, status, attempts: { increment: 1 }, lastAttemptAt: new Date(), ...(status !== "IN_PROGRESS" ? { completedAt: new Date() } : {}) },
        });

        // Update streak + total XP with proper daily streak tracking
        const now = new Date();
        const todayStart = new Date(now.setHours(0, 0, 0, 0));
        const yesterdayStart = new Date(todayStart.getTime() - 86400000);

        const existing = await prisma.userStreak.findUnique({ where: { userId } });
        let currentStreak = 1;
        if (existing?.lastActivityAt) {
          const last = existing.lastActivityAt;
          if (last >= todayStart) {
            currentStreak = existing.currentStreak; // already active today
          } else if (last >= yesterdayStart) {
            currentStreak = existing.currentStreak + 1; // consecutive day
          }
          // else streak resets to 1
        }

        await prisma.userStreak.upsert({
          where: { userId },
          create: { userId, currentStreak: 1, longestStreak: 1, totalXp: xpEarned, lastActivityAt: new Date() },
          update: {
            currentStreak,
            longestStreak: existing ? Math.max(existing.longestStreak, currentStreak) : currentStreak,
            totalXp: { increment: xpEarned },
            lastActivityAt: new Date(),
          },
        });

        return ok(c, { progress, xpEarned });
      } catch { return internalError(c, "Failed to save progress"); }
    }
  )

  // GET /api/lessons/user/:userId/progress
  .get("/user/:userId/progress", async (c) => {
    try {
      const [progress, streak] = await Promise.all([
        prisma.userLessonProgress.findMany({
          where: { userId: c.req.param("userId") },
          orderBy: { updatedAt: "desc" },
        }),
        prisma.userStreak.findUnique({ where: { userId: c.req.param("userId") } }),
      ]);
      return ok(c, { progress, streak });
    } catch { return internalError(c, "Failed to fetch user progress"); }
  })

  // GET /api/lessons/user/:userId/next — next recommended lesson
  .get("/user/:userId/next", async (c) => {
    try {
      const userId = c.req.param("userId");
      const completed = await prisma.userLessonProgress.findMany({
        where: { userId, status: { in: ["COMPLETE", "MASTERED"] } },
        select: { lessonId: true },
      });
      const completedIds = new Set(completed.map(p => p.lessonId));

      const next = await prisma.lesson.findFirst({
        where: { id: { notIn: [...completedIds] } },
        orderBy: [{ unit: { plan: { order: "asc" } } }, { unit: { order: "asc" } }, { order: "asc" }],
        select: { unit: { select: { plan: { select: { title: true, level: true } } } } },
      });
      return ok(c, next);
    } catch { return internalError(c, "Failed to fetch next lesson"); }
  });

export default lessons;
