'use server';

import { revalidatePath } from 'next/cache';
import { client } from '@/lib/api/client';

interface ProgressUpdates {
  subUnitId?: string;
  completed?: boolean;
  score: number;
  attempts?: number;
}

export async function updateProgress(updates: ProgressUpdates) {
  try {
    const res = await client.api.curriculum.progress.curriculum[':subUnitId'].$post({
      param: { subUnitId: updates.subUnitId ?? '' },
      json: {
        subUnitId: updates.subUnitId,
        completed: updates.completed ?? false,
        score: updates.score,
        attempts: updates.attempts ?? 1,
      },
    });
    const data = await res.json();
    if (data.success) {
      revalidatePath('/curriculum');
      return { success: true, data: data.data };
    }
    return { success: false, error: data.error?.message || 'Failed to update progress' };
  } catch (_err) {
    return { success: false, error: 'Network error' };
  }
}

export async function checkInStreak() {
  try {
    const res = await client.api.curriculum.streak['check-in'].$post();
    const data = await res.json();
    if (data.success) {
      revalidatePath('/curriculum');
      return { success: true, data: data.data };
    }
    return { success: false, error: data.error?.message || 'Failed to check in' };
  } catch (_err) {
    return { success: false, error: 'Network error' };
  }
}

export async function updatePhonicsProgress(updates: ProgressUpdates) {
  try {
    const res = await client.api.curriculum.progress.phonics[':phonicsSubUnitId'].$post({
      param: { phonicsSubUnitId: updates.subUnitId ?? '' },
      json: {
        phonicsSubUnitId: updates.subUnitId,
        completed: updates.completed ?? false,
        score: updates.score,
        attempts: updates.attempts ?? 1,
      },
    });
    const data = await res.json();
    if (data.success) {
      revalidatePath('/curriculum');
      return { success: true, data: data.data };
    }
    return { success: false, error: data.error?.message || 'Failed to update phonics progress' };
  } catch (_err) {
    return { success: false, error: 'Network error' };
  }
}
