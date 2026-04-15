import { sendEmail } from "@/lib/email/resend";
import prisma from "@/lib/prisma";
import { DEFAULT_SITE_NAME } from "@/lib/constants/site";

export interface NotificationEmailOptions {
  userId: string;
  subject: string;
  title: string;
  message: string;
  actionUrl?: string;
  actionText?: string;
}

/**
 * Send email notification to a user
 * Creates an in-app notification and sends email in parallel
 */
export async function sendNotificationEmail(
  options: NotificationEmailOptions
): Promise<{ success: boolean; notificationId?: string; error?: string }> {
  try {
    // Get user email
    const user = await prisma.user.findUnique({
      where: { id: options.userId },
      select: { email: true, name: true },
    });

    if (!user) {
      return { success: false, error: "User not found" };
    }

    // Create in-app notification (non-blocking)
    const notification = prisma.notification.create({
      data: {
        userId: options.userId,
        title: options.title,
        description: options.message,
        type: "email",
        read: false,
      },
    });

    // Send email (non-blocking)
    const emailSend = sendEmail({
      to: user.email,
      subject: options.subject,
      html: generateNotificationEmail({
        name: user.name || user.email.split("@")[0],
        title: options.title,
        message: options.message,
        actionUrl: options.actionUrl,
        actionText: options.actionText,
      }),
    });

    // Execute both in parallel, but don't block on errors
    const [createdNotification] = await Promise.allSettled([
      notification,
      emailSend,
    ]).then((results) => [
      results[0]?.status === "fulfilled" ? results[0]?.value : null,
      results[1]?.status === "fulfilled" ? results[1]?.value : null,
    ]);

    return {
      success: true,
      notificationId: createdNotification?.id,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("[Notification] Error sending email:", message);
    return { success: false, error: message };
  }
}

/**
 * Send bulk notification emails
 * Useful for newsletters, announcements, etc.
 */
export async function sendBulkNotificationEmail(
  userIds: string[],
  options: Omit<NotificationEmailOptions, "userId">
): Promise<{ success: boolean; sent: number; failed: number }> {
  let sent = 0;
  let failed = 0;

  // Process in batches to avoid overwhelming the email service
  const batchSize = 10;
  for (let i = 0; i < userIds.length; i += batchSize) {
    const batch = userIds.slice(i, i + batchSize);

    const results = await Promise.allSettled(
      batch.map((userId) =>
        sendNotificationEmail({
          ...options,
          userId,
        })
      )
    );

    results.forEach((result) => {
      if (result.status === "fulfilled" && result.value.success) {
        sent++;
      } else {
        failed++;
      }
    });
  }

  return { success: failed === 0, sent, failed };
}

/**
 * Generate HTML email for notification
 */
function generateNotificationEmail(data: {
  name: string;
  title: string;
  message: string;
  actionUrl?: string;
  actionText?: string;
}): string {
  const actionButton = data.actionUrl
    ? `<a href="${data.actionUrl}" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #4CA8C6 0%, #3A8BA8 100%); color: white; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; margin: 24px 0;">${data.actionText || "View"}</a>`
    : "";

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #F7F9FB;">
        <div style="max-width: 600px; margin: 20px auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <div style="background: linear-gradient(135deg, #4CA8C6 0%, #3A8BA8 100%); color: white; padding: 40px 30px; text-align: center;">
            <h1 style="margin: 0; font-size: 28px; font-weight: 700;">🔔 ${data.title}</h1>
            <p style="margin: 8px 0 0 0; font-size: 16px; opacity: 0.9;">${DEFAULT_SITE_NAME}</p>
          </div>
          <div style="padding: 40px 30px;">
            <p style="margin: 0 0 16px 0;">Hi ${data.name},</p>
            <p style="margin: 0 0 16px 0;">${data.message}</p>
            ${actionButton}
            <p style="margin: 24px 0 0 0; font-size: 14px; color: #64748B;">
              You're receiving this notification because you have notifications enabled for ${DEFAULT_SITE_NAME}.
            </p>
          </div>
          <div style="background: #F7F9FB; padding: 20px 30px; border-top: 1px solid #D9E4EC; font-size: 12px; color: #64748B;">
            <p style="margin: 0;">© ${DEFAULT_SITE_NAME}. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;
}
