import prisma from "@/lib/prisma";
import { unstable_cache } from "next/cache";

export const getHomeStats = unstable_cache(
  async () => {
    try {
      const [stats, wikiCount, bibleCount, vocabCount] = await Promise.all([
        prisma.datasetStat.findMany(),
        prisma.wikiEntry.count(),
        prisma.bibleVerse.count(),
        prisma.vocabWord.count(),
      ]);
      return { stats, wikiCount, bibleCount, vocabCount };
    } catch {
      return { stats: [], wikiCount: 0, bibleCount: 0, vocabCount: 0 };
    }
  },
  ["home-stats"],
  { revalidate: 300 },
);
