'use server';

import { revalidatePath } from 'next/cache';
import { client } from '@/lib/api/client';

export async function uploadAudio(wordId: string, audioUrl: string) {
  try {
    const res = await client.api.audio-pronunciation.upload.$post({
      json: { wordId, audioUrl },
    });
    const data = await res.json();
    if (data.success) {
      revalidatePath('/audio');
      return { success: true, data: data.data };
    }
    return { success: false, error: data.error?.message || 'Failed to upload audio' };
  } catch (_err) {
    return { success: false, error: 'Network error' };
  }
}
