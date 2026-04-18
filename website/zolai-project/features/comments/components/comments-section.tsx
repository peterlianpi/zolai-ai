"use client";

import { useState, useMemo, useCallback } from "react";
import { format } from "date-fns";
import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/api/client";
import { CommentForm } from "./comment-form";
import type { CommentWithReplies } from "../types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { MessageCircle, Reply, User } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface CommentsSectionProps {
  postId: string;
  commentsEnabled?: boolean;
}

export function CommentsSection({ postId, commentsEnabled = true }: CommentsSectionProps) {
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [burstUntil, setBurstUntil] = useState(0);

  const startBurstRefresh = useCallback((durationMs = 30000) => {
    setBurstUntil(Date.now() + durationMs);
  }, []);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["comments", postId],
    queryFn: async () => {
      const res = await client.api.comments.$get({ query: { postId, status: "APPROVED", page: "1", limit: "100" } });
      if (!res.ok) throw new Error("Failed to fetch comments");
      const json = (await res.json()) as import("@/features/comments/types").CommentsListResponse;
      return { comments: json.data ?? [], total: json.meta?.total ?? 0 };
    },
    enabled: commentsEnabled,
    staleTime: 30_000,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    refetchInterval: () => (Date.now() < burstUntil ? 2000 : false),
    retry: 1,
  });

  const comments = useMemo(() => data?.comments ?? [], [data?.comments]);

  const commentTree = useMemo(() => {
    const map = new Map<string, CommentWithReplies>();
    const roots: CommentWithReplies[] = [];

    comments.forEach((c) => {
      // Transform ApiComment to CommentWithReplies structure
       const commentWithReplies: CommentWithReplies = {
         ...c,
          // Map API response to local comment shape used by UI
          wpId: null,
          authorId: c.author?.id || null,
          spamScore: c.spamScore ?? null,
          updatedAt: c.updatedAt ?? c.createdAt,
          moderatedAt: null,
          moderatedById: null,
          akismetMeta: null,
         // Transform author to match expected CommentAuthor type
         author: c.author ? {
           id: c.author.id,
           name: c.author.name,
           email: c.author.email,
           role: (c.author.role as "USER" | "ADMIN") || "USER" // Cast to proper role type
         } : null,
          parent: c.parent ?? null,
          replies: []
        };
      map.set(c.id, commentWithReplies);
    });

    comments.forEach((c) => {
      const node = map.get(c.id)!;
      if (c.parentId) {
        const parent = map.get(c.parentId);
        if (parent) {
          parent.replies.push(node);
        } else {
          roots.push(node);
        }
      } else {
        roots.push(node);
      }
    });

    return roots.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [comments]);

  if (!commentsEnabled) {
    return (
      <div className="mt-12 pt-8 border-t">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <MessageCircle className="h-5 w-5" />
          Comments
        </h3>
        <p className="text-muted-foreground">Comments are disabled for this post.</p>
      </div>
    );
  }

  return (
    <div className="mt-12 pt-8 border-t">
      <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
        <MessageCircle className="h-5 w-5" />
        Comments ({comments.length})
      </h3>

      <div className="mb-8">
        <CommentForm
          postId={postId}
          onSuccess={() => {
            startBurstRefresh();
            void refetch();
          }}
        />
      </div>

      {isLoading ? (
        <div className="space-y-4 py-2" aria-live="polite" aria-busy="true">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={`comment-skeleton-${index}`} className="rounded-lg border bg-card p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-5 w-14 rounded-full" />
                </div>
                <Skeleton className="h-3 w-28" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-[92%]" />
                <Skeleton className="h-3 w-[80%]" />
              </div>
              <Skeleton className="h-8 w-24" />
            </div>
          ))}
        </div>
      ) : commentTree.length === 0 ? (
        <p className="text-muted-foreground text-center py-8">No comments yet. Be the first to comment!</p>
      ) : (
        <div className="space-y-6">
          {commentTree.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              onReply={(id) => setReplyTo(id)}
              replyTo={replyTo}
              postId={postId}
              onCancelReply={() => setReplyTo(null)}
              onSuccess={() => {
                startBurstRefresh();
                void refetch();
                setReplyTo(null);
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface CommentItemProps {
  comment: CommentWithReplies;
  onReply: (id: string) => void;
  replyTo: string | null;
  postId: string;
  onCancelReply: () => void;
  onSuccess: () => void;
}

function CommentItem({ comment, onReply, replyTo, postId, onCancelReply, onSuccess }: CommentItemProps) {
  return (
    <div className="space-y-4">
      <div className="bg-muted/30 rounded-lg p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="font-medium cursor-help">{comment.authorName}</span>
                </TooltipTrigger>
                <TooltipContent>
                  <div className="text-xs space-y-1">
                    <p><span className="text-muted-foreground">Role:</span> {comment.author?.role || "Guest"}</p>
                    {comment.authorEmail && (
                      <p><span className="text-muted-foreground">Email:</span> {comment.authorEmail}</p>
                    )}
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            {comment.author?.role ? (
              <Badge variant="outline" className="text-xs">
                {comment.author.role}
              </Badge>
            ) : (
              <Badge variant="secondary" className="text-xs">
                <User className="h-3 w-3 mr-1" />
                Guest
              </Badge>
            )}
          </div>
          <time className="text-xs text-muted-foreground">
            {format(new Date(comment.createdAt), "MMM d, yyyy 'at' h:mm a")}
          </time>
        </div>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <p className="text-sm truncate cursor-help">{comment.content}</p>
            </TooltipTrigger>
            <TooltipContent className="w-80 max-h-48 overflow-y-auto">
              <p className="whitespace-pre-wrap">{comment.content}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <Button
          variant="ghost"
          size="sm"
          className="mt-2 gap-1"
          onClick={() => onReply(comment.id)}
        >
          <Reply className="h-4 w-4" />
          Reply
        </Button>
      </div>

      {replyTo === comment.id && (
        <div className="ml-8 border-l-2 pl-4">
          <CommentForm
            postId={postId}
            parentId={comment.id}
            onSuccess={onSuccess}
            onCancel={onCancelReply}
          />
        </div>
      )}

      {comment.replies.length > 0 && (
        <div className="ml-8 space-y-4">
          {comment.replies.map((reply: CommentWithReplies) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              onReply={onReply}
              replyTo={replyTo}
              postId={postId}
              onCancelReply={onCancelReply}
              onSuccess={onSuccess}
            />
          ))}
        </div>
      )}
    </div>
  );
}
