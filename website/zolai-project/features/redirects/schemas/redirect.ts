import { z } from "zod";

export const createRedirectSchema = z.object({
  source: z.string().min(1).max(500),
  destination: z.string().min(1).max(500),
  statusCode: z.number().int().default(301),
  enabled: z.boolean().default(true),
});

export const updateRedirectSchema = createRedirectSchema.partial();

export const redirectListQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(50),
});

export const redirectLookupQuerySchema = z.object({
  url: z.string().min(1),
});

export type CreateRedirectInput = z.infer<typeof createRedirectSchema>;
export type UpdateRedirectInput = z.infer<typeof updateRedirectSchema>;
