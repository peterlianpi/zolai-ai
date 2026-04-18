import { useInfiniteQuery } from "@tanstack/react-query";
import { client } from "@/lib/api/client";
import { mediaKeys } from "../keys";
import type { MediaListResponse, MediaItem } from "../types";

export function useMediaInfinite(params?: { limit?: number; mimeType?: string }) {
  return useInfiniteQuery<MediaListResponse>({
    queryKey: mediaKeys.infinite(params ?? {}),
    queryFn: async ({ pageParam = 1 }) => {
      const query: Record<string, string> = {
        page: String(pageParam),
        limit: String(params?.limit ?? 20),
      };
      if (params?.mimeType) query.mimeType = params.mimeType;
      const res = await client.api.media.$get({ query });
      if (!res.ok) throw new Error("Failed to fetch media");
      const json = (await res.json()) as { success?: boolean; data?: MediaItem[]; meta?: MediaListResponse["meta"] };
      if (!json.success || !json.data || !json.meta) {
        return { media: [], meta: { total: 0, page: pageParam as number, limit: params?.limit ?? 20, totalPages: 1 } };
      }
      return { media: json.data, meta: json.meta };
    },
    getNextPageParam: (lastPage) =>
      lastPage.meta.page < lastPage.meta.totalPages ? lastPage.meta.page + 1 : undefined,
    initialPageParam: 1,
    staleTime: 30_000,
  });
}
