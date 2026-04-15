import { z } from "zod";

/**
 * Subscriber validation schemas
 */
export const subscribeSchema = z.object({
  email: z.string().email("Invalid email address"),
  name: z.string().optional().nullable(),
  source: z.string().optional().nullable(),
});

export type SubscribeInput = z.infer<typeof subscribeSchema>;

export const confirmSubscriberSchema = z.object({
  token: z.string().min(1, "Confirmation token is required"),
});

export type ConfirmSubscriberInput = z.infer<typeof confirmSubscriberSchema>;

export const unsubscribeSchema = z.object({
  token: z.string().min(1, "Unsubscribe token is required"),
});

export type UnsubscribeInput = z.infer<typeof unsubscribeSchema>;

/**
 * Campaign validation schemas
 */
export const createCampaignSchema = z.object({
  name: z.string().min(1, "Campaign name is required").max(255),
  subject: z.string().min(1, "Subject is required").max(255),
  body: z.string().min(1, "Campaign body is required"),
  scheduledAt: z.string().datetime().optional().nullable(),
});

export type CreateCampaignInput = z.infer<typeof createCampaignSchema>;

export const updateCampaignSchema = createCampaignSchema.partial();

export type UpdateCampaignInput = z.infer<typeof updateCampaignSchema>;

export const sendCampaignSchema = z.object({
  id: z.string().min(1, "Campaign ID is required"),
  now: z.boolean().optional(),
});

export type SendCampaignInput = z.infer<typeof sendCampaignSchema>;

/**
 * List query schemas
 */
export const subscribersListSchema = z.object({
  status: z.enum(["PENDING", "CONFIRMED", "UNSUBSCRIBED", "BOUNCED", "ALL"]).optional(),
  search: z.string().optional(),
  page: z.number().int().positive().default(1),
  limit: z.number().int().min(1).max(100).default(20),
});

export type SubscribersListQuery = z.infer<typeof subscribersListSchema>;

export const campaignsListSchema = z.object({
  status: z.enum(["DRAFT", "SCHEDULED", "SENDING", "SENT", "FAILED", "CANCELLED", "ALL"]).optional(),
  search: z.string().optional(),
  page: z.number().int().positive().default(1),
  limit: z.number().int().min(1).max(100).default(20),
});

export type CampaignsListQuery = z.infer<typeof campaignsListSchema>;
