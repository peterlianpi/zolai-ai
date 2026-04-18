'use server';

import { revalidatePath } from 'next/cache';
import { client } from '@/lib/api/client';

export async function createPost(data: { title: string; content: string; category?: string; tags?: string[] }) {
  try {
    const res = await client.api.forum.posts.$post({ json: data });
    const data_ = await res.json();
    if (data_.success) {
      revalidatePath('/forum');
      return { success: true, data: data_.data };
    }
    return { success: false, error: data_.error?.message || 'Failed to create post' };
  } catch (_err) {
    return { success: false, error: 'Network error' };
  }
}
