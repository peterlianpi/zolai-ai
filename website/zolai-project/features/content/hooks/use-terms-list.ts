import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/api/client";
import { contentKeys } from "../keys";
import type { TermListResponse } from "../types";

export function useTermsList(params: { taxonomyId?: string; page?: number; limit?: number }) {
  return useQuery<TermListResponse>({
    queryKey: contentKeys.termsList(params),
    queryFn: async () => {
      const res = await client.api.content.terms.$get({
        query: {
          taxonomyId: params.taxonomyId ?? "",
          page: String(params.page ?? 1),
          limit: String(params.limit ?? 20),
        },
      });
      if (!res.ok) throw new Error("Failed to fetch terms");
      const json = (await res.json()) as { success?: boolean; data?: { terms?: TermListResponse["terms"]; meta?: TermListResponse["meta"] } };
      if (!json.success || !json.data?.terms || !json.data.meta) {
        return { terms: [], meta: { total: 0, page: 1, limit: params.limit ?? 20, totalPages: 1 } };
      }
      return { terms: json.data.terms, meta: json.data.meta };
    },
    enabled: !!params.taxonomyId,
    staleTime: 30_000,
  });
}
