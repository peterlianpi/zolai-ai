import { useQuery } from "@tanstack/react-query";
import { listTaxonomies } from "../api";
import type { Taxonomy } from "../types";
import { contentKeys } from "../keys";

export function useTaxonomies() {
  return useQuery<Taxonomy[]>({
    queryKey: contentKeys.taxonomies(),
    queryFn: () => listTaxonomies(),
    staleTime: 30_000,
  });
}
