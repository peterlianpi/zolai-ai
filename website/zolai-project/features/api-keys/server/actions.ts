'use server';

import { revalidatePath } from 'next/cache';
import { client } from '@/lib/api/client';

export async function createApiKey(name: string, expiresAt?: string) {
  try {
    const res = await client.api.api-keys.$post({
      json: { name, expiresAt },
    });
    const data = await res.json();
    if (data.success) {
      revalidatePath('/settings/api-keys');
      return { success: true, data: data.data };
    }
    return { success: false, error: data.error?.message || 'Failed to create API key' };
  } catch (_err) {
    return { success: false, error: 'Network error' };
  }
}

export async function updateApiKey(id: string, data: { name?: string; isActive?: boolean }) {
  try {
    const res = await client.api.api-keys[':id'].$patch({
      param: { id },
      json: data,
    });
    const data_ = await res.json();
    if (data_.success) {
      revalidatePath('/settings/api-keys');
      return { success: true, data: data_.data };
    }
    return { success: false, error: data_.error?.message || 'Failed to update API key' };
  } catch (_err) {
    return { success: false, error: 'Network error' };
  }
}

export async function deleteApiKey(id: string) {
  try {
    const res = await client.api.api-keys[':id'].$delete({ param: { id } });
    const data_ = await res.json();
    if (data_.success) {
      revalidatePath('/settings/api-keys');
      return { success: true };
    }
    return { success: false, error: data_.error?.message || 'Failed to delete API key' };
  } catch (_err) {
    return { success: false, error: 'Network error' };
  }
}
