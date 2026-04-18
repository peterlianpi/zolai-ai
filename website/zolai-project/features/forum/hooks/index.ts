"use client";
import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/api/client";

export const forumKeys = {
  posts: (category?: string, page?: number) => ["forum", "posts", category, page] as const,
  post: (slug: string) => ["forum", "post", slug] as const,
  categories: () => ["forum", "categories"] as const,
};

export function useForumPosts(category?: string, page = 1, sort?: string) {
  return useQuery({
    queryKey: forumKeys.posts(category, page),
    queryFn: async () => {
      const query: Record<string, string> = { page: String(page) };
      if (category) query.category = category;
      if (sort) query.sort = sort;
      const res = await client.api.forum.posts.$get({ query });
      if (!res.ok) throw new Error("Failed to fetch forum posts");
      return res.json();
    },
  });
}

export function useForumCategories() {
  return useQuery({
    queryKey: forumKeys.categories(),
    queryFn: async () => {
      const res = await client.api.forum.categories.$get();
      if (!res.ok) throw new Error("Failed to fetch forum categories");
      return res.json();
    },
    staleTime: 300_000,
  });
}
