'use server';

import { revalidatePath } from 'next/cache';
import { client } from '@/lib/api/client';

export async function createTemplate(data: { name: string; slug: string; description?: string; thumbnail?: string; htmlTemplate: string; cssTemplate?: string; slots?: string[]; featured?: boolean }) {
  try {
    const res = await client.api.templates.$post({ json: data });
    const data_ = await res.json();
    if (data_.success) {
      revalidatePath('/admin/templates');
      return { success: true, data: data_.data };
    }
    return { success: false, error: data_.error?.message || 'Failed to create template' };
  } catch (_err) {
    return { success: false, error: 'Network error' };
  }
}

export async function updateTemplate(id: string, data: { name?: string; slug?: string; description?: string; thumbnail?: string; htmlTemplate?: string; cssTemplate?: string; slots?: string[]; featured?: boolean }) {
  try {
    const res = await client.api.templates[':id'].$patch({
      param: { id },
      json: data,
    });
    const data_ = await res.json();
    if (data_.success) {
      revalidatePath('/admin/templates');
      return { success: true, data: data_.data };
    }
    return { success: false, error: data_.error?.message || 'Failed to update template' };
  } catch (_err) {
    return { success: false, error: 'Network error' };
  }
}

export async function deleteTemplate(id: string) {
  try {
    const res = await client.api.templates[':id'].$delete({ param: { id } });
    const data_ = await res.json();
    if (data_.success) {
      revalidatePath('/admin/templates');
      return { success: true };
    }
    return { success: false, error: data_.error?.message || 'Failed to delete template' };
  } catch (_err) {
    return { success: false, error: 'Network error' };
  }
}
