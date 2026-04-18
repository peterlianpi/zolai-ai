'use server';

import { revalidatePath } from 'next/cache';
import { client } from '@/lib/api/client';

export async function submitLessonProgress(lessonId: string, score: number, userId: string) {
  try {
    const res = await client.api.lessons.progress.$post({
      json: { lessonId, score, userId },
    });
    const data = await res.json();
    if (data.success) {
      revalidatePath('/learn');
      return { success: true, data: data.data };
    }
    return { success: false, error: data.error?.message || 'Failed to submit lesson progress' };
  } catch (_err) {
    return { success: false, error: 'Network error' };
  }
}
