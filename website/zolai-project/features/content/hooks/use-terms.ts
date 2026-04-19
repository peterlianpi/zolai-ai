import { useQuery } from "@tanstack/react-query";
import { listTerms } from "../api";
import type { TermListResponse } from "../types";
import { contentKeys } from "../keys";

export function useTerms(taxonomyId?: string | null) {
  return useQuery<TermListResponse>({
    queryKey: contentKeys.termsByTaxonomy(taxonomyId ?? null),
    queryFn: () =>
      listTerms({
        taxonomyId: taxonomyId ?? "",
        page: 1,
        limit: 100,
      }),
    enabled: !!taxonomyId,
    staleTime: 30_000,
  });
}
