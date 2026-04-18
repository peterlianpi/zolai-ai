'use server';

import { client } from '@/lib/api/client';

export async function translate(text: string, from: string, to: string) {
  try {
    const res = await client.api.translation-tools.translate.$get({
      query: { text, from, to },
    });
    const data = await res.json();
    return { success: true, data: data.data };
  } catch (_err) {
    return { success: false, error: 'Network error' };
  }
}

export async function suggest(text: string, limit?: number, lang?: string) {
  try {
    const res = await client.api.translation-tools.suggest.$get({
      query: { text, limit: String(limit ?? 5), lang: lang ?? 'both' },
    });
    const data = await res.json();
    return { success: true, data: data.data };
  } catch (_err) {
    return { success: false, error: 'Network error' };
  }
}
