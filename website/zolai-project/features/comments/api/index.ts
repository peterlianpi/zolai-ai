import { client } from "@/lib/api/client";
import type { CommentFilters, CreateCommentInput } from "../types";

export async function getCommentsApi(filters: CommentFilters) {
  const res = await client.api.comments.$get({
    query: {
      postId: filters.postId,
      status: filters.status || "APPROVED",
      page: String(filters.page || 1),
      limit: String(filters.limit || 20),
    },
  });
  if (!res.ok) throw new Error("Failed to fetch comments");
  const json = await res.json() as { success: boolean; data: unknown[]; meta?: { total?: number } };
  return { comments: json.data ?? [], total: json.meta?.total ?? 0 };
}

export async function createComment(input: CreateCommentInput) {
  const res = await client.api.comments.$post({ json: input });
  if (!res.ok) {
    const json = await res.json() as { error?: { message: string } };
    throw new Error(json.error?.message || "Failed to create comment");
  }
  const json = await res.json() as { success: boolean; data: unknown };
  return json.data;
}
