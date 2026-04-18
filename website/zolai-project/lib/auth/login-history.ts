import prisma from '@/lib/prisma';
import { parseUserAgent } from '@/lib/utils/user-agent';
import { getLocationFromIp } from '@/lib/utils/geolocation';

export interface LoginMetadata {
  userId: string;
  ipAddress: string;
  userAgent?: string;
}

export async function recordLogin(metadata: LoginMetadata) {
  const { userId, ipAddress, userAgent } = metadata;
  
  const parsed = userAgent ? parseUserAgent(userAgent) : {};
  const location = await getLocationFromIp(ipAddress).catch(() => ({} as Partial<import('@/lib/utils/geolocation').LocationData>));

  // Mark previous sessions as inactive
  await prisma.loginHistory.updateMany({
    where: { userId, isCurrentSession: true },
    data: { isCurrentSession: false, lastActivityAt: new Date() },
  });

  // Create new login record
  return prisma.loginHistory.create({
    data: {
      userId,
      ipAddress,
      userAgent,
      deviceName: parsed.deviceName,
      deviceType: parsed.deviceType,
      osName: parsed.osName,
      osVersion: parsed.osVersion,
      browserName: parsed.browserName,
      browserVersion: parsed.browserVersion,
      country: location.country,
      city: location.city,
      latitude: location.latitude,
      longitude: location.longitude,
      isCurrentSession: true,
      lastActivityAt: new Date(),
    },
  });
}

export async function getActiveDevices(userId: string) {
  return prisma.loginHistory.findMany({
    where: { userId, isCurrentSession: true, revokedAt: null },
    orderBy: { lastActivityAt: 'desc' },
  });
}

export async function revokeSession(loginHistoryId: string, reason?: string) {
  const { notifyDeviceRevoked } = await import('@/lib/auth/security-notifications');
  
  const session = await prisma.loginHistory.update({
    where: { id: loginHistoryId },
    data: {
      isCurrentSession: false,
      revokedAt: new Date(),
      revokedReason: reason,
    },
  });

  // Send notification
  await notifyDeviceRevoked(session.userId, session.deviceName || undefined);

  return session;
}

export async function getLoginHistory(userId: string, limit = 20) {
  return prisma.loginHistory.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: limit,
  });
}
