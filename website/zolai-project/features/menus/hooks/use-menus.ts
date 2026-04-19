import { useQuery } from "@tanstack/react-query";
import { listMenus } from "../api/admin";
import { menuKeys } from "../keys";

export function useMenus(location?: string) {
  return useQuery({
    queryKey: menuKeys.location(location),
    queryFn: () => listMenus(location ? { location } : undefined),
    staleTime: 60_000,
  });
}
