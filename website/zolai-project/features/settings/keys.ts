export const settingsKeys = {
  all: ["settings"] as const,
  site: () => [...settingsKeys.all, "site"] as const,
  siteByKeys: (keys?: string[]) =>
    [...settingsKeys.site(), keys?.join(",") ?? "all"] as const,
};
