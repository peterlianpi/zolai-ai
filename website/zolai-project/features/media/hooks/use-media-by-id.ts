import { useQuery } from "@tanstack/react-query";
import { getMediaById } from "../api";
import { mediaKeys } from "../keys";

export function useMediaById(id?: string | null) {
  return useQuery({
    queryKey: id ? mediaKeys.detail(id) : mediaKeys.detail("none"),
    queryFn: () => getMediaById(id ?? ""),
    enabled: !!id,
    staleTime: 30_000,
  });
}
