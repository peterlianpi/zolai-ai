"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { client } from "@/lib/api/client";
import { toast } from "sonner";

// API returns JSON with Date fields serialized to ISO strings.
export type Notification = {
  id: string;
  title: string;
  description: string;
  type: string;
  action?: string | null;
  actorUserId?: string | null;
  actorName?: string | null;
  metadata?: Record<string, unknown> | null;
  link?: string | null;
  entityType?: string | null;
  entityId?: string | null;
  read: boolean;
  createdAt: string;
  readAt: string | null;
  userId: string;
};

export function useNotifications(opts?: { refetchInterval?: number }) {
  return useQuery({
    queryKey: ["notifications"],
    queryFn: async (): Promise<Notification[]> => {
      const res = await client.api.notifications.$get();
      if (!res.ok) throw new Error("Failed to fetch notifications");
      const json = (await res.json()) as unknown as { success: boolean; data: Notification[] };
      return json.data || [];
    },
    refetchInterval: opts?.refetchInterval,
  });
}

export function useUnreadCount(opts?: { refetchInterval?: number }) {
  return useQuery({
    queryKey: ["notifications", "unread-count"],
    queryFn: async (): Promise<number> => {
      const res = await client.api.notifications["unread-count"].$get();
      if (!res.ok) throw new Error("Failed to fetch unread count");
      const json = (await res.json()) as { success: boolean; data: { count: number } };
      return json.data?.count ?? 0;
    },
    refetchInterval: opts?.refetchInterval,
  });
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await client.api.notifications[":id"].read.$post({
        param: { id },
      });
      if (!res.ok) throw new Error("Failed to mark as read");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["notifications", "unread-count"] });
    },
  });
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const res = await client.api.notifications["read-all"].$post();
      if (!res.ok) throw new Error("Failed to mark all as read");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["notifications", "unread-count"] });
      toast.success("All notifications marked as read");
    },
  });
}
