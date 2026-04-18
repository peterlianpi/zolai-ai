'use server';

import { revalidatePath } from 'next/cache';
import { client } from '@/lib/api/client';

export async function completeLesson(slug: string) {
  try {
    const res = await client.api.grammar.lessons[':slug']['complete'].$post({ param: { slug } });
    const data = await res.json();
    if (data.success) {
      revalidatePath('/grammar');
      return { success: true, data: data.data };
    }
    return { success: false, error: data.error?.message || 'Failed to complete lesson' };
  } catch (_err) {
    return { success: false, error: 'Network error' };
  }
}
