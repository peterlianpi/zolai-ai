import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { client } from "@/lib/api/client";
import { menuKeys } from "../keys";

export function useDeleteMenuItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await client.api.menus.items[":id"].$delete({ param: { id } });
      if (!res.ok) {
        const json = (await res.json()) as { error?: { message?: string } };
        throw new Error(json.error?.message || "Failed to delete menu item");
      }
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: menuKeys.all }); toast.success("Menu item deleted"); },
    onError: (error: Error) => toast.error(error.message || "Failed to delete menu item"),
  });
}
