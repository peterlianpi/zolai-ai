import type { PaginationMeta } from "@/lib/types/api";
import type {
  SerializedPrismaModel,
  SerializedPrismaModelPick,
} from "@/lib/types/models";

export type CommentAuthor = SerializedPrismaModelPick<"user", "id" | "name" | "email" | "role">;

export interface CommentListItem {
  id: string;
  postId: string;
  parentId: string | null;
  authorName: string;
  authorEmail: string | null;
  authorUrl: string | null;
  content: string;
  status: "APPROVED" | "PENDING" | "SPAM" | "TRASH";
  spamScore: number | null;
  createdAt: string;
  updatedAt: string;
  author: CommentAuthor | null;
  parent: { id: string; authorName: string; content: string } | null;
  authorIp: string | null;
  userAgent: string | null;
  post?: {
    id: string;
    slug: string;
    type: "POST" | "NEWS" | "PAGE";
    locale: string;
  } | null;
}

export type Comment = CommentListItem;

export interface CommentWithReplies extends CommentListItem {
   replies: CommentWithReplies[];
   wpId: number | null;
   authorId: string | null;
   moderatedAt: string | null;
   moderatedById: string | null;
   akismetMeta: string | null;
}

export function createCommentWithReplies(comment: Comment): CommentWithReplies {
   return {
     ...comment,
     replies: [],
     wpId: null,
     authorId: null,
     moderatedAt: null,
     moderatedById: null,
     akismetMeta: null
   };
 }

export interface CreateCommentInput {
  postId: string;
  parentId?: string;
  authorName: string;
  authorEmail?: string;
  authorUrl?: string;
  content: string;
}

export interface CommentFilters {
  postId: string;
  status?: SerializedPrismaModel<"comment">["status"];
  page?: number;
  limit?: number;
}

export interface CommentStats {
  approved: number;
  pending: number;
  spam: number;
  trash: number;
  total: number;
}

export type BulkAction = "APPROVED" | "SPAM" | "TRASH" | "DELETE";

export interface CommentsListResponse {
  success: boolean;
  data: Comment[];
  meta: PaginationMeta;
}

export interface CommentStatsResponse {
  success: boolean;
  data: CommentStats;
}
