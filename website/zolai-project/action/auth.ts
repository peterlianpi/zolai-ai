"use server";

import { 
  trackPasswordResetRequest, 
  logPasswordResetSuccess, 
  logPasswordResetFailure 
} from "@/lib/auth/password-reset";
import { logAuthEvent } from "@/lib/auth/audit";
import prisma from "@/lib/prisma";

/**
 * Track a password reset request
 */
export async function trackResetRequest(email: string) {
  return await trackPasswordResetRequest(email);
}

/**
 * Log a successful password reset
 */
export async function trackResetSuccess(email: string) {
  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true }
  });
  
  if (user) {
    await logPasswordResetSuccess(user.id, email);
    return { success: true };
  }
  
  return { success: false, error: "User not found" };
}

/**
 * Log a failed password reset attempt
 */
export async function trackResetFailure(email: string, reason: string) {
  await logPasswordResetFailure(email, reason);
  return { success: true };
}

/**
 * Log a generic auth event from server side
 */
export async function trackAuthEvent(
  email: string | undefined,
  eventType: string,
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL",
  details?: Record<string, unknown>
) {
  const user = email ? await prisma.user.findUnique({
    where: { email },
    select: { id: true }
  }) : null;

  await logAuthEvent(
    user?.id,
    email,
    eventType,
    severity,
    details
  );
  
  return { success: true };
}
