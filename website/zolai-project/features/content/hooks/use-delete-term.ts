import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { client } from "@/lib/api/client";
import { contentKeys } from "../keys";

export function useDeleteTerm() {
  const queryClient = useQueryClient();
  return useMutation<void, Error, { id: string; taxonomyId?: string }>({
    mutationFn: async ({ id }) => {
      const res = await client.api.content.terms[":id"].$delete({ param: { id } });
      const json = (await res.json()) as { success?: boolean; error?: { message?: string } };
      if (!res.ok || !json.success) throw new Error(json.error?.message || "Failed to delete term");
    },
    onSuccess: (_, { taxonomyId }) => {
      queryClient.invalidateQueries({ queryKey: contentKeys.terms() });
      queryClient.invalidateQueries({ queryKey: contentKeys.termsByTaxonomy(taxonomyId) });
      toast.success("Term deleted");
    },
    onError: (error) => toast.error(error.message || "Failed to delete term"),
  });
}
