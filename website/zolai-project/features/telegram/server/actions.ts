'use server';

import { revalidatePath } from 'next/cache';
import { client } from '@/lib/api/client';

export async function unlinkTelegram() {
  try {
    const res = await client.api.telegram.unlink.$post();
    const data = await res.json();
    if (data.success) {
      revalidatePath('/settings/telegram');
      return { success: true };
    }
    return { success: false, error: data.error?.message || 'Failed to unlink Telegram' };
  } catch (_err) {
    return { success: false, error: 'Network error' };
  }
}

export async function setTelegramCommands() {
  try {
    const res = await client.api.telegram.commands.$get();
    const data = await res.json();
    if (data.success) {
      return { success: true, data: data.data };
    }
    return { success: false, error: data.error?.message || 'Failed to set Telegram commands' };
  } catch (_err) {
    return { success: false, error: 'Network error' };
  }
}
