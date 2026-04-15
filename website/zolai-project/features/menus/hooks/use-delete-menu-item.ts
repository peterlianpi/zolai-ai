import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { deleteMenuItem } from "../api/admin";
import { menuKeys } from "../keys";

export function useDeleteMenuItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteMenuItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: menuKeys.all });
      toast.success("Menu item deleted");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete menu item");
    },
  });
}
