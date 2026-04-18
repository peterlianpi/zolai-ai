"use client";
import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/api/client";

export const translationKeys = {
  translate: (text: string, from: string, to: string) => ["translation", text, from, to] as const,
  suggest: (text: string) => ["translation", "suggest", text] as const,
  stats: () => ["translation", "stats"] as const,
};

export function useTranslation(text: string, from: string, to: string) {
  return useQuery({
    queryKey: translationKeys.translate(text, from, to),
    queryFn: async () => {
      const res = await client.api["translation-tools"].translate.$get({ query: { text, from, to } });
      if (!res.ok) throw new Error("Translation failed");
      return res.json();
    },
    enabled: text.length > 0 && from !== to,
  });
}

export function useTranslationStats() {
  return useQuery({
    queryKey: translationKeys.stats(),
    queryFn: async () => {
      const res = await client.api["translation-tools"].stats.$get();
      if (!res.ok) throw new Error("Failed to fetch translation stats");
      return res.json();
    },
    staleTime: 300_000,
  });
}
