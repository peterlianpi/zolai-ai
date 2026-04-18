import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { client } from "@/lib/api/client";
import { menuKeys } from "../keys";
import type { MenuItem } from "../types";

export function useUpdateMenuItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: { label?: string; url?: string; target?: "_blank" | "_self"; order?: number; parentId?: string } }) => {
      const res = await client.api.menus.items[":id"].$patch({ param: { id }, json: { ...data, parentId: data.parentId || undefined } });
      if (!res.ok) {
        const json = (await res.json()) as { error?: { message?: string } };
        throw new Error(json.error?.message || "Failed to update menu item");
      }
      const json = (await res.json()) as { success?: boolean; data?: MenuItem };
      if (!json.success || !json.data) throw new Error("Failed to update menu item");
      return json.data;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: menuKeys.all }); toast.success("Menu item updated"); },
    onError: (error: Error) => toast.error(error.message || "Failed to update menu item"),
  });
}
