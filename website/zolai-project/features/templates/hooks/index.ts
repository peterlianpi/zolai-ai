import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { client } from "@/lib/api/client";
import { toast } from "sonner";

export const templateKeys = {
  all: ["templates"] as const,
  lists: () => [...templateKeys.all, "list"] as const,
  list: (filters?: Record<string, unknown>) => [...templateKeys.lists(), filters] as const,
  details: () => [...templateKeys.all, "detail"] as const,
  detail: (id: string) => [...templateKeys.details(), id] as const,
};

export function useTemplates() {
  return useQuery({
    queryKey: templateKeys.lists(),
    queryFn: async () => {
      const res = await client.api.templates.$get();
      if (!res.ok) throw new Error("Failed to fetch templates");
      return res.json();
    },
  });
}

export function useTemplate(id: string) {
  return useQuery({
    queryKey: templateKeys.detail(id),
    queryFn: async () => {
      const res = await client.api.templates[":id"].$get({ param: { id } });
      if (!res.ok) throw new Error("Failed to fetch template");
      return res.json();
    },
    enabled: !!id,
  });
}

export function useCreateTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      name: string;
      slug: string;
      description?: string;
      thumbnail?: string;
      htmlTemplate: string;
      cssTemplate?: string;
      slots?: string[];
      featured?: boolean;
    }) => {
      const res = await client.api.templates.$post({ json: data });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error?.message || "Failed to create template");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: templateKeys.lists() });
      toast.success("Template created successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useUpdateTemplate(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Partial<{
      name: string;
      slug: string;
      description?: string;
      thumbnail?: string;
      htmlTemplate: string;
      cssTemplate?: string;
      slots?: string[];
      featured?: boolean;
    }>) => {
      const res = await client.api.templates[":id"].$patch({ param: { id }, json: data });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error?.message || "Failed to update template");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: templateKeys.lists() });
      queryClient.invalidateQueries({ queryKey: templateKeys.detail(id) });
      toast.success("Template updated successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useDeleteTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await client.api.templates[":id"].$delete({ param: { id } });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error?.message || "Failed to delete template");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: templateKeys.lists() });
      toast.success("Template deleted successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}
