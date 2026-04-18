import prisma from '@/lib/prisma';
import { notify } from '@/lib/telegram';
import { createNotification } from '@/lib/services/notifications';
import { sendEmail, buildSecurityEmailHtml } from '@/lib/email';

export interface SecurityNotificationInput {
  userId?: string;
  type: 'SUSPICIOUS_LOGIN' | 'ACCOUNT_LOCKED' | 'DEVICE_SESSION_REVOKED' | 'PASSWORD_CHANGE' | 'EMAIL_CHANGE' | 'TWO_FACTOR_ENABLED' | 'TWO_FACTOR_DISABLED';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  title: string;
  message: string;
  ipAddress?: string;
  userAgent?: string;
  details?: Record<string, unknown>;
  sendEmail?: boolean;
}

/**
 * Unified security notification system
 * Logs to: AuditLog, SecurityEvent, Notification, Email, Telegram
 */
export async function notifySecurityEvent(input: SecurityNotificationInput) {
  const { userId, type, severity, title, message, ipAddress, userAgent, details, sendEmail: shouldSendEmail = true } = input;

  try {
    // 1. Log to SecurityEvent
    await prisma.securityEvent.create({
      data: {
        type,
        userId,
        ip: ipAddress,
        userAgent,
        severity,
        details: details as import('@/lib/generated/prisma').Prisma.InputJsonValue ?? undefined,
      },
    });

    // 2. Log to AuditLog
    if (userId) {
      await prisma.auditLog.create({
        data: {
          action: 'UPDATE',
          entityType: 'User',
          entityId: userId,
          createdById: userId,
          newValues: { securityEvent: type },
          details: { severity, message },
          ipAddress,
          userAgent,
        },
      });
    }

    // 3. Create in-app notification
    if (userId) {
      await createNotification({
        userId,
        title,
        description: message,
        type: 'system',
        entityType: 'SecurityEvent',
        entityId: type,
      });
    }

    // 4. Send email (if enabled and user exists)
    if (shouldSendEmail && userId) {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { email: true },
      });

      if (user?.email) {
        const html = buildSecurityEmailHtml(title, message);
        await sendEmail({
          to: user.email,
          subject: `🔒 ${title}`,
          html,
        }).catch(() => {});
      }
    }

    // 5. Send Telegram alert (critical only)
    if (severity === 'CRITICAL') {
      const telegramMsg = `🚨 <b>${title}</b>\nType: ${type}\nSeverity: ${severity}\n\n${message}`;
      await notify(telegramMsg).catch(() => {});
    }

    return { success: true };
  } catch (error) {
    console.error('[SecurityNotification] Failed:', error);
    throw error;
  }
}

/**
 * Notify user of suspicious login
 */
export async function notifySuspiciousLogin(
  userId: string,
  ipAddress: string,
  country?: string,
  city?: string,
  riskScore?: number
) {
  const location = city && country ? `${city}, ${country}` : 'Unknown location';
  const message = `Suspicious login detected from ${location}. Risk score: ${riskScore || 0}/100. If this wasn't you, please review your account security.`;

  return notifySecurityEvent({
    userId,
    type: 'SUSPICIOUS_LOGIN',
    severity: riskScore && riskScore >= 70 ? 'CRITICAL' : 'HIGH',
    title: 'Suspicious Login Detected',
    message,
    ipAddress,
    details: { location, riskScore },
  });
}

/**
 * Notify user of account lockout
 */
export async function notifyAccountLocked(userId: string, ipAddress?: string) {
  const { sendAccountLockedEmail } = await import('@/lib/services/email-notifications');
  
  const lockoutExpires = new Date(Date.now() + 15 * 60 * 1000);

  await notifySecurityEvent({
    userId,
    type: 'ACCOUNT_LOCKED',
    severity: 'HIGH',
    title: 'Account Locked',
    message: 'Your account has been locked due to too many failed login attempts. It will automatically unlock in 15 minutes.',
    ipAddress,
  });

  // Send email
  await sendAccountLockedEmail(userId, lockoutExpires).catch(() => {});
}

/**
 * Notify user of device revocation
 */
export async function notifyDeviceRevoked(userId: string, deviceName?: string) {
  const { sendDeviceRevokedEmail } = await import('@/lib/services/email-notifications');
  
  const message = deviceName
    ? `Your session on ${deviceName} has been revoked.`
    : 'One of your sessions has been revoked.';

  await notifySecurityEvent({
    userId,
    type: 'DEVICE_SESSION_REVOKED',
    severity: 'MEDIUM',
    title: 'Session Revoked',
    message,
    details: { deviceName },
  });

  // Send email
  await sendDeviceRevokedEmail(userId, deviceName).catch(() => {});
}

/**
 * Notify user of password change
 */
export async function notifyPasswordChanged(userId: string, ipAddress?: string) {
  const { sendPasswordChangedEmail } = await import('@/lib/services/email-notifications');
  
  await notifySecurityEvent({
    userId,
    type: 'PASSWORD_CHANGE',
    severity: 'MEDIUM',
    title: 'Password Changed',
    message: 'Your password has been successfully changed.',
    ipAddress,
  });

  // Send email
  await sendPasswordChangedEmail(userId).catch(() => {});
}

/**
 * Notify user of email change
 */
export async function notifyEmailChanged(userId: string, newEmail: string, ipAddress?: string) {
  const { sendEmailChangedEmail } = await import('@/lib/services/email-notifications');
  
  await notifySecurityEvent({
    userId,
    type: 'EMAIL_CHANGE',
    severity: 'HIGH',
    title: 'Email Address Changed',
    message: `Your email address has been changed to ${newEmail}. If you did not make this change, please contact support immediately.`,
    ipAddress,
  });

  // Send email to old address
  await sendEmailChangedEmail(userId, newEmail).catch(() => {});
}

/**
 * Notify user of 2FA enabled
 */
export async function notifyTwoFactorEnabled(userId: string) {
  const { sendTwoFactorEnabledEmail } = await import('@/lib/services/email-notifications');
  
  await notifySecurityEvent({
    userId,
    type: 'TWO_FACTOR_ENABLED',
    severity: 'LOW',
    title: 'Two-Factor Authentication Enabled',
    message: 'Two-factor authentication has been enabled on your account.',
  });

  // Send email
  await sendTwoFactorEnabledEmail(userId).catch(() => {});
}

/**
 * Notify user of 2FA disabled
 */
export async function notifyTwoFactorDisabled(userId: string, ipAddress?: string) {
  const { sendTwoFactorDisabledEmail } = await import('@/lib/services/email-notifications');
  
  await notifySecurityEvent({
    userId,
    type: 'TWO_FACTOR_DISABLED',
    severity: 'HIGH',
    title: 'Two-Factor Authentication Disabled',
    message: 'Two-factor authentication has been disabled on your account. If you did not do this, please enable it again immediately.',
    ipAddress,
  });

  // Send email
  await sendTwoFactorDisabledEmail(userId).catch(() => {});
}
