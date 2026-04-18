import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/api/client";
import type { TermListResponse } from "../types";
import { contentKeys } from "../keys";

export function useTerms(taxonomyId?: string | null) {
  return useQuery<TermListResponse>({
    queryKey: contentKeys.termsByTaxonomy(taxonomyId ?? null),
    queryFn: async () => {
      const res = await client.api.content.terms.$get({
        query: { taxonomyId: taxonomyId ?? "", page: "1", limit: "100" },
      });
      if (!res.ok) throw new Error("Failed to fetch terms");
      const json = (await res.json()) as { success?: boolean; data?: { terms?: TermListResponse["terms"]; meta?: TermListResponse["meta"] } };
      if (!json.success || !json.data?.terms || !json.data.meta) {
        return { terms: [], meta: { total: 0, page: 1, limit: 100, totalPages: 1 } };
      }
      return { terms: json.data.terms, meta: json.data.meta };
    },
    enabled: !!taxonomyId,
    staleTime: 30_000,
  });
}
