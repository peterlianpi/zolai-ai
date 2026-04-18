'use server';

import { revalidatePath } from 'next/cache';
import { client } from '@/lib/api/client';

export async function replyToEmail(id: string, text: string, html?: string) {
  try {
    const res = await client.api.inbound-email[':id']['reply'].$post({
      param: { id },
      json: { text, html },
    });
    const data = await res.json();
    if (data.success) {
      revalidatePath('/admin/inbound-email');
      return { success: true };
    }
    return { success: false, error: data.error?.message || 'Failed to reply to email' };
  } catch (_err) {
    return { success: false, error: 'Network error' };
  }
}

export async function deleteEmail(id: string) {
  try {
    const res = await client.api.inbound-email[':id'].$delete({ param: { id } });
    const data = await res.json();
    if (data.success) {
      revalidatePath('/admin/inbound-email');
      return { success: true };
    }
    return { success: false, error: data.error?.message || 'Failed to delete email' };
  } catch (_err) {
    return { success: false, error: 'Network error' };
  }
}
