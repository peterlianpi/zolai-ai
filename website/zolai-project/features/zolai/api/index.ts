import { Hono } from "hono";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import prisma from "@/lib/prisma";
import { requirePermission, getSessionFromContext } from "@/lib/auth/server-guards";
import { PERMISSIONS } from "@/lib/auth/rbac";
import { ok, notFound, error as apiError, internalError, list, unauthorized } from "@/lib/api/response";
import { notify } from "@/lib/telegram";
import { getTutorSystemPrompt } from "@/lib/zolai/curriculum";
import { cachedFetch } from "@/lib/cache";
import { getAvailableModels } from "@/lib/ai/providers";

const GRAMMAR_CATS = ["phonology", "morphology", "syntax", "semantics", "pragmatics", "dialect"];

export const chatRouter = new Hono()
  .post(
    "/",
    zValidator("json", z.object({
      messages: z.array(z.object({ role: z.string(), content: z.string() })),
      level:    z.string().optional(),
      mode:     z.string().optional(),
      tutor:    z.boolean().optional(),
    })),
    async (c) => {
      const session = await getSessionFromContext(c);
      if (!session?.user) return unauthorized(c, "Authentication required");
      const { messages, level, mode, tutor } = c.req.valid("json");
      const apiUrl = process.env.ZOLAI_API_URL ?? "http://13.115.84.100:18789/chat";
      const payload: Record<string, unknown> = { messages, level, mode };
      if (tutor) payload.system = getTutorSystemPrompt(level, mode);
      try {
        const upstream = await fetch(apiUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!upstream.ok) return apiError(c, "Upstream error", "UPSTREAM_ERROR", upstream.status as import("hono/utils/http-status").ContentfulStatusCode);
        const upstreamContentType = upstream.headers.get("content-type") ?? "";
        const contentType = upstreamContentType.includes("text/event-stream")
          ? "text/event-stream"
          : "application/json";
        return new Response(upstream.body, {
          headers: { "Content-Type": contentType, "Transfer-Encoding": "chunked" },
        });
      } catch {
        return internalError(c, "Failed to reach chat service");
      }
    }
  );

const zolai = new Hono()

  .get("/models/:provider", async (c) => {
    const provider = c.req.param("provider");
    try {
      const models = await getAvailableModels(provider);
      return ok(c, { models });
    } catch {
      return internalError(c, "Failed to fetch models");
    }
  })

  .get("/stats", async (c) => {
    try {
      return ok(c, await prisma.datasetStat.findMany());
    } catch {
      return internalError(c, "Failed to fetch stats");
    }
  })

  .get("/wiki", async (c) => {
    try {
      const entries = await cachedFetch("zolai:wiki:list", 5 * 60_000, () =>
        prisma.wikiEntry.findMany({
          select: { id: true, slug: true, title: true, category: true, status: true, updatedAt: true },
          orderBy: { updatedAt: "desc" },
        })
      );
      return ok(c, entries);
    } catch {
      return internalError(c, "Failed to fetch wiki entries");
    }
  })

  .get("/wiki/:slug", async (c) => {
    try {
      const slug = c.req.param("slug");
      const entry = await cachedFetch(`zolai:wiki:${slug}`, 5 * 60_000, () =>
        prisma.wikiEntry.findUnique({ where: { slug } })
      );
      if (!entry) return notFound(c, "Wiki entry not found");
      return ok(c, entry);
    } catch {
      return internalError(c, "Failed to fetch wiki entry");
    }
  })

  .get(
    "/bible/:book",
    zValidator("query", z.object({
      chapter: z.coerce.number().int().min(1).optional(),
      page:    z.coerce.number().int().min(1).default(1),
      limit:   z.coerce.number().int().min(1).max(200).default(50),
    })),
    async (c) => {
      try {
        const book = c.req.param("book");
        const { chapter, page, limit } = c.req.valid("query");

        // Copyright protection: unauthenticated requests get max 5 verses
        const session = await import("@/lib/auth/server-guards").then(m => m.getSessionFromContext(c));
        const isAuth = !!session?.user;
        const effectiveLimit = isAuth ? Math.min(limit, 200) : Math.min(limit, 5);

        const where = { book, ...(chapter !== undefined ? { chapter } : {}) };
        const [verses, total] = await Promise.all([
          prisma.bibleVerse.findMany({ where, skip: (page - 1) * effectiveLimit, take: effectiveLimit, orderBy: [{ chapter: "asc" }, { verse: "asc" }] }),
          prisma.bibleVerse.count({ where }),
        ]);
        c.header("Cache-Control", isAuth ? "private, max-age=300" : "public, max-age=86400, stale-while-revalidate=3600");
        return list(c, verses, { total, page, limit: effectiveLimit, totalPages: Math.ceil(total / effectiveLimit) });
      } catch {
        return internalError(c, "Failed to fetch bible verses");
      }
    }
  )

  // GET /api/zolai/bible/:book/chapters — distinct chapter list (efficient)
  .get("/bible/:book/chapters", async (c) => {
    try {
      const rows = await prisma.bibleVerse.findMany({
        where: { book: c.req.param("book") },
        select: { chapter: true },
        distinct: ["chapter"],
        orderBy: { chapter: "asc" },
      });
      return ok(c, rows.map(r => r.chapter));
    } catch {
      return internalError(c, "Failed to fetch chapters");
    }
  })

  .get(
    "/vocab",
    zValidator("query", z.object({
      q:        z.string().optional(),
      category: z.string().optional(),
      limit:    z.coerce.number().int().min(1).max(200).default(100),
    })),
    async (c) => {
      try {
        const { q, category, limit } = c.req.valid("query");
        const words = await cachedFetch(`zolai:vocab:${q ?? ""}:${category ?? ""}:${limit}`, 2 * 60_000, () =>
          prisma.vocabWord.findMany({
            where: {
              ...(q && { OR: [{ zolai: { contains: q, mode: "insensitive" } }, { english: { contains: q, mode: "insensitive" } }] }),
              ...(category && { category }),
            },
            orderBy: { zolai: "asc" },
            take: limit,
          })
        );
        return list(c, words, { total: words.length, page: 1, limit, totalPages: 1 });
      } catch {
        return internalError(c, "Failed to fetch vocab");
      }
    }
  )

  .get(
    "/grammar",
    zValidator("query", z.object({
      sub: z.string().optional(),
    })),
    async (c) => {
      try {
        const { sub } = c.req.valid("query");
        const entries = await cachedFetch(`zolai:grammar:${sub ?? "all"}`, 5 * 60_000, () =>
          prisma.wikiEntry.findMany({
            where: { category: sub ? sub : { in: GRAMMAR_CATS }, status: "published" },
            orderBy: { title: "asc" },
          })
        );
        return ok(c, entries);
      } catch {
        return internalError(c, "Failed to fetch grammar entries");
      }
    }
  )

  .get("/training", async (c) => {
    try {
      return ok(c, await prisma.trainingRun.findMany({ orderBy: { startedAt: "desc" }, take: 50 }));
    } catch {
      return internalError(c, "Failed to fetch training runs");
    }
  })

  .post(
    "/training",
    zValidator("json", z.object({
      name:  z.string().min(1),
      model: z.string().default("unknown"),
      notes: z.string().optional(),
    })),
    async (c) => {
      const adminCheck = await requirePermission(c, PERMISSIONS.ADMIN_PANEL);
      if (adminCheck instanceof Response) return adminCheck;
      try {
        const { name, model, notes } = c.req.valid("json");
        const run = await prisma.trainingRun.create({ data: { name, model, status: "pending", config: notes ? { notes } : undefined } });
        return ok(c, run);
      } catch {
        return internalError(c, "Failed to create training run");
      }
    }
  )

  .patch(
    "/training/:id",
    zValidator("json", z.object({
      status:   z.enum(["running", "complete", "failed"]).optional(),
      steps:    z.number().int().optional(),
      maxSteps: z.number().int().optional(),
      lossJson: z.string().optional(),
    })),
    async (c) => {
      const webhookKey = c.req.header("x-webhook-key");
      const validKey = process.env.CRON_SECRET && webhookKey === process.env.CRON_SECRET;
      if (!validKey) {
        const adminCheck = await requirePermission(c, PERMISSIONS.ADMIN_PANEL);
        if (adminCheck instanceof Response) return adminCheck;
      }
      try {
        const data = c.req.valid("json");
        const run = await prisma.trainingRun.update({
          where: { id: c.req.param("id") },
          data: { ...data, ...(data.status === "complete" || data.status === "failed" ? { endedAt: new Date() } : {}) },
        });
        if (data.status === "complete") notify(`✅ Training run <b>${run.name}</b> completed! ${run.steps} steps.`).catch(() => {});
        if (data.status === "failed") notify(`❌ Training run <b>${run.name}</b> failed.`).catch(() => {});
        return ok(c, run);
      } catch {
        return internalError(c, "Failed to update training run");
      }
    }
  );

export default zolai;
