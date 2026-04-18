import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { client } from "@/lib/api/client";
import { mediaKeys } from "../keys";
import type { UploadedMedia } from "../types";

export function useUploadMedia() {
  const queryClient = useQueryClient();
  return useMutation<UploadedMedia, Error, File>({
    mutationFn: async (file) => {
      const res = await client.api.upload.$post({ form: { file } });
      const json = (await res.json()) as { success?: boolean; data?: UploadedMedia; error?: { message?: string } };
      if (!res.ok || !json.success || !json.data) throw new Error(json.error?.message || "Upload failed");
      return json.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: mediaKeys.all }),
    onError: (error) => toast.error(error.message || "Upload failed"),
  });
}
