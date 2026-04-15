import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { uploadMedia } from "../api";
import { mediaKeys } from "../keys";

export function useUploadMedia() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (file: File) => uploadMedia(file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: mediaKeys.all });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Upload failed");
    },
  });
}
