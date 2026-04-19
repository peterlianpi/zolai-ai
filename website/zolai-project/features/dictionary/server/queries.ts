import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";

export async function getDictionaryStats() {
  const [total, confirmed] = await Promise.all([
    prisma.vocabWord.count(),
    prisma.vocabWord.count({ where: { accuracy: "confirmed" } }),
  ]);
  return { total, confirmed };
}

export async function getWordById(id: string) {
  const word = await prisma.vocabWord.findUnique({ where: { id } });
  if (!word) notFound();
  return word;
}
