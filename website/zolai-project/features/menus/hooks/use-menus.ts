import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/api/client";
import { menuKeys } from "../keys";
import type { Menu } from "../types";

export function useMenus(location?: string) {
  return useQuery<Menu[]>({
    queryKey: menuKeys.location(location),
    queryFn: async () => {
      const query: Record<string, string> = {};
      if (location) query.location = location;
      const res = await client.api.menus.$get({ query });
      if (!res.ok) throw new Error("Failed to fetch menus");
      const json = (await res.json()) as { success?: boolean; data?: Menu[] };
      return json.success && json.data ? json.data : [];
    },
    staleTime: 60_000,
  });
}
