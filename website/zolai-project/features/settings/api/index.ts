import { client } from "@/lib/api/client";
import type { SiteSetting } from "@/features/settings/types";

export type { SiteSetting } from "@/features/settings/types";

export async function getAdminSiteSettings(keys?: string[]): Promise<SiteSetting[]> {
  const response = await client.api.admin["site-settings"].$get();
  if (!response.ok) {
    throw new Error("Failed to fetch site settings");
  }
  const json = (await response.json()) as {
    success: boolean;
    data: SiteSetting[];
  };

  if (!json.success) return [];
  if (!keys || keys.length === 0) return json.data;

  const keySet = new Set(keys);
  return json.data.filter((setting) => keySet.has(setting.key));
}

export async function getPublicSiteSettings(keys?: string[]): Promise<SiteSetting[]> {
  const query: Record<string, string> = {};
  if (keys?.length) query.keys = keys.join(",");

  const response = await client.api["site-settings"].$get({ query });
  if (!response.ok) {
    throw new Error("Failed to fetch site settings");
  }

  const json = (await response.json()) as {
    success?: boolean;
    data?: SiteSetting[];
  };

  if (!json.success || !json.data) return [];
  return json.data;
}
