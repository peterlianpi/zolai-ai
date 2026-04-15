import prisma from '@/lib/prisma';
import { sendEmail } from '@/lib/email';
import * as templates from '@/lib/email-templates';

export async function sendSuspiciousLoginEmail(
  userId: string,
  location: string,
  riskScore: number,
  alertId: string
) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true },
  });

  if (!user?.email) return false;

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://example.com';
  const confirmUrl = `${baseUrl}/auth/alerts/${alertId}/confirm`;
  const denyUrl = `${baseUrl}/auth/alerts/${alertId}/deny`;

  const html = templates.suspiciousLoginEmail(location, riskScore, confirmUrl, denyUrl);

  return sendEmail({
    to: user.email,
    subject: '🔒 Suspicious Login Detected',
    html,
  });
}

export async function sendAccountLockedEmail(userId: string, unlockTime: Date) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true },
  });

  if (!user?.email) return false;

  const html = templates.accountLockedEmail(unlockTime);

  return sendEmail({
    to: user.email,
    subject: '🔒 Account Locked',
    html,
  });
}

export async function sendDeviceRevokedEmail(userId: string, deviceName?: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true },
  });

  if (!user?.email) return false;

  const html = templates.deviceRevokedEmail(deviceName);

  return sendEmail({
    to: user.email,
    subject: '🔒 Session Revoked',
    html,
  });
}

export async function sendPasswordChangedEmail(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true },
  });

  if (!user?.email) return false;

  const html = templates.passwordChangedEmail();

  return sendEmail({
    to: user.email,
    subject: '🔒 Password Changed',
    html,
  });
}

export async function sendEmailChangedEmail(userId: string, newEmail: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true },
  });

  if (!user?.email) return false;

  const html = templates.emailChangedEmail(newEmail);

  return sendEmail({
    to: user.email,
    subject: '🔒 Email Address Changed',
    html,
  });
}

export async function sendTwoFactorEnabledEmail(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true },
  });

  if (!user?.email) return false;

  const html = templates.twoFactorEnabledEmail();

  return sendEmail({
    to: user.email,
    subject: '🔒 Two-Factor Authentication Enabled',
    html,
  });
}

export async function sendTwoFactorDisabledEmail(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true },
  });

  if (!user?.email) return false;

  const html = templates.twoFactorDisabledEmail();

  return sendEmail({
    to: user.email,
    subject: '🔒 Two-Factor Authentication Disabled',
    html,
  });
}
