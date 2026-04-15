import prisma from '@/lib/prisma';

const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes
// const ATTEMPT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes

export async function recordLoginAttempt(
  email: string,
  ipAddress: string,
  success: boolean,
  reason?: string
) {
  await prisma.loginAttempt.create({
    data: { email, ipAddress, success, reason },
  });
}

export async function getFailedAttempts(email: string, minutes = 15): Promise<number> {
  const since = new Date(Date.now() - minutes * 60 * 1000);
  return prisma.loginAttempt.count({
    where: {
      email,
      success: false,
      createdAt: { gte: since },
    },
  });
}

export async function isAccountLocked(userId: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { accountLocked: true, lockoutExpires: true },
  });

  if (!user?.accountLocked) return false;
  if (!user.lockoutExpires) return true;
  if (user.lockoutExpires > new Date()) return true;

  // Lockout expired, unlock
  await prisma.user.update({
    where: { id: userId },
    data: { accountLocked: false, lockoutExpires: null, failedLoginAttempts: 0 },
  });

  return false;
}

export async function lockAccount(userId: string, _reason = 'Too many failed login attempts') {
  const { notifyAccountLocked } = await import('@/lib/auth/security-notifications');
  
  const lockoutExpires = new Date(Date.now() + LOCKOUT_DURATION_MS);
  
  await prisma.user.update({
    where: { id: userId },
    data: {
      accountLocked: true,
      lockoutExpires,
      failedLoginAttempts: MAX_ATTEMPTS,
    },
  });

  // Send unified notification
  await notifyAccountLocked(userId);
}

export async function incrementFailedAttempts(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { failedLoginAttempts: true },
  });

  const newCount = (user?.failedLoginAttempts || 0) + 1;

  await prisma.user.update({
    where: { id: userId },
    data: {
      failedLoginAttempts: newCount,
      lastFailedLoginAt: new Date(),
    },
  });

  if (newCount >= MAX_ATTEMPTS) {
    await lockAccount(userId);
  }
}

export async function resetFailedAttempts(userId: string) {
  await prisma.user.update({
    where: { id: userId },
    data: {
      failedLoginAttempts: 0,
      lastFailedLoginAt: null,
    },
  });
}

export async function unlockAccount(userId: string) {
  await prisma.user.update({
    where: { id: userId },
    data: {
      accountLocked: false,
      lockoutExpires: null,
      failedLoginAttempts: 0,
    },
  });

  await prisma.securityEvent.create({
    data: {
      type: 'ACCOUNT_UNLOCKED',
      userId,
      severity: 'MEDIUM',
    },
  });
}
