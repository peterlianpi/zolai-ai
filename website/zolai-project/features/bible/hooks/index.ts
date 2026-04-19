"use client";
import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/api/client";
import type { BibleVerse } from "../types";

export const bibleKeys = {
  chapters: (book: string) => ["bible", "chapters", book] as const,
  verses:   (book: string, chapter: number) => ["bible", "verses", book, chapter] as const,
};

export function useBibleChapters(book: string) {
  return useQuery<number[]>({
    queryKey: bibleKeys.chapters(book),
    queryFn: async () => {
      const res = await client.api.zolai.bible[":book"].chapters.$get({ param: { book } });
      if (!res.ok) throw new Error("Fetch failed");
      const json = await res.json();
      return (json as { data: number[] }).data ?? [];
    },
    enabled: !!book,
    staleTime: Infinity,
  });
}

export function useBibleVerses(book: string, chapter: number) {
  return useQuery<BibleVerse[]>({
    queryKey: bibleKeys.verses(book, chapter),
    queryFn: async () => {
      const res = await client.api.zolai.bible[":book"].$get({
        param: { book },
        query: { chapter: String(chapter), limit: "200" },
      });
      if (!res.ok) throw new Error("Fetch failed");
      const json = await res.json();
      return (json as { data: BibleVerse[] }).data ?? [];
    },
    enabled: !!book && chapter > 0,
  });
}
