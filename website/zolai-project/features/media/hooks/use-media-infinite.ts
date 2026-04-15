import { useInfiniteQuery } from "@tanstack/react-query";
import { listMedia } from "../api";
import { mediaKeys } from "../keys";

export function useMediaInfinite(params?: { limit?: number; mimeType?: string }) {
  return useInfiniteQuery({
    queryKey: mediaKeys.infinite(params ?? {}),
    queryFn: ({ pageParam = 1 }) =>
      listMedia({
        page: pageParam as number,
        limit: params?.limit ?? 20,
        mimeType: params?.mimeType,
      }),
    getNextPageParam: (lastPage) => {
      if (lastPage.meta.page < lastPage.meta.totalPages) {
        return lastPage.meta.page + 1;
      }
      return undefined;
    },
    initialPageParam: 1,
    staleTime: 30_000,
  });
}
