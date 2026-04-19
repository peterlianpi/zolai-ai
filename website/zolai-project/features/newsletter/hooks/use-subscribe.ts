"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { client } from "@/lib/api/client";
import type { Subscriber } from "@/features/newsletter/types";

/**
 * useSubscribe hook - Subscribe to newsletter
 */
export function useSubscribe() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: {
      email: string;
      name?: string;
      source?: string;
    }) => {
      const res = await client.api.newsletter.subscribe.$post({
        json: input,
      });

      if (!res.ok) {
        const json = (await res.json()) as { error?: { message: string } };
        throw new Error(json.error?.message || "Failed to subscribe");
      }

      return (await res.json()) as {
        success: boolean;
        data: Subscriber & { message?: string };
      };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["subscriber-stats"] });
      toast.success(
        data.data.message ||
          "Subscription successful! Check your email to confirm."
      );
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });
}

/**
 * useConfirmSubscription hook - Confirm subscription via token
 */
export function useConfirmSubscription() {
  return useMutation({
    mutationFn: async (token: string) => {
      const res = await client.api.newsletter.confirm[":token"].$get({
        param: { token },
      });

      if (!res.ok) {
        const json = (await res.json()) as { error?: { message: string } };
        throw new Error(json.error?.message || "Failed to confirm subscription");
      }

      return (await res.json()) as {
        success: boolean;
        data: Subscriber & { message?: string };
      };
    },
    onSuccess: (data) => {
      toast.success(data.data.message || "Subscription confirmed!");
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });
}

/**
 * useUnsubscribe hook - Unsubscribe from newsletter
 */
export function useUnsubscribe() {
  return useMutation({
    mutationFn: async ({ email, token }: { email: string; token?: string }) => {
      const res = await client.api.newsletter.unsubscribe.$post({
        json: { email, token },
      });

      if (!res.ok) {
        const json = (await res.json()) as { error?: { message: string } };
        throw new Error(
          json.error?.message || "Failed to unsubscribe"
        );
      }

      return (await res.json()) as {
        success: boolean;
        data: Subscriber & { message?: string };
      };
    },
    onSuccess: (data) => {
      toast.success(
        data.data.message || "You have been unsubscribed"
      );
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });
}
