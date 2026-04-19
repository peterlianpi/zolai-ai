import { useInfiniteQuery, useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getRedirects, deleteRedirect } from "../api";

export function useRedirects(params: {
  enabled?: boolean;
  page?: number;
  limit?: number;
}) {
  return useQuery({
    queryKey: ["redirects-normal", params],
    queryFn: () => getRedirects(params),
  });
}

export function useInfiniteRedirects(params: {
  enabled?: boolean;
  limit?: number;
}) {
  return useInfiniteQuery({
    queryKey: ["redirects-infinite", params],
    queryFn: ({ pageParam = 1 }) =>
      getRedirects({
        ...params,
        page: pageParam as number,
      }),
    getNextPageParam: (lastPage) => {
      const meta = lastPage?.data?.meta;
      if (meta && meta.page < meta.totalPages) {
        return meta.page + 1;
      }
      return undefined;
    },
    initialPageParam: 1,
  });
}

export function useDeleteRedirectMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteRedirect(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["redirects-normal"] });
      queryClient.invalidateQueries({ queryKey: ["redirects-infinite"] });
    },
  });
}
