import prisma from "@/lib/prisma";

/**
 * Notification types
 */
export const NOTIFICATION_TYPES = {
  SYSTEM: "system",
  INFO: "info",
} as const;

export type NotificationType =
  (typeof NOTIFICATION_TYPES)[keyof typeof NOTIFICATION_TYPES];

/**
 * Create a notification for a user
 */
export async function createNotification({
  userId,
  title,
  description,
  type,
  entityType,
  entityId,
}: {
  userId: string;
  title: string;
  description: string;
  type: NotificationType;
  entityType?: string;
  entityId?: string;
}) {
  try {
    const notification = await prisma.notification.create({
      data: {
        userId,
        title,
        description,
        type,
        entityType,
        entityId,
      },
    });

    console.log(
      `[Notification] Created ${type} notification for user ${userId}`,
    );
    return notification;
  } catch (error) {
    console.error("[Notification] Failed to create notification:", error);
    throw error;
  }
}

/**
 * Get user preferences or default values
 */
export async function getUserPreferences(userId: string) {
  const preferences = await prisma.userPreferences.findUnique({
    where: { userId },
  });

  return {
    emailNotifications: preferences?.emailNotifications ?? true,
    inAppNotifications: preferences?.inAppNotifications ?? true,
  };
}
