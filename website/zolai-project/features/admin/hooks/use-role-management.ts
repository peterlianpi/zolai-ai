import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { client } from "@/lib/api/client";

type Role = "user" | "contributor" | "author" | "editor" | "admin" | "superAdmin" | "moderator" | "contentAdmin" | "viewer";
export interface UpdateUserRoleRequest { userId: string; role: Role; reason?: string }
export interface BulkRoleUpdateRequest { userIds: string[]; role: Role; reason?: string }

export function useRoleMetrics() {
  return useQuery({
    queryKey: ["admin-role-metrics"],
    queryFn: async () => {
      const res = await client.api.roles.metrics.$get();
      if (!res.ok) throw new Error("Failed to fetch role metrics");
      const json = await res.json() as unknown as { success: boolean; data: { roleDistribution: Record<string, number>; roleChangesLast30Days: number; recentRoleChanges: { id: string; userId: string; oldRole: string; newRole: string; changedAt: string }[] } };
      return json;
    },
  });
}

export function useUpdateUserRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (request: UpdateUserRoleRequest) => {
      const res = await client.api.roles["update-role"].$post({ json: request });
      if (!res.ok) throw new Error("Failed to update user role");
      return res.json() as Promise<{ data: { message: string } }>;
    },
    onSuccess: (response) => {
      toast.success((response as { data: { message: string } }).data.message);
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      queryClient.invalidateQueries({ queryKey: ["admin-role-metrics"] });
    },
    onError: (error: Error) => { toast.error(error.message || "Failed to update role"); },
  });
}

export function useBulkUpdateUserRoles() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (request: BulkRoleUpdateRequest) => {
      const res = await client.api.roles["bulk-update-role"].$post({ json: request });
      if (!res.ok) throw new Error("Failed to bulk update user roles");
      return res.json() as Promise<{ data: { message: string } }>;
    },
    onSuccess: (response) => {
      toast.success((response as { data: { message: string } }).data.message);
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      queryClient.invalidateQueries({ queryKey: ["admin-role-metrics"] });
    },
    onError: (error: Error) => { toast.error(error.message || "Failed to bulk update roles"); },
  });
}
