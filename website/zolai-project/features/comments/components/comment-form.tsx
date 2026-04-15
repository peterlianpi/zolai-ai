"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createComment } from "../api";
import type { CreateCommentInput } from "../types";
import { toast } from "sonner";
import { CommentEditor } from "./comment-editor";
import { sanitizeContentHtml } from "@/lib/sanitize";

interface CommentFormProps {
  postId: string;
  parentId?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
  /** Enable rich text editor for comments. Default false. */
  allowRichText?: boolean;
}

export function CommentForm({
  postId,
  parentId,
  onSuccess,
  onCancel,
  allowRichText = false,
}: CommentFormProps) {
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [content, setContent] = useState("");

  const mutation = useMutation({
    mutationFn: (data: CreateCommentInput) => createComment(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", postId] });
      setName("");
      setEmail("");
      setContent("");
      toast.success("Comment submitted successfully!");
      onSuccess?.();
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || !name.trim()) return;

    // Sanitize HTML content if rich text is enabled
    const sanitizedContent = allowRichText ? sanitizeContentHtml(content.trim()) : content.trim();

    mutation.mutate({
      postId,
      parentId,
      authorName: name.trim(),
      authorEmail: email.trim() || undefined,
      content: sanitizedContent,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor="comment-name">Name *</Label>
          <Input
            id="comment-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            required
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="comment-email">Email</Label>
          <Input
            id="comment-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
          />
        </div>
      </div>
      <div className="grid gap-2">
        <Label htmlFor="comment-content">Comment *</Label>
        <CommentEditor
          value={content}
          onChange={setContent}
          placeholder="Write your comment..."
          disabled={mutation.isPending}
          allowRichText={allowRichText}
          defaultRichText={false}
        />
      </div>
      <div className="flex gap-2">
        <Button type="submit" disabled={mutation.isPending || !name.trim() || !content.trim()}>
          {mutation.isPending ? "Submitting..." : parentId ? "Reply" : "Post Comment"}
        </Button>
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}