/**
 * Newsletter Feature Types
 */

export type SubscriberStatus = "PENDING" | "CONFIRMED" | "UNSUBSCRIBED" | "BOUNCED";
export type CampaignStatus = "DRAFT" | "SCHEDULED" | "SENT" | "CANCELLED";

export interface Subscriber {
  id: string;
  email: string;
  name: string | null;
  status: SubscriberStatus;
  token: string;
  source: string | null;
  subscribedAt: Date;
  confirmedAt: Date | null;
  unsubscribedAt: Date | null;
  moderatedById: string | null;
}

export interface NewsletterCampaign {
  id: string;
  name: string;
  subject: string;
  body: string;
  status: CampaignStatus;
  sentCount: number;
  openCount: number;
  clickCount: number;
  scheduledAt: Date | null;
  sentAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface SubscribeRequest {
  email: string;
  name?: string;
  source?: string;
}

export interface CreateCampaignRequest {
  name: string;
  subject: string;
  body: string;
  scheduledAt?: string;
}

export interface SubscriberStats {
  confirmed: number;
  pending: number;
  unsubscribed: number;
  bounced: number;
  total: number;
}

export interface SendCampaignResponse {
  sentCount: number;
  total: number;
}
