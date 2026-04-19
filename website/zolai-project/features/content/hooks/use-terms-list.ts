import { useQuery } from "@tanstack/react-query";
import { listTerms } from "../api";
import { contentKeys } from "../keys";
import type { TermListResponse } from "../types";

export function useTermsList(params: {
  taxonomyId?: string;
  page?: number;
  limit?: number;
}) {
  return useQuery<TermListResponse>({
    queryKey: contentKeys.termsList(params),
    queryFn: () =>
      listTerms({
        taxonomyId: params.taxonomyId ?? "",
        page: params.page ?? 1,
        limit: params.limit ?? 20,
      }),
    enabled: !!params.taxonomyId,
    staleTime: 30_000,
  });
}
