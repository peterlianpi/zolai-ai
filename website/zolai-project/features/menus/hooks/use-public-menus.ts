import { useQuery } from "@tanstack/react-query";
import { getPublicMenus } from "../api";
import { menuKeys } from "../keys";

export function usePublicMenus() {
  return useQuery({
    queryKey: menuKeys.public(),
    queryFn: () => getPublicMenus(),
    staleTime: 60_000,
  });
}
