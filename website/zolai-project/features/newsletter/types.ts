import type { PaginationMeta } from "@/lib/types/api";

/**
 * Newsletter Subscriber
 */
export interface Subscriber {
  id: string;
  email: string;
  name: string | null;
  status: "PENDING" | "CONFIRMED" | "UNSUBSCRIBED" | "BOUNCED";
  token: string;
  subscribedAt: string;
  confirmedAt: string | null;
  unsubscribedAt: string | null;
  source: string | null;
  moderatedById: string | null;
}

export interface SubscriberListItem extends Subscriber {
  moderator?: {
    id: string;
    name: string;
    email: string;
  } | null;
}

/**
 * Newsletter Campaign
 */
export interface NewsletterCampaign {
  id: string;
  name: string;
  subject: string;
  body: string;
  status: "DRAFT" | "SCHEDULED" | "SENDING" | "SENT" | "FAILED" | "CANCELLED";
  sentCount: number;
  openCount: number;
  clickCount: number;
  scheduledAt: string | null;
  sentAt: string | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * Campaign stats
 */
export interface CampaignStats {
  totalCampaigns: number;
  draftCampaigns: number;
  sentCampaigns: number;
  totalSent: number;
  avgOpenRate: number;
  avgClickRate: number;
}

/**
 * Subscriber stats
 */
export interface SubscriberStats {
  total: number;
  confirmed: number;
  pending: number;
  unsubscribed: number;
  bounced: number;
}

/**
 * API Request/Response types
 */

export interface SubscribeInput {
  email: string;
  name?: string;
  source?: string;
}

export interface ConfirmSubscriberInput {
  token: string;
}

export interface CreateCampaignInput {
  name: string;
  subject: string;
  body: string;
  scheduledAt?: string;
}

export interface UpdateCampaignInput {
  name?: string;
  subject?: string;
  body?: string;
  scheduledAt?: string;
}

export interface SendCampaignInput {
  id: string;
  now?: boolean; // Send immediately instead of at scheduledAt
}

/**
 * API Response types
 */

export interface SubscribersListResponse {
  success: boolean;
  data: SubscriberListItem[];
  meta: PaginationMeta;
}

export interface CampaignsListResponse {
  success: boolean;
  data: NewsletterCampaign[];
  meta: PaginationMeta;
}

export interface StatsResponse<T> {
  success: boolean;
  data: T;
}
