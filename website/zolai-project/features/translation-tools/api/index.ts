import { Hono } from "hono";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import prisma from "@/lib/prisma";
import { ok, internalError } from "@/lib/api/response";
import type { Prisma } from "@/lib/generated/prisma";

const translationTools = new Hono()

  .get(
    "/translate",
    zValidator("query", z.object({
      text: z.string().min(1),
      from: z.enum(["english", "zolai"]),
      to:   z.enum(["english", "zolai"]),
    })),
    async (c) => {
      try {
        const { text, from, to } = c.req.valid("query");
        if (from === to) return ok(c, { originalText: text, translatedText: text, from, to, found: true });

        const q = text.trim();
        const isEnToZo = from === "english" && to === "zolai";

        const exact = await prisma.vocabWord.findFirst({
          where: isEnToZo
            ? { english: { equals: q, mode: "insensitive" } }
            : { zolai:   { equals: q, mode: "insensitive" } },
          select: isEnToZo ? { zolai: true, synonyms: true } : { english: true },
        });

        if (exact) {
          const translatedText = isEnToZo
            ? (exact as { zolai: string }).zolai
            : (exact as { english: string }).english;
          return ok(c, { originalText: text, translatedText, from, to, found: true });
        }

        const fuzzy = await prisma.vocabWord.findMany({
          where: isEnToZo
            ? { english: { contains: q, mode: "insensitive" } }
            : { zolai:   { contains: q, mode: "insensitive" } },
          select: { zolai: true, english: true },
          take: 5,
        });

        if (fuzzy.length > 0) {
          const translatedText = isEnToZo
            ? fuzzy.map(w => w.zolai).join(", ")
            : fuzzy.map(w => w.english).join(", ");
          return ok(c, { originalText: text, translatedText, from, to, found: true, fuzzy: true });
        }

        return ok(c, {
          originalText: text, translatedText: "", from, to, found: false,
          suggestions: ["Try individual words", "Check spelling", "Word may not be in dictionary yet"],
        });
      } catch {
        return internalError(c, "Translation failed");
      }
    }
  )

  .get(
    "/suggest",
    zValidator("query", z.object({
      text:  z.string().min(1),
      limit: z.coerce.number().int().min(1).max(10).default(5),
      lang:  z.enum(["english", "zolai", "both"]).default("both"),
    })),
    async (c) => {
      try {
        const { text, limit, lang } = c.req.valid("query");
        const where: Prisma.VocabWordWhereInput =
          lang === "zolai"   ? { zolai:   { startsWith: text, mode: "insensitive" } } :
          lang === "english" ? { english: { startsWith: text, mode: "insensitive" } } :
          { OR: [
            { zolai:   { startsWith: text, mode: "insensitive" } },
            { english: { startsWith: text, mode: "insensitive" } },
          ]};
        const suggestions = await prisma.vocabWord.findMany({
          where, select: { zolai: true, english: true, pos: true },
          orderBy: { zolai: "asc" }, take: limit,
        });
        return ok(c, { suggestions, query: text });
      } catch {
        return internalError(c, "Failed to get suggestions");
      }
    }
  )

  .get("/stats", async (c) => {
    try {
      const [total, confirmed] = await Promise.all([
        prisma.vocabWord.count(),
        prisma.vocabWord.count({ where: { accuracy: "confirmed" } }),
      ]);
      return ok(c, { totalWords: total, confirmed, coveragePercentage: total > 0 ? Math.round((confirmed / total) * 100) : 0 });
    } catch {
      return internalError(c, "Failed to get translation stats");
    }
  });

export default translationTools;
