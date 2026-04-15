"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { client } from "@/lib/api/client";
import type {
  Subscriber,
  SubscribersListResponse,
  SubscriberStats,
} from "@/features/newsletter/types";
import type { SubscribersListQuery } from "@/features/newsletter/schemas/subscriber.schema";

/**
 * Fetch subscribers for admin
 */
export async function fetchSubscribers(
  params: SubscribersListQuery = { page: 1, limit: 20 }
) {
  const query: Record<string, string> = {
    page: String(params.page || 1),
    limit: String(params.limit || 20),
  };

  if (params.status && params.status !== "ALL") {
    query.status = params.status;
  }
  if (params.search) {
    query.search = params.search;
  }

  const res = await client.api.newsletter.subscribers.$get({ query });
  if (!res.ok) {
    throw new Error("Failed to fetch subscribers");
  }

  const json = (await res.json()) as SubscribersListResponse;
  return {
    subscribers: json.data,
    meta: json.meta,
  };
}

/**
 * Fetch subscriber stats
 */
export async function fetchSubscriberStats() {
  const res = await client.api.newsletter.subscribers.stats.$get();
  if (!res.ok) {
    throw new Error("Failed to fetch stats");
  }

  const json = (await res.json()) as { success: boolean; data: SubscriberStats };
  return json.data;
}

/**
 * useSubscribers hook - Fetch list of subscribers with filters
 */
export function useSubscribers(params: SubscribersListQuery = { page: 1, limit: 20 }) {
  return useQuery({
    queryKey: ["subscribers", params],
    queryFn: () => fetchSubscribers(params),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * useSubscriberStats hook - Fetch subscriber statistics
 */
export function useSubscriberStats() {
  return useQuery({
    queryKey: ["subscriber-stats"],
    queryFn: fetchSubscriberStats,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * useUpdateSubscriberStatus hook - Update subscriber status
 */
export function useUpdateSubscriberStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      status,
    }: {
      id: string;
      status: "PENDING" | "CONFIRMED" | "UNSUBSCRIBED" | "BOUNCED";
    }) => {
      const res = await client.api.newsletter.subscribers[":id"].$patch({
        param: { id },
        json: { status },
      });

      if (!res.ok) {
        const json = (await res.json()) as { error?: { message: string } };
        throw new Error(json.error?.message || "Failed to update subscriber");
      }

      return (await res.json()) as { success: boolean; data: Subscriber };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subscribers"] });
      queryClient.invalidateQueries({ queryKey: ["subscriber-stats"] });
      toast.success("Subscriber updated");
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });
}

/**
 * useDeleteSubscriber hook - Delete subscriber
 */
export function useDeleteSubscriber() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await client.api.newsletter.subscribers[":id"].$delete({
        param: { id },
      });

      if (!res.ok) {
        const json = (await res.json()) as { error?: { message: string } };
        throw new Error(json.error?.message || "Failed to delete subscriber");
      }

      return (await res.json()) as { success: boolean };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subscribers"] });
      queryClient.invalidateQueries({ queryKey: ["subscriber-stats"] });
      toast.success("Subscriber deleted");
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });
}
