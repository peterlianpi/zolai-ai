/**
 * Account Lockout Mechanism
 * 
 * Prevents brute force attacks by temporarily locking accounts
 * after multiple failed login attempts.
 */

import prisma from "@/lib/prisma";
import { logAuthEvent } from "./audit";

const LOCKOUT_THRESHOLD = 5;
const LOCKOUT_DURATION_MINUTES = 30;

/**
 * Check if an account is currently locked
 */
export async function checkAccountLockout(email: string): Promise<{
  isLocked: boolean;
  expiresAt: Date | null;
  reason?: string;
}> {
  try {
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      select: { accountLocked: true, lockoutExpires: true }
    });

    if (!user) return { isLocked: false, expiresAt: null };

    if (user.accountLocked) {
      if (user.lockoutExpires && new Date() > user.lockoutExpires) {
        // Lockout expired - unlock automatically
        await unlockAccount(email);
        return { isLocked: false, expiresAt: null };
      }
      return { isLocked: true, expiresAt: user.lockoutExpires };
    }

    return { isLocked: false, expiresAt: null };
  } catch (error) {
    console.error("[AccountLockout] Error checking status:", error);
    return { isLocked: false, expiresAt: null };
  }
}

/**
 * Track a failed login attempt and lock account if threshold reached
 */
export async function trackFailedLogin(email: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      select: { id: true, email: true }
    });

    if (!user) return;

    // Count recent failed login attempts from security events
    const failedAttempts = await prisma.securityEvent.count({
      where: {
        email: user.email,
        type: "BRUTE_FORCE" as const,
        createdAt: {
          gte: new Date(Date.now() - LOCKOUT_DURATION_MINUTES * 60 * 1000)
        }
      }
    });

    if (failedAttempts + 1 >= LOCKOUT_THRESHOLD) {
      const lockoutExpires = new Date(Date.now() + LOCKOUT_DURATION_MINUTES * 60 * 1000);
      
      await prisma.user.update({
        where: { id: user.id },
        data: {
          accountLocked: true,
          lockoutExpires
        }
      });

      await logAuthEvent(
        user.id,
        user.email,
        "ACCOUNT_LOCKED",
        "HIGH",
        { reason: `Too many failed login attempts (${failedAttempts + 1})`, expiresAt: lockoutExpires }
      );
    }
  } catch (error) {
    console.error("[AccountLockout] Error tracking failed login:", error);
  }
}

/**
 * Unlock an account
 */
export async function unlockAccount(email: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      select: { id: true }
    });

    if (!user) return;

    await prisma.user.update({
      where: { id: user.id },
      data: {
        accountLocked: false,
        lockoutExpires: null
      }
    });

    await logAuthEvent(
      user.id,
      email,
      "ACCOUNT_UNLOCKED",
      "MEDIUM",
      { reason: "Manual or automatic unlock" }
    );
  } catch (error) {
    console.error("[AccountLockout] Error unlocking account:", error);
  }
}
