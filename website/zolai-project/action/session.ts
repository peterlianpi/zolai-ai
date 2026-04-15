"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

/**
 * Simplify user agent string for safe display
 */
function simplifyUserAgent(ua: string | null): string {
  if (!ua) return "Unknown Device";
  
  if (ua.includes("iPhone") || ua.includes("iPad")) return "iOS Device";
  if (ua.includes("Android")) return "Android Device";
  if (ua.includes("Windows")) return "Windows PC";
  if (ua.includes("Macintosh")) return "Mac";
  if (ua.includes("Linux")) return "Linux PC";
  
  return "Desktop Device";
}

/**
 * Mask IP address for privacy
 */
function maskIpAddress(ip: string | null): string {
  if (!ip) return "Unknown";
  if (ip === "127.0.0.1" || ip === "::1") return "Localhost";
  
  if (ip.includes(":")) {
    // IPv6: keep first two segments
    return ip.split(":").slice(0, 2).join(":") + ":****";
  }
  
  // IPv4: keep first two segments
  return ip.split(".").slice(0, 2).join(".") + ".*.*";
}

/**
 * Get all sessions for the current user (sanitized)
 */
export async function getUserSessions() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return { success: false, error: "Not authenticated" };
  }

  const sessions = await prisma.session.findMany({
    where: {
      userId: session.user.id,
    },
    orderBy: {
      createdAt: "desc",
    },
    select: {
      id: true,
      userId: true,
      expiresAt: true,
      createdAt: true,
      updatedAt: true,
      ipAddress: true,
      userAgent: true,
    },
  });

  // Sanitize data before sending to client
  const sanitizedSessions = sessions.map(s => ({
    ...s,
    ipAddress: maskIpAddress(s.ipAddress),
    userAgent: simplifyUserAgent(s.userAgent),
  }));

  return { success: true, data: sanitizedSessions };
}

/**
 * Sign out from a specific session
 */
export async function signOutSession(sessionId: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return { success: false, error: "Not authenticated" };
  }

  // Verify the session belongs to the user
  const userSession = await prisma.session.findFirst({
    where: {
      id: sessionId,
      userId: session.user.id,
    },
  });

  if (!userSession) {
    return { success: false, error: "Session not found" };
  }

  await prisma.session.delete({
    where: {
      id: sessionId,
    },
  });

  revalidatePath("/settings");
  return { success: true };
}

/**
 * Sign out from all other sessions (keep current session)
 * Wrapped in a transaction for atomicity
 */
export async function signOutOtherDevices() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return { success: false, error: "Not authenticated" };
  }

  // Get current session token from the session cookie
  const currentSessionToken = session.session.token;

  try {
    await prisma.$transaction(async (tx) => {
      // Delete all sessions except the current one
      await tx.session.deleteMany({
        where: {
          userId: session.user.id,
          token: {
            not: currentSessionToken,
          },
        },
      });
    });

    revalidatePath("/settings");
    return { success: true };
  } catch (error) {
    console.error("[Session] Error signing out other devices:", error);
    return { success: false, error: "Failed to sign out other devices" };
  }
}


/**
 * Sign out from all devices (including current)
 */
export async function signOutAllDevices() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return { success: false, error: "Not authenticated" };
  }

  // Delete all sessions for the user
  await prisma.session.deleteMany({
    where: {
      userId: session.user.id,
    },
  });

  revalidatePath("/settings");
  return { success: true };
}

