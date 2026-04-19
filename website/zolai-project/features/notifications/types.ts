import type { PaginationMeta } from "@/lib/types/api";

export interface Notification {
  id: string;
  title: string;
  description: string;
  type: string;
  action?: string | null;
  actorUserId?: string | null;
  actorName?: string | null;
  metadata?: Record<string, unknown> | null;
  link?: string | null;
  entityType?: string | null;
  entityId?: string | null;
  read: boolean;
  readAt: string | null;
  createdAt: string;
  userId: string;
}

export interface NotificationTemplate {
  id: string;
  name: string;
  slug: string;
  subject: string;
  body: string;
  variables?: Record<string, string> | null;
  isActive: boolean;
  type: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateNotificationInput {
  userId: string;
  title: string;
  description: string;
  type: string;
  entityType?: string;
  entityId?: string;
}

export interface CreateNotificationTemplateInput {
  name: string;
  slug: string;
  subject: string;
  body: string;
  type: string;
  variables?: Record<string, string>;
  isActive?: boolean;
}

export interface UpdateNotificationTemplateInput {
  name?: string;
  subject?: string;
  body?: string;
  variables?: Record<string, string>;
  isActive?: boolean;
}

export interface SendBulkNotificationInput {
  templateId?: string;
  title?: string;
  description?: string;
  type: string;
  userIds: string[];
  variables?: Record<string, string>;
}

export interface NotificationStats {
  total: number;
  unread: number;
  read: number;
}

export interface NotificationsListResponse {
  success: boolean;
  data: Notification[];
  meta: PaginationMeta;
}

export interface NotificationTemplatesListResponse {
  success: boolean;
  data: NotificationTemplate[];
  meta: PaginationMeta;
}
