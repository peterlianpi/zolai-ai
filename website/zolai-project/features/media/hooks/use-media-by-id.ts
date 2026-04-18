import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/api/client";
import { mediaKeys } from "../keys";

export function useMediaById(id?: string | null) {
  return useQuery({
    queryKey: id ? mediaKeys.detail(id) : mediaKeys.detail("none"),
    queryFn: async () => {
      const res = await client.api.media[":id"].$get({ param: { id: id ?? "" } });
      if (!res.ok) return null;
      const json = (await res.json()) as { success?: boolean; data?: { id: string; url: string; altText: string | null } };
      return json.success && json.data ? json.data : null;
    },
    enabled: !!id,
    staleTime: 30_000,
  });
}
