'use server';

import { revalidatePath } from 'next/cache';
import { client } from '@/lib/api/client';

export async function createTrainingRun(data: { name: string; model?: string; notes?: string }) {
  try {
    const res = await client.api.zolai.training.$post({ json: data });
    const data_ = await res.json();
    if (data_.success) {
      revalidatePath('/training');
      return { success: true, data: data_.data };
    }
    return { success: false, error: data_.error?.message || 'Failed to create training run' };
  } catch (_err) {
    return { success: false, error: 'Network error' };
  }
}

export async function updateTrainingRun(id: string, data: { status?: string; steps?: number; maxSteps?: number; lossJson?: string }) {
  try {
    const res = await client.api.zolai.training[':id'].$patch({
      param: { id },
      json: data,
    });
    const data_ = await res.json();
    if (data_.success) {
      revalidatePath('/training');
      return { success: true, data: data_.data };
    }
    return { success: false, error: data_.error?.message || 'Failed to update training run' };
  } catch (_err) {
    return { success: false, error: 'Network error' };
  }
}

export async function deleteChatSession(id: string) {
  try {
    const res = await client.api.zolai.sessions[':id'].$delete({ param: { id } });
    const data_ = await res.json();
    if (data_.success) {
      revalidatePath('/chat');
      return { success: true };
    }
    return { success: false, error: data_.error?.message || 'Failed to delete chat session' };
  } catch (_err) {
    return { success: false, error: 'Network error' };
  }
}
