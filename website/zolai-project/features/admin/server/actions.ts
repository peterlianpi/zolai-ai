'use server';

import { revalidatePath } from 'next/cache';
import { client } from '@/lib/api/client';

export async function banUser(userId: string) {
  try {
    const res = await client.api.admin.users[":id"].ban.$post({ param: { id: userId } });
    const data = await res.json();
    if (data.success) {
      revalidatePath('/admin/users');
      return { success: true };
    }
    return { success: false, error: data.error?.message || 'Failed to ban user' };
  } catch (_err) {
    return { success: false, error: 'Network error' };
  }
}

export async function unbanUser(userId: string) {
  try {
    const res = await client.api.admin.users[":id"].unban.$post({ param: { id: userId } });
    const data = await res.json();
    if (data.success) {
      revalidatePath('/admin/users');
      return { success: true };
    }
    return { success: false, error: data.error?.message || 'Failed to unban user' };
  } catch (_err) {
    return { success: false, error: 'Network error' };
  }
}

export async function deleteUser(userId: string) {
  try {
    const res = await client.api.admin.users[":id"].$delete({ param: { id: userId } });
    const data = await res.json();
    if (data.success) {
      revalidatePath('/admin/users');
      return { success: true };
    }
    return { success: false, error: data.error?.message || 'Failed to delete user' };
  } catch (_err) {
    return { success: false, error: 'Network error' };
  }
}

export async function publishPost(postId: string) {
  try {
    const res = await client.api.admin.posts[":id"].publish.$post({ param: { id: postId } });
    const data = await res.json();
    if (data.success) {
      revalidatePath('/admin/posts');
      return { success: true };
    }
    return { success: false, error: data.error?.message || 'Failed to publish post' };
  } catch (_err) {
    return { success: false, error: 'Network error' };
  }
}

export async function unpublishPost(postId: string) {
  try {
    const res = await client.api.admin.posts[":id"].unpublish.$post({ param: { id: postId } });
    const data = await res.json();
    if (data.success) {
      revalidatePath('/admin/posts');
      return { success: true };
    }
    return { success: false, error: data.error?.message || 'Failed to unpublish post' };
  } catch (_err) {
    return { success: false, error: 'Network error' };
  }
}

export async function deletePost(postId: string) {
  try {
    const res = await client.api.admin.posts[":id"].$delete({ param: { id: postId } });
    const data = await res.json();
    if (data.success) {
      revalidatePath('/admin/posts');
      return { success: true };
    }
    return { success: false, error: data.error?.message || 'Failed to delete post' };
  } catch (_err) {
    return { success: false, error: 'Network error' };
  }
}

export async function deleteMedia(mediaId: string) {
  try {
    const res = await client.api.admin.media[":id"].$delete({ param: { id: mediaId } });
    const data = await res.json();
    if (data.success) {
      revalidatePath('/admin/media');
      return { success: true };
    }
    return { success: false, error: data.error?.message || 'Failed to delete media' };
  } catch (_err) {
    return { success: false, error: 'Network error' };
  }
}
