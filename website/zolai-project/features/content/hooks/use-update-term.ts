import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { updateTerm } from "../api";
import { contentKeys } from "../keys";
import type { UpdateTermInput } from "../schemas/term";
import type { Term } from "../types";

export function useUpdateTerm() {
  const queryClient = useQueryClient();

  return useMutation<Term, Error, { id: string; data: UpdateTermInput }>({
    mutationFn: ({ id, data }) => updateTerm(id, data),
    onSuccess: (term) => {
      queryClient.invalidateQueries({ queryKey: contentKeys.terms() });
      queryClient.invalidateQueries({
        queryKey: contentKeys.termsByTaxonomy(term.taxonomy?.id),
      });
      toast.success("Term updated");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update term");
    },
  });
}
