import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { deleteTerm } from "../api";
import { contentKeys } from "../keys";

export function useDeleteTerm() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, { id: string; taxonomyId?: string }>({
    mutationFn: ({ id }) => deleteTerm(id),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: contentKeys.terms() });
      queryClient.invalidateQueries({
        queryKey: contentKeys.termsByTaxonomy(variables.taxonomyId),
      });
      toast.success("Term deleted");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete term");
    },
  });
}
