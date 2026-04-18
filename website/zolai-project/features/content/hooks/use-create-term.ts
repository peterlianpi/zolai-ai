import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { client } from "@/lib/api/client";
import { contentKeys } from "../keys";
import type { CreateTermInput } from "../schemas/term";
import type { Term } from "../types";

export function useCreateTerm() {
  const queryClient = useQueryClient();
  return useMutation<Term, Error, CreateTermInput>({
    mutationFn: async (input) => {
      const res = await client.api.content.terms.$post({ json: input });
      const json = (await res.json()) as { success?: boolean; data?: Term; error?: { message?: string } };
      if (!res.ok || !json.success || !json.data) throw new Error(json.error?.message || "Failed to create term");
      return json.data;
    },
    onSuccess: (term) => {
      queryClient.invalidateQueries({ queryKey: contentKeys.termsByTaxonomy(term.taxonomy?.id) });
      toast.success("Term created");
    },
    onError: (error) => toast.error(error.message || "Failed to create term"),
  });
}
