'use server';

import { revalidatePath } from 'next/cache';
import { client } from '@/lib/api/client';

export async function updateProfile(data: { name?: string; email?: string }) {
  try {
    const res = await client.api.profile.$patch({ json: data });
    const data_ = await res.json();
    if (data_.success) {
      revalidatePath('/settings/profile');
      return { success: true, data: data_.data };
    }
    return { success: false, error: data_.error?.message || 'Failed to update profile' };
  } catch (_err) {
    return { success: false, error: 'Network error' };
  }
}
