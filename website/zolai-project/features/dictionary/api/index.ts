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
      const mode = "insensitive" as const;
      const qn = q.trim().toLowerCase();

      // Primary search field(s)
      const primaryField = lang === "english" ? "english" : "zolai";
      const secondaryField = lang === "english" ? "zolai" : "english";

      // Fetch candidates: exact first, then prefix, then contains
      const [exactMatches, prefixMatches, containsMatches] = await Promise.all([
        prisma.vocabWord.findMany({
          where: { [primaryField]: { equals: q, mode } },
          select: WORD_SELECT,
          take: limit,
        }),
        prisma.vocabWord.findMany({
          where: { [primaryField]: { startsWith: q, mode } },
          select: WORD_SELECT,
          take: limit * 3,
          orderBy: { [primaryField]: "asc" },
        }),
        prisma.vocabWord.findMany({
          where: { [primaryField]: { contains: q, mode } },
          select: WORD_SELECT,
          take: limit * 5,
          orderBy: { [primaryField]: "asc" },
        }),
      ]);

      // Deduplicate by id
      const seen = new Set<string>();
      const candidates = [...exactMatches, ...prefixMatches, ...containsMatches].filter(w => {
        if (seen.has(w.id)) return false;
        seen.add(w.id);
        return true;
      });

      // Score each candidate
      const scored = candidates.map(w => {
        const pv = w[primaryField as keyof typeof w] as string;
        const pvl = pv.toLowerCase();
        const sv = w[secondaryField as keyof typeof w] as string;
        const svl = sv?.toLowerCase() ?? "";

        let score = 0;

        // Tier 1: exact match on primary field (highest)
        if (pvl === qn) score += 1000;
        // Tier 2: primary field starts with query
        else if (pvl.startsWith(qn)) score += 500 - pvl.length; // shorter = better
        // Tier 3: primary field word boundary match (e.g. "go" matches "go out")
        else if (pvl.split(/\s+/)[0] === qn) score += 400;
        // Tier 4: contains on primary
        else if (pvl.includes(qn)) score += 100;

        // Bonus: secondary field exact match
        if (svl === qn) score += 200;
        else if (svl.startsWith(qn)) score += 50;

        // Bonus: variant exact match
        if (w.variants?.some(v => v.toLowerCase() === qn)) score += 300;
        if (w.synonyms?.some(v => v.toLowerCase() === qn)) score += 150;

        // Penalty: compound phrases (spaces = less relevant for short queries)
        const wordCount = pvl.split(/\s+/).length;
        score -= wordCount * 80;
        score -= pvl.length * 1.5;

        // Bonus: confirmed accuracy
        if (w.accuracy === "confirmed") score += 20;

        return { word: w, score };
      });

      // Filter noise: for short queries, require meaningful score
      const minScore = q.length <= 3 ? 50 : 0;
      const filtered = scored.filter(s => s.score >= minScore);
      filtered.sort((a, b) => b.score - a.score);

      const skip = (page - 1) * limit;
      const words = filtered.slice(skip, skip + limit).map(s => s.word);
      const total = filtered.length;

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
