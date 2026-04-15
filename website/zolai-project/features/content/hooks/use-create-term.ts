import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { createTerm } from "../api";
import { contentKeys } from "../keys";
import type { CreateTermInput } from "../schemas/term";
import type { Term } from "../types";

export function useCreateTerm() {
  const queryClient = useQueryClient();

  return useMutation<Term, Error, CreateTermInput>({
    mutationFn: (input) => createTerm(input),
    onSuccess: (term) => {
      queryClient.invalidateQueries({
        queryKey: contentKeys.termsByTaxonomy(term.taxonomy?.id),
      });
      toast.success("Term created");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create term");
    },
  });
}
