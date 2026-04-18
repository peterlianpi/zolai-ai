'use server';

import { revalidatePath } from 'next/cache';
import { client } from '@/lib/api/client';

export async function markNotificationAsRead(notificationId: string) {
  try {
    const res = await client.api.notifications[':notificationId'].$patch({
      param: { notificationId },
      json: { read: true },
    });
    const data = await res.json();
    if (data.success) {
      revalidatePath('/notifications');
      return { success: true };
    }
    return { success: false, error: data.error?.message || 'Failed to mark as read' };
  } catch (_err) {
    return { success: false, error: 'Network error' };
  }
}

export async function markAllNotificationsAsRead() {
  try {
    const res = await client.api.notifications['mark-all'].$patch();
    const data = await res.json();
    if (data.success) {
      revalidatePath('/notifications');
      return { success: true };
    }
    return { success: false, error: data.error?.message || 'Failed to mark all as read' };
  } catch (_err) {
    return { success: false, error: 'Network error' };
  }
}
