"use client";
import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/api/client";

export const grammarKeys = {
  lessons: (difficulty?: string, page?: number) => ["grammar", "lessons", difficulty, page] as const,
  lesson: (slug: string) => ["grammar", "lesson", slug] as const,
  topics: () => ["grammar", "topics"] as const,
};

export function useGrammarLessons(difficulty?: string, page = 1) {
  return useQuery({
    queryKey: grammarKeys.lessons(difficulty, page),
    queryFn: async () => {
      const query: Record<string, string> = { page: String(page) };
      if (difficulty) query.difficulty = difficulty;
      const res = await client.api.grammar.lessons.$get({ query });
      if (!res.ok) throw new Error("Failed to fetch grammar lessons");
      return res.json();
    },
  });
}

export function useGrammarTopics() {
  return useQuery({
    queryKey: grammarKeys.topics(),
    queryFn: async () => {
      const res = await client.api.grammar.topics.$get();
      if (!res.ok) throw new Error("Failed to fetch grammar topics");
      return res.json();
    },
    staleTime: 300_000,
  });
}
