"use client";

import { useQuery } from "@tanstack/react-query";
import { getLatestPosts, type HomePost } from "../api";

export function useLatestPosts() {
  const { data, isLoading, error } = useQuery<HomePost[], Error>({
    queryKey: ["latest-posts"],
    queryFn: () => getLatestPosts(),
  });

  return {
    posts: data || [],
    isLoading,
    error,
  };
}
