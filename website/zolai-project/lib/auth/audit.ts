/**
 * Authentication Audit Logging Module
 * 
 * Tracks all authentication-related events for security monitoring and forensics.
 * Uses SecurityEvent table for flexible event tracking with severity levels.
 */

import { headers } from "next/headers";
import prisma from "@/lib/prisma";

/**
 * Map auth events to appropriate SecurityEventType
 */
function mapEventToSecurityType(eventType: string): string {
  if (eventType.includes("FAILED_LOGIN") || eventType.includes("BRUTE_FORCE")) {
    return "BRUTE_FORCE";
  } else if (eventType.includes("PASSWORD")) {
    return "PASSWORD_CHANGE";
  } else if (eventType.includes("EMAIL")) {
    return "EMAIL_CHANGE";
  } else if (eventType.includes("CREATED")) {
    return "DEVICE_SESSION_CREATED";
  } else if (eventType.includes("REVOKED")) {
    return "DEVICE_SESSION_REVOKED";
  } else if (eventType.includes("TWO_FACTOR")) {
    return "TWO_FACTOR_ENABLED";
  }
  return "SUSPICIOUS_LOGIN";
}

/**
 * Log security event related to authentication
 * 
 * Maps auth events to appropriate SecurityEventType and severity
 */
export async function logAuthEvent(
  userId: string | undefined,
  email: string | undefined,
  eventType: string,
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL",
  details?: Record<string, unknown>,
) {
  try {
    const headersList = await headers();
    const ipAddress = 
      headersList.get("x-forwarded-for")?.split(",")[0] ||
      headersList.get("x-real-ip") ||
      "unknown";
    
    const userAgent = headersList.get("user-agent") || "unknown";

    // Map auth event names to SecurityEventType (string that matches enum value)
    const securityEventType = mapEventToSecurityType(eventType);

     await prisma.securityEvent.create({
      data: {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        type: securityEventType as any,
        ip: ipAddress.trim(),
        userAgent,
        userId,
        email,
        details: details ? JSON.stringify(details) : undefined,
        severity: severity,
      },
    });
  } catch (error) {
    // Log errors to console but don't throw - audit logging should never break the auth flow
    console.error("[AuthAudit] Failed to log auth event:", {
      eventType,
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
}

/**
 * Log failed login attempt
 */
export async function logFailedLogin(
  email: string,
  reason: string,
  details?: Record<string, unknown>,
) {
  await logAuthEvent(
    undefined,
    email,
    "FAILED_LOGIN",
    "MEDIUM",
    { email, reason, ...details },
  );
}

/**
 * Log successful login
 */
export async function logSuccessfulLogin(
  userId: string,
  email: string,
  method: "email" | "oauth" | "passkey" = "email",
) {
  // Track as device session created
  await logAuthEvent(
    userId,
    email,
    "LOGIN_SUCCESS",
    "LOW",
    { email, loginMethod: method },
  );
}

/**
 * Log logout
 */
export async function logLogout(userId: string, allDevices = false) {
  await logAuthEvent(
    userId,
    undefined,
    allDevices ? "LOGOUT_ALL_DEVICES" : "LOGOUT",
    "LOW",
    { allDevices },
  );
}

/**
 * Log 2FA enable/disable as email change event (closest fit)
 */
export async function log2FAToggle(userId: string, enabled: boolean) {
  await logAuthEvent(
    userId,
    undefined,
    `2FA_${enabled ? "ENABLED" : "DISABLED"}`,
    "MEDIUM",
    { enabled },
  );
}

/**
 * Log 2FA verification attempt
 */
export async function log2FAVerification(
  userId: string,
  success: boolean,
  method: "totp" | "email" | "backup_code" = "totp",
) {
  await logAuthEvent(
    userId,
    undefined,
    `2FA_VERIFY_${success ? "SUCCESS" : "FAILED"}`,
    success ? "LOW" : "MEDIUM",
    { method, success },
  );
}

/**
 * Log password change
 */
export async function logPasswordChange(userId: string) {
  await logAuthEvent(
    userId,
    undefined,
    "PASSWORD_CHANGED",
    "MEDIUM",
  );
}

/**
 * Log password reset
 */
export async function logPasswordReset(
  userId: string,
  success: boolean,
  reason?: string,
) {
  await logAuthEvent(
    userId,
    undefined,
    `PASSWORD_RESET_${success ? "SUCCESS" : "FAILED"}`,
    success ? "LOW" : "MEDIUM",
    { reason },
  );
}

/**
 * Log admin impersonation
 */
export async function logImpersonation(
  adminId: string,
  impersonatedUserId: string,
  action: "start" | "end",
) {
  await logAuthEvent(
    adminId,
    undefined,
    `ADMIN_IMPERSONATION_${action.toUpperCase()}`,
    "CRITICAL",
    { impersonatedUserId, action },
  );
}

/**
 * Log suspicious login attempt
 */
export async function logSuspiciousLogin(
  userId: string | undefined,
  reason: string,
  details?: Record<string, unknown>,
) {
  await logAuthEvent(
    userId,
    undefined,
    "SUSPICIOUS_LOGIN_DETECTED",
    "CRITICAL",
    { reason, ...details },
  );
}

/**
 * Log permission denied events
 */
export async function logPermissionDenied(
  userId: string | undefined,
  resource: string,
  action: string,
) {
  await logAuthEvent(
    userId,
    undefined,
    "PERMISSION_DENIED",
    "MEDIUM",
    { resource, action },
  );
}

/**
 * Log email change event
 */
export async function logEmailChange(
  userId: string,
  oldEmail: string,
  newEmail: string,
) {
  await logAuthEvent(
    userId,
    newEmail,
    "EMAIL_CHANGED",
    "MEDIUM",
    { oldEmail, newEmail },
  );
}

/**
 * Get recent security events for a user
 */
export async function getUserSecurityEvents(
  userId: string,
  limit: number = 50,
  offset: number = 0,
) {
  return prisma.securityEvent.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: limit,
    skip: offset,
  });
}

/**
 * Get recent auth-related security events
 */
export async function getRecentAuthEvents(
  hoursBack: number = 24,
  limit: number = 100,
) {
  const sinceTime = new Date(Date.now() - hoursBack * 60 * 60 * 1000);
  
  return prisma.securityEvent.findMany({
    where: {
      createdAt: { gte: sinceTime },
    },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}

/**
 * Get critical security events (potential breaches)
 */
export async function getCriticalSecurityEvents(limit: number = 50) {
  return prisma.securityEvent.findMany({
    where: { severity: "CRITICAL" },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}
