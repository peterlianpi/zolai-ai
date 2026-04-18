'use server';

import { revalidatePath } from 'next/cache';
import { client } from '@/lib/api/client';

export async function deleteRedirect(id: string) {
  try {
    const res = await client.api.redirects[":id"].$delete({ param: { id } });
    const data = await res.json();
    if (data.success) {
      revalidatePath('/admin/redirects');
      return { success: true };
    }
    return { success: false, error: data.error?.message || 'Failed to delete redirect' };
  } catch (_err) {
    return { success: false, error: 'Network error' };
  }
}
