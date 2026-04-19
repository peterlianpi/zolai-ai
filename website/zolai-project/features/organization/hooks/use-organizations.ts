import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { client } from "@/lib/api/client";
import type { CreateOrganizationData, InviteMemberData, MemberWithUser, OrganizationWithStats, OrganizationRole } from "../types";

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

interface ErrorResponse {
  error?: { message: string };
}

// API helper functions using Hono client
async function fetchOrganizations(isAdmin = false) {
  const res = await client.api.organizations.$get({ query: isAdmin ? { admin: "true" } : undefined });
  if (!res.ok) {
    throw new Error('Failed to fetch organizations');
  }
  const json = (await res.json()) as ApiResponse<unknown>;
  return json.data as OrganizationWithStats[];
}

async function fetchOrganizationMembers(organizationId: string) {
  const res = await client.api.organizations[":id"].members.$get({ param: { id: organizationId } });
  if (!res.ok) {
    throw new Error('Failed to fetch organization members');
  }
  const json = (await res.json()) as ApiResponse<unknown>;
  return json.data as MemberWithUser[];
}

async function createOrganizationApi(data: CreateOrganizationData) {
  const res = await client.api.organizations.$post({ json: data });
  if (!res.ok) {
    const json = (await res.json()) as ErrorResponse;
    throw new Error(json.error?.message || 'Failed to create organization');
  }
  const json = (await res.json()) as ApiResponse<unknown>;
  return json.data;
}

async function inviteMemberApi(data: InviteMemberData) {
  const res = await client.api.organizations.invite.$post({ json: data });
  if (!res.ok) {
    const json = (await res.json()) as ErrorResponse;
    throw new Error(json.error?.message || 'Failed to invite member');
  }
  const json = (await res.json()) as ApiResponse<unknown>;
  return json.data;
}

async function updateMemberRoleApi(memberId: string, role: Extract<OrganizationRole, "owner" | "admin" | "member">) {
  const res = await client.api.organizations.members[":id"].$patch({ 
    param: { id: memberId },
    json: { role }
  });
  if (!res.ok) {
    const json = (await res.json()) as ErrorResponse;
    throw new Error(json.error?.message || 'Failed to update member role');
  }
  const json = (await res.json()) as ApiResponse<unknown>;
  return json.data;
}

async function removeMemberApi(memberId: string) {
  const res = await client.api.organizations.members[":id"].$delete({ param: { id: memberId } });
  if (!res.ok) {
    const json = (await res.json()) as ErrorResponse;
    throw new Error(json.error?.message || 'Failed to remove member');
  }
  const json = (await res.json()) as ApiResponse<unknown>;
  return json.data;
}

async function switchOrganizationApi(organizationId: string) {
  const res = await client.api.organizations.switch.$post({ json: { organizationId } });
  if (!res.ok) {
    const json = (await res.json()) as ErrorResponse;
    throw new Error(json.error?.message || 'Failed to switch organization');
  }
  const json = (await res.json()) as ApiResponse<unknown>;
  return json.data;
}

// Hooks

// Get all organizations (admin view)
export function useOrganizations() {
  return useQuery({
    queryKey: ["organizations", "admin"],
    queryFn: () => fetchOrganizations(true),
  });
}

// Get current user's organizations
export function useUserOrganizations() {
  return useQuery({
    queryKey: ["organizations", "user"],
    queryFn: () => fetchOrganizations(false),
  });
}

// Get organization members
export function useOrganizationMembers(organizationId: string) {
  return useQuery({
    queryKey: ["organization-members", organizationId],
    queryFn: () => fetchOrganizationMembers(organizationId),
    enabled: !!organizationId,
  });
}

// Create organization mutation
export function useCreateOrganization() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateOrganizationData) => createOrganizationApi(data),
    onSuccess: () => {
      toast.success("Organization created successfully");
      queryClient.invalidateQueries({ queryKey: ["organizations"] });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

// Invite member mutation
export function useInviteMember() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: InviteMemberData) => inviteMemberApi(data),
    onSuccess: (_, variables) => {
      toast.success("Member invitation sent successfully");
      queryClient.invalidateQueries({ 
        queryKey: ["organization-members", variables.organizationId] 
      });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

// Update member role mutation
export function useUpdateMemberRole() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ memberId, role }: { memberId: string; role: Extract<OrganizationRole, "owner" | "admin" | "member"> }) => 
      updateMemberRoleApi(memberId, role),
    onSuccess: () => {
      toast.success("Member role updated successfully");
      queryClient.invalidateQueries({ queryKey: ["organization-members"] });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

// Remove member mutation
export function useRemoveMember() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (memberId: string) => removeMemberApi(memberId),
    onSuccess: () => {
      toast.success("Member removed successfully");
      queryClient.invalidateQueries({ queryKey: ["organization-members"] });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

// Switch organization mutation
export function useSwitchOrganization() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (organizationId: string) => switchOrganizationApi(organizationId),
    onSuccess: () => {
      toast.success("Organization switched successfully");
      queryClient.invalidateQueries({ queryKey: ["organizations"] });
      // Refresh the page or trigger a re-render to update the session
      window.location.reload();
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}
