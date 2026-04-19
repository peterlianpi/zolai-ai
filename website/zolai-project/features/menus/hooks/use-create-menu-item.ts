import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { createMenuItem } from "../api/admin";
import { menuKeys } from "../keys";

export function useCreateMenuItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createMenuItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: menuKeys.all });
      toast.success("Menu item created");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create menu item");
    },
  });
}
