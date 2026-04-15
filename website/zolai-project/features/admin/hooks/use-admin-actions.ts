import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { client } from "@/lib/api/client";

async function handleApiResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const json = (await response.json()) as { error?: { message: string } };
    throw new Error(json.error?.message || "API request failed");
  }
  return response.json() as Promise<T>;
}

export function useBanUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId: string) => {
      const response = await client.api.admin.users[":id"].ban.$post({
        param: { id: userId },
      });
      return handleApiResponse<{ id: string }>(response);
    },
    onSuccess: () => {
      toast.success("User has been banned");
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      queryClient.invalidateQueries({ queryKey: ["admin-users-infinite"] });
      queryClient.invalidateQueries({ queryKey: ["admin-users-normal"] });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useUnbanUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId: string) => {
      const response = await client.api.admin.users[":id"].unban.$post({
        param: { id: userId },
      });
      return handleApiResponse<{ id: string }>(response);
    },
    onSuccess: () => {
      toast.success("User has been unbanned");
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      queryClient.invalidateQueries({ queryKey: ["admin-users-infinite"] });
      queryClient.invalidateQueries({ queryKey: ["admin-users-normal"] });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId: string) => {
      const response = await client.api.admin.users[":id"].$delete({
        param: { id: userId },
      });
      return handleApiResponse<{ id: string }>(response);
    },
    onSuccess: () => {
      toast.success("User has been deleted");
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      queryClient.invalidateQueries({ queryKey: ["admin-users-infinite"] });
      queryClient.invalidateQueries({ queryKey: ["admin-users-normal"] });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function usePublishPost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (postId: string) => {
      const response = await client.api.admin.posts[":id"].publish.$post({
        param: { id: postId },
      });
      return handleApiResponse<{ id: string }>(response);
    },
    onSuccess: () => {
      toast.success("Post published successfully");
      queryClient.invalidateQueries({ queryKey: ["admin-posts"] });
      queryClient.invalidateQueries({ queryKey: ["admin-resources-infinite"] });
      queryClient.invalidateQueries({ queryKey: ["admin-resources-normal"] });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useUnpublishPost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (postId: string) => {
      const response = await client.api.admin.posts[":id"].unpublish.$post({
        param: { id: postId },
      });
      return handleApiResponse<{ id: string }>(response);
    },
    onSuccess: () => {
      toast.success("Post unpublished successfully");
      queryClient.invalidateQueries({ queryKey: ["admin-posts"] });
      queryClient.invalidateQueries({ queryKey: ["admin-resources-infinite"] });
      queryClient.invalidateQueries({ queryKey: ["admin-resources-normal"] });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useDeletePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (postId: string) => {
      const response = await client.api.admin.posts[":id"].$delete({
        param: { id: postId },
      });
      return handleApiResponse<{ id: string }>(response);
    },
    onSuccess: () => {
      toast.success("Post deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["admin-posts"] });
      queryClient.invalidateQueries({ queryKey: ["admin-resources-infinite"] });
      queryClient.invalidateQueries({ queryKey: ["admin-resources-normal"] });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useDeleteMedia() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (mediaId: string) => {
      const response = await client.api.admin.media[":id"].$delete({
        param: { id: mediaId },
      });
      return handleApiResponse<{ id: string }>(response);
    },
    onSuccess: () => {
      toast.success("Media deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["admin-media"] });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}
