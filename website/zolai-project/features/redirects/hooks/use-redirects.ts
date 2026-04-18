import { useInfiniteQuery, useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { client } from "@/lib/api/client";
import type { RedirectListResponse } from "../types";

export function useRedirects(params: { enabled?: boolean; page?: number; limit?: number }) {
  return useQuery({
    queryKey: ["redirects-normal", params],
    queryFn: async () => {
      const query: Record<string, string> = {};
      if (params.enabled !== undefined) query.enabled = String(params.enabled);
      if (params.page) query.page = String(params.page);
      if (params.limit) query.limit = String(params.limit);
      const res = await client.api.redirects.$get({ query });
      if (!res.ok) throw new Error("Failed to fetch redirects");
      return (await res.json()) as unknown as RedirectListResponse;
    },
  });
}

export function useInfiniteRedirects(params: { enabled?: boolean; limit?: number }) {
  return useInfiniteQuery({
    queryKey: ["redirects-infinite", params],
    queryFn: async ({ pageParam = 1 }) => {
      const query: Record<string, string> = { page: String(pageParam) };
      if (params.enabled !== undefined) query.enabled = String(params.enabled);
      if (params.limit) query.limit = String(params.limit);
      const res = await client.api.redirects.$get({ query });
      if (!res.ok) throw new Error("Failed to fetch redirects");
      return (await res.json()) as unknown as RedirectListResponse;
    },
    getNextPageParam: (lastPage) => {
      const meta = (lastPage as unknown as { data?: { meta?: { page: number; totalPages: number } } })?.data?.meta;
      return meta && meta.page < meta.totalPages ? meta.page + 1 : undefined;
    },
    initialPageParam: 1,
  });
}

export function useDeleteRedirectMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await client.api.redirects[":id"].$delete({ param: { id } });
      if (!res.ok) {
        const json = (await res.json()) as { error?: { message?: string } };
        throw new Error(json.error?.message || "Failed to delete redirect");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["redirects-normal"] });
      queryClient.invalidateQueries({ queryKey: ["redirects-infinite"] });
    },
  });
}
