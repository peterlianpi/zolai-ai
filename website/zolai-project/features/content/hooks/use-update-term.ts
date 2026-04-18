import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { client } from "@/lib/api/client";
import { contentKeys } from "../keys";
import type { UpdateTermInput } from "../schemas/term";
import type { Term } from "../types";

export function useUpdateTerm() {
  const queryClient = useQueryClient();
  return useMutation<Term, Error, { id: string; data: UpdateTermInput }>({
    mutationFn: async ({ id, data }) => {
      const res = await client.api.content.terms[":id"].$patch({ param: { id }, json: data });
      const json = (await res.json()) as { success?: boolean; data?: Term; error?: { message?: string } };
      if (!res.ok || !json.success || !json.data) throw new Error(json.error?.message || "Failed to update term");
      return json.data;
    },
    onSuccess: (term) => {
      queryClient.invalidateQueries({ queryKey: contentKeys.terms() });
      queryClient.invalidateQueries({ queryKey: contentKeys.termsByTaxonomy(term.taxonomy?.id) });
      toast.success("Term updated");
    },
    onError: (error) => toast.error(error.message || "Failed to update term"),
  });
}
