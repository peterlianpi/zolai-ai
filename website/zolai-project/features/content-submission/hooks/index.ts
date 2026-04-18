"use client";
import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/api/client";

export const submissionKeys = {
  list: (status?: string, page?: number) => ["submissions", status, page] as const,
  one: (id: string) => ["submission", id] as const,
  stats: () => ["submissions", "stats"] as const,
};

export function useSubmissions(status?: string, page = 1) {
  return useQuery({
    queryKey: submissionKeys.list(status, page),
    queryFn: async () => {
      const query: Record<string, string> = { page: String(page) };
      if (status) query.status = status;
      const res = await client.api["content-submission"].submissions.$get({ query });
      if (!res.ok) throw new Error("Failed to fetch submissions");
      return res.json();
    },
  });
}

export function useSubmissionStats() {
  return useQuery({
    queryKey: submissionKeys.stats(),
    queryFn: async () => {
      const res = await client.api["content-submission"].stats.$get();
      if (!res.ok) throw new Error("Failed to fetch submission stats");
      return res.json();
    },
  });
}
