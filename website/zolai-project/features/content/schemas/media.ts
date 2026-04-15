import { z } from "zod";

export const createMediaSchema = z.object({
  url: z.string().url(),
  mimeType: z.string().min(1).max(100),
  altText: z.string().max(500).optional().nullable(),
  width: z.number().int().positive().optional().nullable(),
  height: z.number().int().positive().optional().nullable(),
  fileSize: z.number().int().positive().optional().nullable(),
});

export const updateMediaSchema = createMediaSchema.partial();

export type CreateMediaInput = z.infer<typeof createMediaSchema>;
export type UpdateMediaInput = z.infer<typeof updateMediaSchema>;
