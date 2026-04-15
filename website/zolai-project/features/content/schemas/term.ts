import { z } from "zod";

export const createTermSchema = z.object({
  taxonomyId: z.string().cuid(),
  slug: z.string().min(1).max(200),
  name: z.string().min(1).max(200),
  description: z.string().max(1000).optional().nullable(),
  parentTermId: z.string().cuid().optional().nullable(),
});

export const updateTermSchema = createTermSchema.partial();

export const termListQuerySchema = z.object({
  taxonomyId: z.string().cuid().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(50),
});

export type CreateTermInput = z.infer<typeof createTermSchema>;
export type UpdateTermInput = z.infer<typeof updateTermSchema>;
