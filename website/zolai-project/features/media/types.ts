import type { PaginationMeta } from "@/lib/types/api";
import type { SerializedPrismaModelPick } from "@/lib/types/models";

export type MediaItem = SerializedPrismaModelPick<
  "media",
  "id" | "url" | "mimeType" | "altText" | "filePath" | "fileSize" | "createdAt" | "width" | "height"
>;

export type MediaListMeta = PaginationMeta;

export interface MediaListResponse {
  media: MediaItem[];
  meta: MediaListMeta;
}

export interface UploadedMedia {
  id: string;
  url: string;
  mimeType: string;
  size: number;
  width?: number;
  height?: number;
  publicId: string;
}
