"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { client } from "@/lib/api/client";
import type {
  NewsletterCampaign,
  CampaignsListResponse,
  CampaignStats,
} from "@/features/newsletter/types";
import type { CampaignsListQuery } from "@/features/newsletter/schemas/subscriber.schema";

/**
 * Fetch campaigns for admin
 */
export async function fetchCampaigns(
  params: CampaignsListQuery = { page: 1, limit: 20 }
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

  const res = await client.api.newsletter.campaigns.$get({ query });
  if (!res.ok) {
    throw new Error("Failed to fetch campaigns");
  }

  const json = (await res.json()) as CampaignsListResponse;
  return {
    campaigns: json.data,
    meta: json.meta,
  };
}

/**
 * Fetch campaign stats
 */
export async function fetchCampaignStats() {
  const res = await client.api.newsletter.campaigns.stats.$get();
  if (!res.ok) {
    throw new Error("Failed to fetch campaign stats");
  }

  const json = (await res.json()) as { success: boolean; data: CampaignStats };
  return json.data;
}

/**
 * useCampaigns hook - Fetch list of campaigns with filters
 */
export function useCampaigns(params: CampaignsListQuery = { page: 1, limit: 20 }) {
  return useQuery({
    queryKey: ["campaigns", params],
    queryFn: () => fetchCampaigns(params),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * useCampaignStats hook - Fetch campaign statistics
 */
export function useCampaignStats() {
  return useQuery({
    queryKey: ["campaign-stats"],
    queryFn: fetchCampaignStats,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * useCreateCampaign hook - Create new campaign
 */
export function useCreateCampaign() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: {
      name: string;
      subject: string;
      body: string;
      scheduledAt?: string;
    }) => {
      const res = await client.api.newsletter.campaigns.$post({
        json: input,
      });

      if (!res.ok) {
        const json = (await res.json()) as { error?: { message: string } };
        throw new Error(json.error?.message || "Failed to create campaign");
      }

      return (await res.json()) as { success: boolean; data: NewsletterCampaign };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["campaigns"] });
      queryClient.invalidateQueries({ queryKey: ["campaign-stats"] });
      toast.success("Campaign created");
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });
}

/**
 * useUpdateCampaign hook - Update campaign
 */
export function useUpdateCampaign() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      ...input
    }: {
      id: string;
      name?: string;
      subject?: string;
      body?: string;
      scheduledAt?: string;
    }) => {
      const res = await client.api.newsletter.campaigns[":id"].$patch({
        param: { id },
        json: input,
      });

      if (!res.ok) {
        const json = (await res.json()) as { error?: { message: string } };
        throw new Error(json.error?.message || "Failed to update campaign");
      }

      return (await res.json()) as { success: boolean; data: NewsletterCampaign };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["campaigns"] });
      queryClient.invalidateQueries({ queryKey: ["campaign-stats"] });
      toast.success("Campaign updated");
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });
}

/**
 * useSendCampaign hook - Send or schedule campaign
 */
export function useSendCampaign() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      now: _now = false,
    }: {
      id: string;
      now?: boolean;
    }) => {
      const res = await client.api.newsletter.campaigns[":id"].send.$post({
        param: { id },
      });

      if (!res.ok) {
        const json = (await res.json()) as { error?: { message: string } };
        throw new Error(json.error?.message || "Failed to send campaign");
      }

      return (await res.json()) as {
        success: boolean;
        data: { sentCount: number; total: number };
      };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["campaigns"] });
      queryClient.invalidateQueries({ queryKey: ["campaign-stats"] });
      toast.success("Campaign sent successfully");
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });
}

/**
 * useDeleteCampaign hook - Delete campaign
 */
export function useDeleteCampaign() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await client.api.newsletter.campaigns[":id"].$delete({
        param: { id },
      });

      if (!res.ok) {
        const json = (await res.json()) as { error?: { message: string } };
        throw new Error(json.error?.message || "Failed to delete campaign");
      }

      return (await res.json()) as { success: boolean };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["campaigns"] });
      queryClient.invalidateQueries({ queryKey: ["campaign-stats"] });
      toast.success("Campaign deleted");
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });
}
