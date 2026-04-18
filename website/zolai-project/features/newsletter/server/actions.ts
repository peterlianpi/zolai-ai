'use server';

import { revalidatePath } from 'next/cache';
import { client } from '@/lib/api/client';

export async function subscribe(input: { email: string; name?: string; source?: string }) {
  try {
    const res = await client.api.newsletter.subscribe.$post({ json: input });
    const data = await res.json();
    if (data.success) {
      revalidatePath('/newsletter');
      return { success: true, data: data.data };
    }
    return { success: false, error: data.error?.message || 'Failed to subscribe' };
  } catch (_err) {
    return { success: false, error: 'Network error' };
  }
}

export async function confirmSubscription(token: string) {
  try {
    const res = await client.api.newsletter.confirm[":token"].$get({ param: { token } });
    const data = await res.json();
    if (data.success) {
      revalidatePath('/newsletter');
      return { success: true, data: data.data };
    }
    return { success: false, error: data.error?.message || 'Failed to confirm subscription' };
  } catch (_err) {
    return { success: false, error: 'Network error' };
  }
}

export async function unsubscribe(email: string, token?: string) {
  try {
    const res = await client.api.newsletter.unsubscribe.$post({ json: { email, token } });
    const data = await res.json();
    if (data.success) {
      revalidatePath('/newsletter');
      return { success: true, data: data.data };
    }
    return { success: false, error: data.error?.message || 'Failed to unsubscribe' };
  } catch (_err) {
    return { success: false, error: 'Network error' };
  }
}
