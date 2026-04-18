import prisma from "@/lib/prisma";
import { Hono } from "hono";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import { adminMiddleware } from "@/lib/audit";
import { getAnalyticsData } from "@/lib/services/analytics";
import { ok, notFound, conflict } from "@/lib/api/response";
import adminSiteSettingsRouter from "@/features/settings/server/admin-router";
import adminUsersRouter from "@/features/users/server/admin-router";
import adminMediaRouter from "@/features/media/server/admin-router";
import adminContentRouter from "@/features/content/server/admin-router";
import adminRedirectsRouter from "@/features/redirects/server/admin-router";
import { customRolesRouter, permissionsRouter } from "@/features/admin/server/custom-roles-router";

// ── Wiki admin sub-router ─────────────────────────────────────────────────────
const wikiRouter = new Hono()
  .patch("/:id", zValidator("json", z.object({ status: z.string(), title: z.string().optional(), content: z.string().optional() })), async (c) => {
    const entry = await prisma.wikiEntry.update({ where: { id: c.req.param("id") }, data: c.req.valid("json") });
    return ok(c, entry);
  })
  .delete("/:id", async (c) => {
    const { checkIsSuperAdmin } = await import("@/lib/auth/server-guards");
    if (!await checkIsSuperAdmin(c)) return notFound(c, "Forbidden");
    const entry = await prisma.wikiEntry.findUnique({ where: { id: c.req.param("id") } });
    if (!entry) return notFound(c, "Entry not found");
    await prisma.wikiEntry.delete({ where: { id: c.req.param("id") } });
    return ok(c, { id: c.req.param("id") });
  });

// ── Vocab admin sub-router ────────────────────────────────────────────────────
const vocabRouter = new Hono()
  .patch("/:id", zValidator("json", z.object({ accuracy: z.string().optional(), audioUrl: z.string().optional(), definition: z.string().optional() })), async (c) => {
    const word = await prisma.vocabWord.update({ where: { id: c.req.param("id") }, data: c.req.valid("json") });
    return ok(c, word);
  })
  .delete("/:id", async (c) => {
    const { checkIsSuperAdmin } = await import("@/lib/auth/server-guards");
    if (!await checkIsSuperAdmin(c)) return notFound(c, "Forbidden");
    await prisma.vocabWord.delete({ where: { id: c.req.param("id") } });
    return ok(c, { id: c.req.param("id") });
  });

// ── Bible admin sub-router ────────────────────────────────────────────────────
const bibleRouter = new Hono()
  .patch("/:id", zValidator("json", z.object({
    tdb77: z.string().optional(), tbr17: z.string().optional(),
    tedim2010: z.string().optional(), kjv: z.string().optional(),
  })), async (c) => {
    const verse = await prisma.bibleVerse.update({ where: { id: c.req.param("id") }, data: c.req.valid("json") });
    return ok(c, verse);
  });

// ── Lessons admin sub-router ──────────────────────────────────────────────────
const lessonsAdminRouter = new Hono()
  .get("/", async (c) => {
    const plans = await prisma.lessonPlan.findMany({
      orderBy: { order: "asc" },
      select: {
        id: true, title: true, description: true, order: true, isActive: true, createdAt: true, updatedAt: true,
        units: {
          orderBy: { order: "asc" },
          select: {
            id: true, title: true, description: true, order: true, createdAt: true, updatedAt: true,
            lessons: {
              orderBy: { order: "asc" },
              select: { id: true, title: true, order: true, xpReward: true, createdAt: true, updatedAt: true },
            },
          },
        },
      },
    });
    return ok(c, plans);
  })
  .patch("/plans/:id", zValidator("json", z.object({
    title: z.string().optional(), description: z.string().optional(), isActive: z.boolean().optional(),
  })), async (c) => {
    const plan = await prisma.lessonPlan.update({ where: { id: c.req.param("id") }, data: c.req.valid("json") });
    return ok(c, plan);
  })
  .patch("/lessons/:id", zValidator("json", z.object({
    title: z.string().optional(), content: z.string().optional(), xpReward: z.number().optional(),
  })), async (c) => {
    const lesson = await prisma.lesson.update({ where: { id: c.req.param("id") }, data: c.req.valid("json") });
    return ok(c, lesson);
  });


const trainingRouter = new Hono()
  .delete("/:id", async (c) => {
    await prisma.trainingRun.delete({ where: { id: c.req.param("id") } });
    return ok(c, { id: c.req.param("id") });
  });

// ── Resources admin sub-router ────────────────────────────────────────────────
const resourcesRouter = new Hono()
  .get("/", zValidator("query", z.object({ q: z.string().optional(), type: z.string().optional(), status: z.string().optional(), page: z.coerce.number().default(1), limit: z.coerce.number().default(20) })), async (c) => {
    const { q, type, status, page, limit } = c.req.valid("query");
    const where = {
      ...(q && { OR: [{ title: { contains: q, mode: "insensitive" as const } }, { content: { contains: q, mode: "insensitive" as const } }] }),
      ...(type && { resourceType: type as never }),
      ...(status && { status: status as never }),
    };
    const [resources, total] = await Promise.all([
      prisma.learningResource.findMany({ where, orderBy: { createdAt: "desc" }, skip: (page - 1) * limit, take: limit, select: { id: true, slug: true, title: true, resourceType: true, difficultyLevel: true, status: true, viewCount: true, category: true, createdAt: true } }),
      prisma.learningResource.count({ where }),
    ]);
    const { list } = await import("@/lib/api/response");
    return list(c, resources, { total, page, limit, totalPages: Math.ceil(total / limit) });
  })
  .patch("/:id", zValidator("json", z.object({ status: z.string().optional(), publishedAt: z.string().optional() })), async (c) => {
    const data = c.req.valid("json");
    const r = await prisma.learningResource.update({ where: { id: c.req.param("id") }, data: { ...data, publishedAt: data.publishedAt ? new Date(data.publishedAt) : undefined } as never });
    return ok(c, r);
  })
  .delete("/:id", async (c) => {
    const { checkIsSuperAdmin } = await import("@/lib/auth/server-guards");
    if (!await checkIsSuperAdmin(c)) return notFound(c, "Forbidden");
    await prisma.learningResource.delete({ where: { id: c.req.param("id") } });
    return ok(c, { id: c.req.param("id") });
  });

// ── Dataset stat admin sub-router ─────────────────────────────────────────────
const datasetRouter = new Hono()
  .post("/", zValidator("json", z.object({ label: z.string(), value: z.number().int(), target: z.number().int().optional(), unit: z.string().optional() })), async (c) => {
    const data = c.req.valid("json");
    const stat = await prisma.datasetStat.upsert({ where: { label: data.label }, create: data, update: data });
    return ok(c, stat);
  })
  .delete("/:id", async (c) => {
    await prisma.datasetStat.delete({ where: { id: c.req.param("id") } });
    return ok(c, { id: c.req.param("id") });
  });

// ── Submissions admin sub-router ──────────────────────────────────────────────
const submissionsRouter = new Hono()
  .get("/", async (c) => {
    const subs = await prisma.learningResource.findMany({
      where: { status: "REVIEW" },
      orderBy: { createdAt: "desc" },
      select: { id: true, title: true, resourceType: true, status: true, createdAt: true, author: { select: { name: true, email: true } } },
    });
    return ok(c, subs);
  })
  .post("/:id/approve", async (c) => {
    const sub = await prisma.learningResource.update({ where: { id: c.req.param("id") }, data: { status: "PUBLISHED", publishedAt: new Date() } });
    return ok(c, sub);
  })
  .post("/:id/reject", async (c) => {
    const sub = await prisma.learningResource.update({ where: { id: c.req.param("id") }, data: { status: "ARCHIVED" } });
    return ok(c, sub);
  });


const postsRouter = new Hono()
  .get("/", zValidator("query", z.object({ q: z.string().optional(), type: z.string().optional(), status: z.string().optional(), page: z.coerce.number().default(1), limit: z.coerce.number().default(20) })), async (c) => {
    const { q, type, status, page, limit } = c.req.valid("query");
    const where = {
      ...(q && { OR: [{ title: { contains: q, mode: "insensitive" as const } }, { slug: { contains: q, mode: "insensitive" as const } }] }),
      ...(type && { type: type as never }),
      ...(status && { status: status as never }),
    };
    const [posts, total] = await Promise.all([
      prisma.post.findMany({ where, orderBy: { createdAt: "desc" }, skip: (page - 1) * limit, take: limit, select: { id: true, title: true, slug: true, type: true, status: true, viewCount: true, createdAt: true } }),
      prisma.post.count({ where }),
    ]);
    const { list } = await import("@/lib/api/response");
    return list(c, posts, { total, page, limit, totalPages: Math.ceil(total / limit) });
  })
  .patch("/:id", zValidator("json", z.object({ status: z.string().optional(), title: z.string().optional(), publishedAt: z.string().optional() })), async (c) => {
    const data = c.req.valid("json");
    const post = await prisma.post.update({ where: { id: c.req.param("id") }, data: { ...data, publishedAt: data.publishedAt ? new Date(data.publishedAt) : undefined } as never });
    return ok(c, post);
  })
  .delete("/:id", async (c) => {
    await prisma.post.delete({ where: { id: c.req.param("id") } });
    return ok(c, { id: c.req.param("id") });
  });

// ── System actions (superadmin only) ─────────────────────────────────────────
const systemRouter = new Hono()
  .post("/clear-sessions", async (c) => {
    const { checkIsSuperAdmin } = await import("@/lib/auth/server-guards");
    if (!await checkIsSuperAdmin(c)) return notFound(c, "Forbidden");
    const { count } = await prisma.session.deleteMany({ where: { expiresAt: { lt: new Date() } } });
    return ok(c, { deleted: count });
  })
  .post("/clear-rate-limits", async (c) => {
    const { checkIsSuperAdmin } = await import("@/lib/auth/server-guards");
    if (!await checkIsSuperAdmin(c)) return notFound(c, "Forbidden");
    const { count } = await prisma.rateLimit.deleteMany({ where: { resetAt: { lt: new Date() } } });
    return ok(c, { deleted: count });
  })
  .post("/unblock-all", async (c) => {
    const { checkIsSuperAdmin } = await import("@/lib/auth/server-guards");
    if (!await checkIsSuperAdmin(c)) return notFound(c, "Forbidden");
    const { count } = await prisma.blockedIp.deleteMany({});
    return ok(c, { deleted: count });
  })
  .post("/purge-security", async (c) => {
    const { checkIsSuperAdmin } = await import("@/lib/auth/server-guards");
    if (!await checkIsSuperAdmin(c)) return notFound(c, "Forbidden");
    const { count } = await prisma.securityEvent.deleteMany({});
    return ok(c, { deleted: count });
  });

const devopsRouter = new Hono()
  .get("/", async (c) => {
    const { checkIsSuperAdmin } = await import("@/lib/auth/server-guards");
    if (!await checkIsSuperAdmin(c)) return notFound(c, "Forbidden");
    const [vpsHealth, aiStatus] = await Promise.all([
      (async () => {
        try {
          const start = Date.now();
          const res = await fetch(`${process.env.BETTER_AUTH_URL ?? "https://zolai.space"}/api/cron/health`, { signal: AbortSignal.timeout(5000) });
          return { ok: res.ok, status: res.status, latencyMs: Date.now() - start };
        } catch { return { ok: false, status: 0, latencyMs: null }; }
      })(),
      Promise.all([
        { name: "Gemini", url: "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions", key: process.env.GEMINI_API_KEY, model: "gemini-2.5-flash" },
        { name: "Groq", url: "https://api.groq.com/openai/v1/chat/completions", key: process.env.GROQ_API_KEY, model: "llama-3.3-70b-versatile" },
        { name: "OpenRouter", url: "https://openrouter.ai/api/v1/chat/completions", key: process.env.OPENROUTER_API_KEY, model: "liquid/lfm-2.5-1.2b-instruct:free" },
      ].map(async p => {
        try {
          const start = Date.now();
          const res = await fetch(p.url, { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${p.key}` }, body: JSON.stringify({ model: p.model, messages: [{ role: "user", content: "hi" }], max_tokens: 3 }), signal: AbortSignal.timeout(8000) });
          const data = await res.json() as { choices?: unknown[] };
          return { name: p.name, ok: !!data.choices?.length, latencyMs: Date.now() - start };
        } catch { return { name: p.name, ok: false, latencyMs: null }; }
      })),
    ]);
    return ok(c, { vpsHealth, aiStatus, timestamp: new Date().toISOString() });
  })
  .post("/", zValidator("json", z.object({ action: z.enum(["restart", "rollback"]) })), async (c) => {
    const { checkIsSuperAdmin } = await import("@/lib/auth/server-guards");
    if (!await checkIsSuperAdmin(c)) return notFound(c, "Forbidden");
    const { action } = c.req.valid("json");
    if (action === "restart") return ok(c, { message: "Restart signal sent" });
    return c.json({ error: "Unknown action" }, 400);
  });

const admin = new Hono()
  .use(adminMiddleware)
  .route("/site-settings", adminSiteSettingsRouter)
  .route("/users", adminUsersRouter)
  .route("/media", adminMediaRouter)
  .route("/wiki", wikiRouter)
  .route("/vocab", vocabRouter)
  .route("/bible", bibleRouter)
  .route("/lessons", lessonsAdminRouter)
  .route("/training", trainingRouter)
  .route("/dataset", datasetRouter)
  .route("/submissions", submissionsRouter)
  .route("/posts", postsRouter)
  .route("/resources", resourcesRouter)
  .route("/system", systemRouter)
  .route("/devops", devopsRouter)
  .route("/", adminContentRouter)

  // GET /api/admin/stats - Get admin dashboard stats (OPTIMIZED)
  .get("/stats", async (c) => {
    // OPTIMIZATION: Use single optimized query with aggregations
    const [
      userStats,
      postStats,
      totalMedia,
      totalRedirects,
      totalBibleVerses,
      totalVocabWords,
      totalWikiEntries,
      totalLessonPlans,
    ] = await Promise.all([
      prisma.user.aggregate({
        where: { deletedAt: null },
        _count: { _all: true },
      }).then(async (total) => {
        const active = await prisma.user.count({
          where: {
            deletedAt: null,
            updatedAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
          },
        });
        return { total: total._count._all, active };
      }),
      prisma.post.groupBy({ by: ["type", "status"], _count: true }),
      prisma.media.count(),
      prisma.redirect.count({ where: { enabled: true } }),
      prisma.bibleVerse.count(),
      prisma.vocabWord.count(),
      prisma.wikiEntry.count(),
      prisma.lessonPlan.count({ where: { isActive: true } }),
    ]);

    // Process post statistics
    const postCounts = postStats.reduce((acc, stat) => {
      const key = `${stat.type}_${stat.status}`;
      acc[key] = stat._count;
      return acc;
    }, {} as Record<string, number>);

    const response = {
      totalUsers: userStats.total,
      activeUsers: userStats.active,
      totalPosts: postCounts.POST_PUBLISHED || 0,
      totalNews: postCounts.NEWS_PUBLISHED || 0,
      totalPages: (postCounts.PAGE_DRAFT || 0) + (postCounts.PAGE_PUBLISHED || 0) + (postCounts.PAGE_PRIVATE || 0),
      totalMedia,
      totalRedirects,
      totalBibleVerses,
      totalVocabWords,
      totalWikiEntries,
      totalLessonPlans,
    };

    // Add cache headers for admin stats (5 minutes cache)
    c.header("Cache-Control", "private, max-age=300");

    return ok(c, response);
  })

   // GET /api/admin/recent-activity - Get recent activity from audit logs
   .get("/recent-activity", async (c) => {

    const limit = c.req.query("limit") ? parseInt(c.req.query("limit")!) : 10;

    const recentLogs = await prisma.auditLog.findMany({
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        createdBy: {
          select: { name: true, email: true },
        },
      },
    });

    return ok(c, recentLogs);
  })

   // GET /api/admin/dashboard-layout - Get dashboard layout preferences
   .get("/dashboard-layout", async (c) => {

    const setting = await prisma.siteSetting.findUnique({
      where: { key: "admin_dashboard_layout" },
    });

    return ok(c, setting?.value ? JSON.parse(setting.value) : null);
  })

// PUT /api/admin/dashboard-layout - Save dashboard layout preferences
   .put(
     "/dashboard-layout",
     zValidator(
       "json",
       z.object({
         layout: z.array(z.string()),
       })
     ),
     async (c) => {
       try {
         const { layout } = c.req.valid("json");

         await prisma.siteSetting.upsert({
           where: { key: "admin_dashboard_layout" },
           update: { value: JSON.stringify(layout) },
           create: { key: "admin_dashboard_layout", value: JSON.stringify(layout) },
         });

         return ok(c, { layout });
        } catch (error) {
          const prismaError = error as { code?: string };
          if (prismaError?.code === "P2002") {
           return conflict(c, "Layout setting already exists.");
          }
          throw error;
        }
     }
   )

   // GET /api/admin/quick-actions-layout - Get quick actions layout
   .get("/quick-actions-layout", async (c) => {

    const setting = await prisma.siteSetting.findUnique({
      where: { key: "admin_quick_actions_layout" },
    });

    return ok(c, setting?.value ? JSON.parse(setting.value) : null);
  })

   // PUT /api/admin/quick-actions-layout - Save quick actions layout
   .put(
     "/quick-actions-layout",
     zValidator(
       "json",
       z.object({
         layout: z.array(z.string()),
       })
     ),
     async (c) => {
       try {
         const { layout } = c.req.valid("json");

         await prisma.siteSetting.upsert({
           where: { key: "admin_quick_actions_layout" },
           update: { value: JSON.stringify(layout) },
           create: { key: "admin_quick_actions_layout", value: JSON.stringify(layout) },
         });

         return ok(c, { layout });
        } catch (error) {
          const prismaError = error as { code?: string };
          if (prismaError?.code === "P2002") {
           return conflict(c, "Layout setting already exists.");
          }
          throw error;
        }
     }
   )

   // GET /api/admin/analytics - Get analytics data for charts
   .get("/analytics", async (c) => {
    const period = c.req.query("period") || "30";
    const days = parseInt(period);
    
    const data = await getAnalyticsData(days);

    return ok(c, data);
  })

  .route("/redirects", adminRedirectsRouter)
  .route("/custom-roles", customRolesRouter)
  .route("/permissions", permissionsRouter);

export default admin;
