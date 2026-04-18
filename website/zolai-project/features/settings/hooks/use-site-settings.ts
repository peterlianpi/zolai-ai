import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/api/client";
import { settingsKeys } from "../keys";
import type { SiteSetting } from "@/features/settings/types";

export function useSiteSettings(keys?: string[]) {
  return useQuery<SiteSetting[]>({
    queryKey: settingsKeys.siteByKeys(keys),
    queryFn: async () => {
      const res = await client.api.admin["site-settings"].$get();
      if (!res.ok) throw new Error("Failed to fetch site settings");
      const json = (await res.json()) as { success: boolean; data: SiteSetting[] };
      if (!json.success) return [];
      if (!keys?.length) return json.data;
      const keySet = new Set(keys);
      return json.data.filter((s) => keySet.has(s.key));
    },
    staleTime: 30_000,
  });
}

export function usePublicSiteSettings(keys?: string[]) {
  return useQuery<SiteSetting[]>({
    queryKey: settingsKeys.siteByKeys(keys),
    queryFn: async () => {
      const query: Record<string, string> = {};
      if (keys?.length) query.keys = keys.join(",");
      const res = await client.api["site-settings"].$get({ query });
      if (!res.ok) throw new Error("Failed to fetch site settings");
      const json = (await res.json()) as { success?: boolean; data?: SiteSetting[] };
      return json.success && json.data ? json.data : [];
    },
    staleTime: 30_000,
  });
}
