"use client";

import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/api/client";
import type { HomePost } from "../api";

export function useLatestPosts() {
  return useQuery<HomePost[]>({
    queryKey: ["latest-posts"],
    queryFn: async () => {
      const res = await client.api.content.posts.$get({
        query: { limit: "5", status: "PUBLISHED", orderBy: "publishedAt", orderDir: "desc" },
      });
      if (!res.ok) throw new Error("Failed to fetch latest posts");
      const json = (await res.json()) as { success: boolean; data: HomePost[] };
      return json.data;
    },
  });
}
