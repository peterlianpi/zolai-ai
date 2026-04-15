import { client } from "@/lib/api/client";
import type { MediaListResponse, UploadedMedia, MediaItem } from "../types";

export async function listMedia(params: {
  page?: number;
  limit?: number;
  mimeType?: string;
}): Promise<MediaListResponse> {
  const response = await client.api.media.$get({
    query: {
      page: (params.page ?? 1).toString(),
      limit: (params.limit ?? 20).toString(),
      ...(params.mimeType ? { mimeType: params.mimeType } : {}),
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch media");
  }

  const json = (await response.json()) as {
    success?: boolean;
    data?: MediaItem[];  // API returns media items directly
    meta?: { total: number; page: number; limit: number; totalPages: number };
  };

  if (!json.success || !json.data || !json.meta) {
    return { media: [], meta: { total: 0, page: 1, limit: params.limit ?? 20, totalPages: 1 } };
  }

  // Transform API response to expected MediaListResponse format
  return { media: json.data, meta: json.meta };
}

export async function getMediaById(id: string): Promise<Pick<MediaItem, "id" | "url" | "altText"> | null> {
  const response = await client.api.media[":id"].$get({
    param: { id },
  });

  if (!response.ok) return null;

  const json = (await response.json()) as {
    success?: boolean;
    data?: { id: string; url: string; altText: string | null };
  };

  if (!json.success || !json.data) return null;
  return json.data;
}

export async function uploadMedia(file: File): Promise<UploadedMedia> {
  const response = await client.api.upload.$post({
    form: {
      file,
    },
  });

  const json = (await response.json()) as {
    success?: boolean;
    data?: UploadedMedia;
    error?: { message?: string };
  };

  if (!response.ok || !json.success || !json.data) {
    throw new Error(json.error?.message || "Upload failed");
  }

  return json.data;
}
