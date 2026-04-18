import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { client } from "@/lib/api/client";
import { updateSiteSetting } from "@/features/settings/server/actions";
import { settingsKeys } from "@/features/settings/keys";
import type { SiteSetting } from "@/features/settings/types";

const LAYOUT_KEYS = [
  "header_style",
  "header_sticky",
  "header_transparent_scroll",
  "header_show_search",
  "hero_style",
  "hero_alignment",
  "footer_style",
  "footer_show_newsletter",
  "footer_show_social",
  "footer_columns",
] as const;

export type LayoutSettings = {
  header_style: "default" | "minimal" | "centered";
  header_sticky: boolean;
  header_transparent_scroll: boolean;
  header_show_search: boolean;
  hero_style: "simple" | "background" | "subtitle" | "fullscreen" | "minimal";
  hero_alignment: "left" | "center" | "right";
  footer_style: "standard" | "minimal" | "compact";
  footer_show_newsletter: boolean;
  footer_show_social: boolean;
  footer_columns: "2" | "3" | "4";
};

function parseSettings(settings: SiteSetting[]): LayoutSettings {
  const get = (key: string, fallback: string) =>
    settings.find((s) => s.key === key)?.value ?? fallback;

  return {
    header_style: get("header_style", "default") as LayoutSettings["header_style"],
    header_sticky: get("header_sticky", "true") === "true",
    header_transparent_scroll: get("header_transparent_scroll", "true") === "true",
    header_show_search: get("header_show_search", "true") === "true",
    hero_style: get("hero_style", "simple") as LayoutSettings["hero_style"],
    hero_alignment: get("hero_alignment", "center") as LayoutSettings["hero_alignment"],
    footer_style: get("footer_style", "standard") as LayoutSettings["footer_style"],
    footer_show_newsletter: get("footer_show_newsletter", "true") === "true",
    footer_show_social: get("footer_show_social", "true") === "true",
    footer_columns: get("footer_columns", "3") as LayoutSettings["footer_columns"],
  };
}

export function useAdminLayoutSettings() {
  return useQuery<LayoutSettings>({
    queryKey: settingsKeys.siteByKeys([...LAYOUT_KEYS]),
    queryFn: async () => {
      const res = await client.api.admin["site-settings"].$get();
      if (!res.ok) throw new Error("Failed to fetch layout settings");
      const json = (await res.json()) as { success: boolean; data: SiteSetting[] };
      if (!json.success) throw new Error("Failed to fetch layout settings");
      const filtered = json.data.filter((s) =>
        (LAYOUT_KEYS as readonly string[]).includes(s.key),
      );
      return parseSettings(filtered);
    },
    staleTime: 30_000,
  });
}

export function useSaveLayoutSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (values: LayoutSettings) => {
      const entries = Object.entries(values) as [string, boolean | string][];
      await Promise.all(
        entries.map(([key, value]) => updateSiteSetting(key, String(value))),
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.all });
    },
  });
}
