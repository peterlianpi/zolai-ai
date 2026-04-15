import prisma from '@/lib/prisma';

export interface SuspiciousLoginCheck {
  isUnusualLocation: boolean;
  isUnusualTime: boolean;
  isNewDevice: boolean;
  riskScore: number; // 0-100
  reasons: string[];
}

export async function checkSuspiciousLogin(
  userId: string,
  ipAddress: string,
  country?: string,
  city?: string
): Promise<SuspiciousLoginCheck> {
  const reasons: string[] = [];
  let riskScore = 0;

  // Get user's login history
  const recentLogins = await prisma.loginHistory.findMany({
    where: { userId, revokedAt: null },
    orderBy: { createdAt: 'desc' },
    take: 10,
  });

  // Check 1: Unusual location
  const isUnusualLocation = checkUnusualLocation(recentLogins, country, city);
  if (isUnusualLocation) {
    reasons.push('Login from new location');
    riskScore += 30;
  }

  // Check 2: Unusual time
  const isUnusualTime = checkUnusualTime(recentLogins);
  if (isUnusualTime) {
    reasons.push('Login at unusual time');
    riskScore += 20;
  }

  // Check 3: New device
  const isNewDevice = checkNewDevice(recentLogins, ipAddress);
  if (isNewDevice) {
    reasons.push('Login from new device');
    riskScore += 25;
  }

  // Check 4: Rapid location change (impossible travel)
  const isImpossibleTravel = checkImpossibleTravel(recentLogins, country, city);
  if (isImpossibleTravel) {
    reasons.push('Impossible travel detected');
    riskScore += 25;
  }

  return {
    isUnusualLocation,
    isUnusualTime,
    isNewDevice,
    riskScore: Math.min(riskScore, 100),
    reasons,
  };
}

function checkUnusualLocation(
  recentLogins: Array<Record<string, unknown>>,
  country?: string,
  city?: string
): boolean {
  if (!country || !city) return false;
  if (recentLogins.length === 0) return false;

  // Check if this location appears in recent logins
  const locationExists = recentLogins.some(
    login => login.country === country && login.city === city
  );

  return !locationExists;
}

function checkUnusualTime(recentLogins: Array<Record<string, unknown>>): boolean {
  if (recentLogins.length === 0) return false;

  const now = new Date();
  const hour = now.getHours();

  // Get typical login hours from history
  const loginHours = recentLogins
    .map(l => new Date(l.createdAt as string).getHours())
    .slice(0, 5);

  if (loginHours.length === 0) return false;

  // Check if current hour is within typical range (±3 hours)
  const avgHour = Math.round(loginHours.reduce((a, b) => a + b) / loginHours.length);
  const hourDiff = Math.min(Math.abs(hour - avgHour), 24 - Math.abs(hour - avgHour));

  return hourDiff > 6; // More than 6 hours different
}

function checkNewDevice(recentLogins: Array<Record<string, unknown>>, ipAddress: string): boolean {
  if (recentLogins.length === 0) return true;

  // Check if IP appears in recent logins
  const ipExists = recentLogins.some(login => login.ipAddress === ipAddress);

  return !ipExists;
}

function checkImpossibleTravel(
  recentLogins: Array<Record<string, unknown>>,
  country?: string,
  city?: string
): boolean {
  if (!country || !city || recentLogins.length === 0) return false;

  const lastLogin = recentLogins[0];
  if (!lastLogin.latitude || !lastLogin.longitude) return false;

  const lastTime = new Date(lastLogin.createdAt).getTime();
  const currentTime = Date.now();
  const timeDiffHours = (currentTime - lastTime) / (1000 * 60 * 60);

  // If less than 1 hour, check distance
  if (timeDiffHours < 1) {
    const distance = calculateDistance(
      lastLogin.latitude,
      lastLogin.longitude,
      0, // placeholder - would need current coords
      0
    );

    // Impossible if > 900 km in < 1 hour (max commercial flight speed)
    return distance > 900;
  }

  return false;
}

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export async function createSuspiciousLoginAlert(
  userId: string,
  check: SuspiciousLoginCheck,
  ipAddress: string,
  country?: string,
  city?: string
) {
  if (check.riskScore < 40) return; // Only alert if risk >= 40

  const { notifySuspiciousLogin } = await import('@/lib/auth/security-notifications');

  const alert = await prisma.securityAlert.create({
    data: {
      userId,
      type: 'SUSPICIOUS_LOGIN',
      title: 'Suspicious Login Detected',
      message: check.reasons.join(', '),
      severity: check.riskScore >= 70 ? 'CRITICAL' : 'HIGH',
    },
  });

  // Send unified notification (logs to SecurityEvent, AuditLog, Notification, Telegram)
  await notifySuspiciousLogin(userId, ipAddress, country, city, check.riskScore);

  return alert;
}

export async function getUserSecurityAlerts(userId: string, limit = 20) {
  return prisma.securityAlert.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: limit,
  });
}

export async function markAlertAsRead(alertId: string) {
  return prisma.securityAlert.update({
    where: { id: alertId },
    data: { isRead: true },
  });
}

export async function resolveAlert(alertId: string) {
  return prisma.securityAlert.update({
    where: { id: alertId },
    data: { isResolved: true, resolvedAt: new Date() },
  });
}
