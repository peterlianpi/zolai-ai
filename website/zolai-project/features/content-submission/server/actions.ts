'use server';

import { revalidatePath } from 'next/cache';
import { client } from '@/lib/api/client';

export async function submitForReview(id: string) {
  try {
    const res = await client.api.content-submission.submissions[':id']['submit-for-review'].$post({ param: { id } });
    const data = await res.json();
    if (data.success) {
      revalidatePath('/submit');
      return { success: true, data: data.data };
    }
    return { success: false, error: data.error?.message || 'Failed to submit for review' };
  } catch (_err) {
    return { success: false, error: 'Network error' };
  }
}

export async function approveSubmission(id: string) {
  try {
    const res = await client.api.content-submission.submissions[':id']['approve'].$post({ param: { id } });
    const data = await res.json();
    if (data.success) {
      revalidatePath('/admin/submissions');
      return { success: true, data: data.data };
    }
    return { success: false, error: data.error?.message || 'Failed to approve submission' };
  } catch (_err) {
    return { success: false, error: 'Network error' };
  }
}

export async function rejectSubmission(id: string, reason?: string) {
  try {
    const res = await client.api.content-submission.submissions[':id']['reject'].$post({
      param: { id },
      json: { reason },
    });
    const data = await res.json();
    if (data.success) {
      revalidatePath('/admin/submissions');
      return { success: true, data: data.data };
    }
    return { success: false, error: data.error?.message || 'Failed to reject submission' };
  } catch (_err) {
    return { success: false, error: 'Network error' };
  }
}
