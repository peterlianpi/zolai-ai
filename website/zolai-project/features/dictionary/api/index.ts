import { Hono } from "hono";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import prisma from "@/lib/prisma";
import { ok, notFound, internalError, list } from "@/lib/api/response";
import { cachedFetch } from "@/lib/cache";

const WORD_SELECT = {
  id: true, zolai: true, english: true, pos: true, category: true,
  definition: true, example: true, explanation: true, synonyms: true,
  antonyms: true, related: true, variants: true, examples: true,
  accuracy: true, tags: true, audioUrl: true,
} as const;

const searchSchema = zValidator("query", z.object({
  q:      z.string().min(1),
  lang:   z.enum(["zolai", "english", "both"]).default("both"),
  limit:  z.coerce.number().int().min(1).max(100).default(10),
  page:   z.coerce.number().int().min(1).default(1),
}));

const randomSchema = zValidator("query", z.object({
  count: z.coerce.number().int().min(1).max(50).default(5),
  pos:   z.string().optional(),
}));

// Named routes must come before /:id to avoid param capture
const dictionary = new Hono()

  .get("/search", searchSchema, async (c) => {
    try {
      const { q, lang, limit, page } = c.req.valid("query");
      const where =
        lang === "zolai"   ? { zolai:   { contains: q, mode: "insensitive" as const } } :
        lang === "english" ? { english: { contains: q, mode: "insensitive" as const } } :
        { OR: [
          { zolai:   { contains: q, mode: "insensitive" as const } },
          { english: { contains: q, mode: "insensitive" as const } },
        ]};
      const [words, total] = await Promise.all([
        prisma.vocabWord.findMany({ where, select: WORD_SELECT, orderBy: { zolai: "asc" }, skip: (page - 1) * limit, take: limit }),
        prisma.vocabWord.count({ where }),
      ]);
      return list(c, words, { total, page, limit, totalPages: Math.ceil(total / limit) });
    } catch {
      return internalError(c, "Failed to search dictionary");
    }
  })

  .get("/stats", async (c) => {
    try {
      const data = await cachedFetch("dict:stats", 5 * 60_000, async () => {
        const [total, confirmed, withSyns, withAnts] = await Promise.all([
          prisma.vocabWord.count(),
          prisma.vocabWord.count({ where: { accuracy: "confirmed" } }),
          prisma.vocabWord.count({ where: { NOT: { synonyms: { isEmpty: true } } } }),
          prisma.vocabWord.count({ where: { NOT: { antonyms: { isEmpty: true } } } }),
        ]);
        return { total, confirmed, withSynonyms: withSyns, withAntonyms: withAnts };
      });
      return ok(c, data);
    } catch {
      return internalError(c, "Failed to get stats");
    }
  })

  .get("/random", randomSchema, async (c) => {
    try {
      const { count, pos } = c.req.valid("query");
      // Use DB-level ORDER BY RANDOM() — avoids fetching N*10 rows and JS shuffle
      const ids = pos
        ? await prisma.$queryRaw<{ id: string }[]>`SELECT id FROM "VocabWord" WHERE category = ${pos} ORDER BY RANDOM() LIMIT ${count}`
        : await prisma.$queryRaw<{ id: string }[]>`SELECT id FROM "VocabWord" ORDER BY RANDOM() LIMIT ${count}`;
      const words = await prisma.vocabWord.findMany({
        where: { id: { in: ids.map((r) => r.id) } },
        select: WORD_SELECT,
      });
      return ok(c, { words });
    } catch {
      return internalError(c, "Failed to get random words");
    }
  })

  // /:id must be last — catches anything not matched above
  .get("/:id", async (c) => {
    try {
      const word = await prisma.vocabWord.findUnique({ where: { id: c.req.param("id") }, select: WORD_SELECT });
      if (!word) return notFound(c, "Word not found");
      return ok(c, { word });
    } catch {
      return internalError(c, "Failed to get word");
    }
  });

export default dictionary;
