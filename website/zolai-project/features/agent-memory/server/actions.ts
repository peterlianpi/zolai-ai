'use server';

import { revalidatePath } from 'next/cache';
import { client } from '@/lib/api/client';

export async function saveAgentMemory(userId: string, agentId: string, key: string, value: unknown, ttlHours?: number) {
  try {
    const res = await client.api.agent-memory.$put({
      json: { userId, agentId, key, value, ttlHours },
    });
    const data = await res.json();
    if (data.success) {
      revalidatePath('/settings/agent-memory');
      return { success: true, data: data.data };
    }
    return { success: false, error: data.error?.message || 'Failed to save agent memory' };
  } catch (_err) {
    return { success: false, error: 'Network error' };
  }
}

export async function logAgentLearning(agentId: string, taskType: string, input?: unknown, output?: unknown, feedback?: string, lesson?: string) {
  try {
    const res = await client.api.agent-memory.learn.$post({
      json: { agentId, taskType, input, output, feedback, lesson },
    });
    const data = await res.json();
    if (data.success) {
      revalidatePath('/admin/agent-memory');
      return { success: true, data: data.data };
    }
    return { success: false, error: data.error?.message || 'Failed to log agent learning' };
  } catch (_err) {
    return { success: false, error: 'Network error' };
  }
}
