import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/api/client";
import type { Taxonomy } from "../types";
import { contentKeys } from "../keys";

export function useTaxonomies() {
  return useQuery<Taxonomy[]>({
    queryKey: contentKeys.taxonomies(),
    queryFn: async () => {
      const res = await client.api.content.taxonomies.$get();
      if (!res.ok) throw new Error("Failed to fetch taxonomies");
      const json = (await res.json()) as { success?: boolean; data?: Array<{ id: string; slug: string; name: string; _count?: { terms?: number } }> };
      if (!json.success || !json.data) return [];
      return json.data.map((t) => ({ id: t.id, slug: t.slug, name: t.name, termCount: t._count?.terms }));
    },
    staleTime: 30_000,
  });
}
