'use server';

import { revalidatePath } from 'next/cache';
import { client } from '@/lib/api/client';

export async function updateSiteSetting(key: string, value: string) {
  try {
    const res = await client.api.admin["site-settings"].$put({
      json: { key, value },
    });
    const data = await res.json();
    if (data.success) {
      revalidatePath('/admin/site-settings');
      return { success: true, data: data.data };
    }
    return { success: false, error: data.error?.message || 'Failed to update site setting' };
  } catch (_err) {
    return { success: false, error: 'Network error' };
  }
}
