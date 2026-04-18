import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/api/client";
import { menuKeys } from "../keys";
import type { Menu } from "../types";

export function usePublicMenus() {
  return useQuery<Menu[]>({
    queryKey: menuKeys.public(),
    queryFn: async () => {
      const res = await client.api.menus.public.$get();
      if (!res.ok) throw new Error("Failed to fetch menus");
      const json = (await res.json()) as { success?: boolean; data?: Menu[] };
      return json.success && json.data ? json.data : [];
    },
    staleTime: 60_000,
  });
}
