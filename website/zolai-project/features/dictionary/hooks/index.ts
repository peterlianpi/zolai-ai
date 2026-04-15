"use client";
import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/api/client";
import type { DictWord, DictStats, SearchLang } from "../types";

export const dictKeys = {
  search: (q: string, lang: SearchLang, page: number) => ["dict", "search", q, lang, page] as const,
  word:   (id: string) => ["dict", "word", id] as const,
  random: (count: number) => ["dict", "random", count] as const,
  stats:  () => ["dict", "stats"] as const,
};

export function useDictSearch(q: string, lang: SearchLang, page = 1) {
  return useQuery<{ data: DictWord[]; meta: { total: number; page: number; limit: number; totalPages: number } }>({
    queryKey: dictKeys.search(q, lang, page),
    queryFn: async () => {
      const res = await client.api.dictionary.search.$get({ query: { q, lang, page: String(page), limit: "20" } });
      if (!res.ok) throw new Error("Search failed");
      return res.json();
    },
    enabled: q.length >= 1,
    placeholderData: prev => prev,
  });
}

export function useDictWord(id: string) {
  return useQuery<{ success: boolean; data: { word: DictWord } }>({
    queryKey: dictKeys.word(id),
    queryFn: async () => {
      const res = await client.api.dictionary[":id"].$get({ param: { id } });
      if (!res.ok) throw new Error("Fetch failed");
      return res.json();
    },
    enabled: !!id,
  });
}

export function useRandomWords(count = 6) {
  return useQuery<{ success: boolean; data: { words: DictWord[] } }>({
    queryKey: dictKeys.random(count),
    queryFn: async () => {
      const res = await client.api.dictionary.random.$get({ query: { count: String(count) } });
      if (!res.ok) throw new Error("Fetch failed");
      return res.json();
    },
    staleTime: 60_000,
  });
}

export function useDictStats() {
  return useQuery<{ success: boolean; data: DictStats }>({
    queryKey: dictKeys.stats(),
    queryFn: async () => {
      const res = await client.api.dictionary.stats.$get();
      if (!res.ok) throw new Error("Stats failed");
      return res.json();
    },
    staleTime: 300_000,
  });
}
