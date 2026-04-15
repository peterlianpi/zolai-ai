import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { updateMenuItem } from "../api/admin";
import { menuKeys } from "../keys";

export function useUpdateMenuItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof updateMenuItem>[1] }) =>
      updateMenuItem(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: menuKeys.all });
      toast.success("Menu item updated");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update menu item");
    },
  });
}
