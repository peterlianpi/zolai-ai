import prisma from "@/lib/prisma";
import type { Prisma } from "@/lib/generated/prisma/client";

export interface NotificationRecipient {
  userId: string;
}

export interface NotificationDispatchInput {
  recipients: NotificationRecipient[];
  title: string;
  description: string;
  type: string;
  action?: string;
  actorUserId?: string;
  actorName?: string;
  entityType?: string;
  entityId?: string;
  link?: string;
  metadata?: Prisma.InputJsonValue;
  excludeActor?: boolean;
}

function uniqueRecipientIds(recipients: NotificationRecipient[]): string[] {
  return Array.from(new Set(recipients.map((recipient) => recipient.userId))).filter(Boolean);
}

export async function dispatchNotification(input: NotificationDispatchInput) {
  const recipientIds = uniqueRecipientIds(input.recipients);
  const filteredRecipientIds = input.excludeActor && input.actorUserId
    ? recipientIds.filter((userId) => userId !== input.actorUserId)
    : recipientIds;

  if (filteredRecipientIds.length === 0) {
    return { createdCount: 0 };
  }

  const prefs = await prisma.userPreferences.findMany({
    where: { userId: { in: filteredRecipientIds } },
    select: { userId: true, inAppNotifications: true },
  });

  const prefMap = new Map(prefs.map((preference) => [preference.userId, preference.inAppNotifications]));
  const eligibleRecipientIds = filteredRecipientIds.filter((userId) => prefMap.get(userId) ?? true);

  if (eligibleRecipientIds.length === 0) {
    return { createdCount: 0 };
  }

  const now = new Date();
  const created = await prisma.notification.createMany({
    data: eligibleRecipientIds.map((userId) => ({
      userId,
      title: input.title,
      description: input.description,
      type: input.type,
      action: input.action,
      actorUserId: input.actorUserId,
      actorName: input.actorName,
      entityType: input.entityType,
      entityId: input.entityId,
      link: input.link,
      metadata: input.metadata,
      createdAt: now,
    })),
  });

  return { createdCount: created.count };
}
