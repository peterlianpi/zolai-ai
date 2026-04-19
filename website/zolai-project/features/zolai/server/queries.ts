import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import { unstable_cache } from "next/cache";

// Training
export async function getTrainingPageData() {
  const [runs, stats] = await Promise.all([
    prisma.trainingRun.findMany({ orderBy: { startedAt: "desc" } }),
    prisma.datasetStat.findMany({ orderBy: { label: "asc" } }),
  ]);
  return { runs, stats };
}

export async function getTrainingRunById(id: string) {
  const run = await prisma.trainingRun.findUnique({ where: { id } });
  if (!run) notFound();
  return run;
}

// Wiki
export async function getWikiCategories() {
  return prisma.wikiEntry.groupBy({
    by: ["category"],
    _count: { id: true },
    orderBy: { category: "asc" },
  });
}

export async function getWikiEntriesByCategory(category: string) {
  const entries = await prisma.wikiEntry.findMany({
    where: { category },
    orderBy: { updatedAt: "desc" },
  });
  if (entries.length === 0) notFound();
  return entries;
}

export async function getWikiEntry(slug: string, category: string) {
  const [entry, related] = await Promise.all([
    prisma.wikiEntry.findUnique({ where: { slug } }),
    prisma.wikiEntry.findMany({
      where: { category, slug: { not: slug }, status: "published" },
      select: { slug: true, title: true, tags: true },
      take: 6,
      orderBy: { title: "asc" },
    }),
  ]);
  if (!entry || entry.category !== category) notFound();
  return { entry, related };
}

// Bible
export const getBibleBooks = unstable_cache(
  async () => prisma.bibleVerse.groupBy({ by: ["book", "testament"], _count: { id: true } }),
  ["bible-books"],
  { revalidate: 3600 },
);

// Admin wiki
export async function getAdminWikiEntries() {
  return prisma.wikiEntry.findMany({
    orderBy: { updatedAt: "desc" },
    select: { id: true, title: true, category: true, status: true, tags: true, updatedAt: true },
  });
}
