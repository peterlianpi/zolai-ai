import { Hono } from "hono";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import prisma from "@/lib/prisma";
import { ok, notFound, internalError, list } from "@/lib/api/response";
import { _getSessionUserId } from "@/lib/auth/server-guards";
import type { Prisma } from "@/lib/generated/prisma";

const wordSelect = {
  id: true, zolai: true, english: true,
  pos: true, audioUrl: true, tags: true,
} satisfies Prisma.VocabWordSelect;

const audioPronunciation = new Hono()

  .get(
    "/words",
    zValidator("query", z.object({
      query:    z.string().optional(),
      limit:    z.coerce.number().int().min(1).max(50).default(10),
      page:     z.coerce.number().int().min(1).default(1),
      hasAudio: z.coerce.boolean().optional(),
    })),
    async (c) => {
      try {
        const { query, limit, page, hasAudio } = c.req.valid("query");
        const where: Prisma.VocabWordWhereInput = {
          ...(query && { OR: [
            { zolai:   { contains: query, mode: "insensitive" } },
            { english: { contains: query, mode: "insensitive" } },
          ]}),
          ...(hasAudio === true  && { audioUrl: { not: "" } }),
          ...(hasAudio === false && { audioUrl: "" }),
        };
        const [words, total] = await Promise.all([
          prisma.vocabWord.findMany({ where, select: wordSelect, orderBy: { zolai: "asc" }, skip: (page - 1) * limit, take: limit }),
          prisma.vocabWord.count({ where }),
        ]);
        return list(c, words, { total, page, limit, totalPages: Math.ceil(total / limit) });
      } catch {
        return internalError(c, "Failed to fetch audio words");
      }
    }
  )

  .get("/word/:id", async (c) => {
    try {
      const word = await prisma.vocabWord.findUnique({
        where: { id: c.req.param("id") },
        select: { ...wordSelect, definition: true, example: true },
      });
      if (!word) return notFound(c, "Word not found");
      return ok(c, { word });
    } catch {
      return internalError(c, "Failed to fetch word");
    }
  })

  .post(
    "/upload",
    zValidator("json", z.object({
      wordId:   z.string(),
      audioUrl: z.string().url(),
    })),
    async (c) => {
      try {
        const { wordId, audioUrl } = c.req.valid("json");
        const word = await prisma.vocabWord.findUnique({ where: { id: wordId } });
        if (!word) return notFound(c, "Word not found");
        const updated = await prisma.vocabWord.update({ where: { id: wordId }, data: { audioUrl } });
        return ok(c, { word: updated });
      } catch {
        return internalError(c, "Failed to upload audio");
      }
    }
  )

  .get(
    "/random",
    zValidator("query", z.object({
      count:    z.coerce.number().int().min(1).max(20).default(5),
      hasAudio: z.coerce.boolean().optional(),
    })),
    async (c) => {
      try {
        const { count, hasAudio } = c.req.valid("query");
        const where: Prisma.VocabWordWhereInput = {
          ...(hasAudio === true  && { audioUrl: { not: "" } }),
          ...(hasAudio === false && { audioUrl: "" }),
        };
        const total = await prisma.vocabWord.count({ where });
        const skip  = Math.max(0, Math.floor(Math.random() * (total - count)));
        const words = await prisma.vocabWord.findMany({ where, select: wordSelect, skip, take: count });
        return ok(c, { words });
      } catch {
        return internalError(c, "Failed to get random audio words");
      }
    }
  )

  .get("/stats", async (c) => {
    try {
      const [total, withAudio] = await Promise.all([
        prisma.vocabWord.count(),
        prisma.vocabWord.count({ where: { audioUrl: { not: "" } } }),
      ]);
      return ok(c, {
        totalWords: total,
        wordsWithAudio: withAudio,
        wordsWithoutAudio: total - withAudio,
        audioCoveragePercentage: total > 0 ? Math.round((withAudio / total) * 100) : 0,
      });
    } catch {
      return internalError(c, "Failed to fetch audio stats");
    }
  });

export default audioPronunciation;
