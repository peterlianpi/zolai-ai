"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { client } from "@/lib/api/client";
import { toast } from "sonner";
import type { CreateNotificationTemplateInput, UpdateNotificationTemplateInput, SendBulkNotificationInput } from "../types";

// API returns JSON with Date fields serialized to ISO strings.
export type NotificationTemplate = {
  id: string;
  name: string;
  slug: string;
  subject: string;
  body: string;
  variables?: Record<string, string> | null;
  isActive: boolean;
  type: string;
  createdAt: string;
  updatedAt: string;
};

export function useNotificationTemplates() {
  return useQuery({
    queryKey: ["notification-templates"],
    queryFn: async (): Promise<NotificationTemplate[]> => {
      const res = await client.api.notifications.templates.$get();
      if (!res.ok) throw new Error("Failed to fetch templates");
      const json = (await res.json()) as { success: boolean; data: NotificationTemplate[] };
      return json.data || [];
    },
  });
}

export function useNotificationTemplate(id: string) {
  return useQuery({
    queryKey: ["notification-templates", id],
    queryFn: async (): Promise<NotificationTemplate> => {
      const res = await client.api.notifications.templates[":id"].$get({
        param: { id },
      });
      if (!res.ok) throw new Error("Failed to fetch template");
      const json = (await res.json()) as { success: boolean; data: NotificationTemplate };
      return json.data;
    },
    enabled: !!id,
  });
}

export function useCreateNotificationTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateNotificationTemplateInput) => {
      const res = await client.api.notifications.templates.$post({
        json: data,
      });
      if (!res.ok) throw new Error("Failed to create template");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notification-templates"] });
      toast.success("Notification template created successfully");
    },
    onError: (error) => {
      toast.error(`Failed to create template: ${error.message}`);
    },
  });
}

export function useUpdateNotificationTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateNotificationTemplateInput }) => {
      const res = await client.api.notifications.templates[":id"].$put({
        param: { id },
        json: data,
      });
      if (!res.ok) throw new Error("Failed to update template");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notification-templates"] });
      toast.success("Notification template updated successfully");
    },
    onError: (error) => {
      toast.error(`Failed to update template: ${error.message}`);
    },
  });
}

export function useDeleteNotificationTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await client.api.notifications.templates[":id"].$delete({
        param: { id },
      });
      if (!res.ok) throw new Error("Failed to delete template");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notification-templates"] });
      toast.success("Notification template deleted successfully");
    },
    onError: (error) => {
      toast.error(`Failed to delete template: ${error.message}`);
    },
  });
}

export function useSendBulkNotification() {
  return useMutation({
    mutationFn: async (data: SendBulkNotificationInput) => {
      const res = await client.api.notifications["send-bulk"].$post({
        json: data,
      });
      if (!res.ok) throw new Error("Failed to send notifications");
      const json = (await res.json()) as { success: boolean; data: { createdCount: number } };
      return json;
    },
    onSuccess: (data) => {
      const createdCount = data.data.createdCount;
      toast.success(`Sent ${createdCount} notifications successfully`);
    },
    onError: (error) => {
      toast.error(`Failed to send notifications: ${error.message}`);
    },
  });
}
