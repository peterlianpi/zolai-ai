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

export async function fetchComments(params: FetchCommentsParams = {}): Promise<{ comments: Comment[]; total: number; hasMore: boolean; page: number }> {
  const searchParams = new URLSearchParams();
  if (params.status && params.status !== "all") searchParams.set("status", params.status);
  if (params.search) searchParams.set("search", params.search);
  if (params.page) searchParams.set("page", String(params.page));
  if (params.limit) searchParams.set("limit", String(params.limit));

  const res = await client.api.comments.$get({ query: Object.fromEntries(searchParams) });
  if (!res.ok) throw new Error("Failed to fetch comments");
  const json = (await res.json()) as CommentsListResponse;
  return {
    comments: json.data,
    total: json.meta.total,
    hasMore: json.meta.page < json.meta.totalPages,
    page: json.meta.page,
  };
}

export async function fetchCommentStats(): Promise<CommentStats> {
  const res = await client.api.comments.stats.$get();
  if (!res.ok) throw new Error("Failed to fetch stats");
  const json = (await res.json()) as CommentStatsResponse;
  return json.data;
}

export async function updateCommentStatus(id: string, status: Comment["status"]) {
  const res = await client.api.comments[":id"].$patch({
    param: { id },
    json: { status },
  });
  if (!res.ok) {
    const json = (await res.json()) as { error?: { message: string } };
    throw new Error(json.error?.message || "Failed to update comment");
  }
  return res.json();
}

export async function bulkAction(input: { action: BulkAction; ids: string[] }) {
  const res = await client.api.comments["bulk-action"].$post({ json: input });
  if (!res.ok) {
    const json = (await res.json()) as { error?: { message: string } };
    throw new Error(json.error?.message || "Failed to perform bulk action");
  }
  return res.json();
}

export function useCommentStats() {
  return useQuery({
    queryKey: ["comment-stats"],
    queryFn: fetchCommentStats,
  });
}

export function useComments(params: { status?: string; search?: string; page?: number; limit?: number; enabled?: boolean }) {
  return useQuery({
    queryKey: ["comments", params.status, params.search, params.page, params.limit],
    queryFn: () => fetchComments(params),
    enabled: params.enabled !== false,
  });
}

export function useCommentsInfinite(params: { status?: string; search?: string; limit?: number; enabled?: boolean }) {
  return useInfiniteQuery({
    queryKey: ["comments-infinite", params.status, params.search, params.limit],
    queryFn: ({ pageParam = 1 }) => fetchComments({ ...params, page: pageParam }),
    getNextPageParam: (lastPage) => lastPage.hasMore ? lastPage.page + 1 : undefined,
    initialPageParam: 1,
    enabled: params.enabled !== false,
  });
}

export function useUpdateCommentStatus() {
  const queryClient = useQueryClient();

  const invalidateCommentQueries = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["comments"] }),
      queryClient.invalidateQueries({ queryKey: ["comments-infinite"] }),
      queryClient.invalidateQueries({ queryKey: ["comment-stats"] }),
    ]);
  };

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: Comment["status"] }) => updateCommentStatus(id, status),
    onSuccess: async () => {
      await invalidateCommentQueries();
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

export function useBulkAction() {
  const queryClient = useQueryClient();

  const invalidateCommentQueries = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["comments"] }),
      queryClient.invalidateQueries({ queryKey: ["comments-infinite"] }),
      queryClient.invalidateQueries({ queryKey: ["comment-stats"] }),
    ]);
  };

  return useMutation({
    mutationFn: bulkAction,
    onSuccess: async () => {
      await invalidateCommentQueries();
      toast.success("Bulk action completed");
    },
    onError: (err: Error) => toast.error(err.message),
  });
}
