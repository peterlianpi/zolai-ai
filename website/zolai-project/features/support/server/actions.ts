'use server';

import { client } from '@/lib/api/client';

export async function submitSupportTicket(data: { name: string; email: string; subject: string; category: string; message: string }) {
  try {
    const res = await client.api.support.$post({ json: data });
    const data_ = await res.json();
    return { success: true, data: data_.data };
  } catch (_err) {
    return { success: false, error: 'Network error' };
  }
}
