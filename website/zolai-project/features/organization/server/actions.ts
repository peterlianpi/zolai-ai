'use server';

import { revalidatePath } from 'next/cache';
import { client } from '@/lib/api/client';

export async function createOrganization(data: { name: string; slug: string; logo?: string }) {
  try {
    const res = await client.api.organizations.$post({ json: data });
    const data_ = await res.json();
    if (data_.success) {
      revalidatePath('/settings/organizations');
      return { success: true, data: data_.data };
    }
    return { success: false, error: data_.error?.message || 'Failed to create organization' };
  } catch (_err) {
    return { success: false, error: 'Network error' };
  }
}

export async function inviteMember(data: { organizationId: string; email: string; role: string }) {
  try {
    const res = await client.api.organizations.invite.$post({ json: data });
    const data_ = await res.json();
    if (data_.success) {
      revalidatePath(`/settings/organizations/${data.organizationId}`);
      return { success: true, data: data_.data };
    }
    return { success: false, error: data_.error?.message || 'Failed to invite member' };
  } catch (_err) {
    return { success: false, error: 'Network error' };
  }
}

export async function updateMemberRole(memberId: string, role: string) {
  try {
    const res = await client.api.organizations.members[":id"].$patch({
      param: { id: memberId },
      json: { role },
    });
    const data_ = await res.json();
    if (data_.success) {
      revalidatePath('/settings/organizations');
      return { success: true, data: data_.data };
    }
    return { success: false, error: data_.error?.message || 'Failed to update member role' };
  } catch (_err) {
    return { success: false, error: 'Network error' };
  }
}

export async function removeMember(memberId: string) {
  try {
    const res = await client.api.organizations.members[":id"].$delete({ param: { id: memberId } });
    const data_ = await res.json();
    if (data_.success) {
      revalidatePath('/settings/organizations');
      return { success: true };
    }
    return { success: false, error: data_.error?.message || 'Failed to remove member' };
  } catch (_err) {
    return { success: false, error: 'Network error' };
  }
}

export async function switchOrganization(organizationId: string) {
  try {
    const res = await client.api.organizations.switch.$post({ json: { organizationId } });
    const data_ = await res.json();
    if (data_.success) {
      revalidatePath('/settings/organizations');
      return { success: true, data: data_.data };
    }
    return { success: false, error: data_.error?.message || 'Failed to switch organization' };
  } catch (_err) {
    return { success: false, error: 'Network error' };
  }
}
