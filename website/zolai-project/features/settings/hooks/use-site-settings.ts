import { useQuery } from "@tanstack/react-query";
import { getAdminSiteSettings, getPublicSiteSettings } from "../api";
import { settingsKeys } from "../keys";

export function useSiteSettings(keys?: string[]) {
  return useQuery({
    queryKey: settingsKeys.siteByKeys(keys),
    queryFn: () => getAdminSiteSettings(keys),
    staleTime: 30_000,
  });
}

export function usePublicSiteSettings(keys?: string[]) {
  return useQuery({
    queryKey: settingsKeys.siteByKeys(keys),
    queryFn: () => getPublicSiteSettings(keys),
    staleTime: 30_000,
  });
}
