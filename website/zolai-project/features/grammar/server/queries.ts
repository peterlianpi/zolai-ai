import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";

export const GRAMMAR_CATEGORIES = ["phonology", "morphology", "syntax", "semantics", "pragmatics", "dialect"];

export async function getGrammarEntries(sub?: string) {
  return prisma.wikiEntry.findMany({
    where: {
      category: sub ? sub : { in: GRAMMAR_CATEGORIES },
      status: "published",
    },
    orderBy: { title: "asc" },
  });
}

export async function getGrammarCategoryCounts() {
  return prisma.wikiEntry.groupBy({
    by: ["category"],
    _count: { id: true },
    where: { category: { in: GRAMMAR_CATEGORIES }, status: "published" },
  });
}

export async function getGrammarEntryBySlug(slug: string) {
  const entry = await prisma.wikiEntry.findUnique({ where: { slug } });
  if (!entry) notFound();
  return entry;
}
