"use client";
import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/api/client";

export const audioKeys = {
  words: (q?: string, page?: number) => ["audio", "words", q, page] as const,
  word: (id: string) => ["audio", "word", id] as const,
  stats: () => ["audio", "stats"] as const,
};

export function useAudioWords(q?: string, page = 1, hasAudio?: boolean) {
  return useQuery({
    queryKey: audioKeys.words(q, page),
    queryFn: async () => {
      const query: Record<string, string> = { page: String(page) };
      if (q) query.query = q;
      if (hasAudio !== undefined) query.hasAudio = String(hasAudio);
      const res = await client.api["audio-pronunciation"].words.$get({ query });
      if (!res.ok) throw new Error("Failed to fetch audio words");
      return res.json();
    },
  });
}

export function useAudioStats() {
  return useQuery({
    queryKey: audioKeys.stats(),
    queryFn: async () => {
      const res = await client.api["audio-pronunciation"].stats.$get();
      if (!res.ok) throw new Error("Failed to fetch audio stats");
      return res.json();
    },
    staleTime: 60_000,
  });
}
