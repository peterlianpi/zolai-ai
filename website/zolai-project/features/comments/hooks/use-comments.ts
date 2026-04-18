import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { client } from "@/lib/api/client";
import type {
  BulkAction,
  Comment,
  CommentsListResponse,
  CommentStats,
  CommentStatsResponse,
} from "@/features/comments/types";

interface FetchCommentsParams {
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export function useCommentStats() {
  return useQuery<CommentStats>({
    queryKey: ["comment-stats"],
    queryFn: async () => {
      const res = await client.api.comments.stats.$get();
      if (!res.ok) throw new Error("Failed to fetch stats");
      const json = (await res.json()) as CommentStatsResponse;
      return json.data;
    },
  });
}

export function useComments(params: FetchCommentsParams & { enabled?: boolean }) {
  return useQuery({
    queryKey: ["comments", params.status, params.search, params.page, params.limit],
    queryFn: async () => {
      const query: Record<string, string> = {};
      if (params.status && params.status !== "all") query.status = params.status;
      if (params.search) query.search = params.search;
      if (params.page) query.page = String(params.page);
      if (params.limit) query.limit = String(params.limit);
      const res = await client.api.comments.$get({ query });
      if (!res.ok) throw new Error("Failed to fetch comments");
      const json = (await res.json()) as CommentsListResponse;
      return { comments: json.data, total: json.meta.total, hasMore: json.meta.page < json.meta.totalPages, page: json.meta.page };
    },
    enabled: params.enabled !== false,
  });
}

export function useCommentsInfinite(params: { status?: string; search?: string; limit?: number; enabled?: boolean }) {
  return useInfiniteQuery({
    queryKey: ["comments-infinite", params.status, params.search, params.limit],
    queryFn: async ({ pageParam = 1 }) => {
      const query: Record<string, string> = {};
      if (params.status && params.status !== "all") query.status = params.status;
      if (params.search) query.search = params.search;
      query.page = String(pageParam);
      if (params.limit) query.limit = String(params.limit);
      const res = await client.api.comments.$get({ query });
      if (!res.ok) throw new Error("Failed to fetch comments");
      const json = (await res.json()) as CommentsListResponse;
      return { comments: json.data, total: json.meta.total, hasMore: json.meta.page < json.meta.totalPages, page: json.meta.page };
    },
    getNextPageParam: (lastPage) => lastPage.hasMore ? lastPage.page + 1 : undefined,
    initialPageParam: 1,
    enabled: params.enabled !== false,
  });
}

export function useUpdateCommentStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: Comment["status"] }) => {
      const res = await client.api.comments[":id"].$patch({ param: { id }, json: { status } });
      if (!res.ok) {
        const json = (await res.json()) as { error?: { message: string } };
        throw new Error(json.error?.message || "Failed to update comment");
      }
      return res.json();
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["comments"] }),
        queryClient.invalidateQueries({ queryKey: ["comments-infinite"] }),
        queryClient.invalidateQueries({ queryKey: ["comment-stats"] }),
      ]);
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

export function useBulkAction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: { action: BulkAction; ids: string[] }) => {
      const res = await client.api.comments["bulk-action"].$post({ json: input });
      if (!res.ok) {
        const json = (await res.json()) as { error?: { message: string } };
        throw new Error(json.error?.message || "Failed to perform bulk action");
      }
      return res.json();
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["comments"] }),
        queryClient.invalidateQueries({ queryKey: ["comments-infinite"] }),
        queryClient.invalidateQueries({ queryKey: ["comment-stats"] }),
      ]);
      toast.success("Bulk action completed");
    },
    onError: (err: Error) => toast.error(err.message),
  });
}
