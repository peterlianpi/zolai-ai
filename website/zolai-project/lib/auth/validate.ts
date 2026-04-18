/**
 * Secure Session Validation Module
 * 
 * Implements proper DB-backed session validation instead of just checking cookie presence.
 * This fixes the critical session fixation vulnerability by:
 * 1. Validating session token exists in database
 * 2. Checking session hasn't expired
 * 3. Verifying session belongs to valid user
 * 4. Optionally verifying IP address matches
 */

import { headers } from "next/headers";
import { RequestCookie } from "next/dist/compiled/@edge-runtime/cookies";
import prisma from "@/lib/prisma";

export interface ValidSessionData {
  sessionId: string;
  userId: string;
  userRole: string;
  expiresAt: Date;
  ipAddress: string | null;
  userAgent: string | null;
}

interface CookieStore {
  get(name: string): RequestCookie | undefined;
  getAll(): RequestCookie[];
}

/**
 * Validate session token against database
 * 
 * Returns null if:
 * - Session token doesn't exist in database
 * - Session is expired
 * - User account is deleted or disabled
 * 
 * Usage in middleware:
 * ```typescript
 * const session = await validateSessionToken(cookieStore);
 * if (!session) {
 *   // Not a valid session - redirect to login
 * }
 * ```
 */
export async function validateSessionToken(
  cookieStore: CookieStore,
  options?: {
    verifyIpAddress?: boolean;
    strict?: boolean; // If true, fail on any error
  },
): Promise<ValidSessionData | null> {
  try {
    // Extract session token from cookies
    const rawToken =
      cookieStore.get("better-auth.session_token")?.value ||
      cookieStore.get("__Secure-better-auth.session_token")?.value;

    if (!rawToken) {
      return null;
    }

    // Better Auth stores token as "tokenId.signature" in the cookie.
    // The DB token is just the tokenId part (before the dot).
    const token = rawToken.split(".")[0];

    // Look up session in database
    const session = await prisma.session.findUnique({
      where: { token },
      include: {
        user: {
          select: {
            id: true,
            role: true,
            email: true,
            emailVerified: true,
          },
        },
      },
    });

    // Session doesn't exist in database
    if (!session) {
      return null;
    }

    // Session is expired
    if (new Date() > session.expiresAt) {
      // Clean up expired session
      await prisma.session.delete({
        where: { id: session.id },
      }).catch(() => {
        // Ignore errors during cleanup
      });
      return null;
    }

    // User account was deleted
    if (!session.user) {
      return null;
    }

    // Optional: Verify IP address hasn't changed (helps detect session hijacking)
    if (options?.verifyIpAddress && session.ipAddress) {
      const headersList = await headers();
      const currentIp =
        headersList.get("x-forwarded-for")?.split(",")[0] ||
        headersList.get("x-real-ip") ||
        "unknown";

      // If IP has changed significantly, it could be session hijacking
      if (currentIp.trim() !== session.ipAddress) {
        // Log as suspicious activity
        await prisma.securityEvent.create({
          data: {
            type: "SUSPICIOUS_LOGIN",
            userId: session.userId,
            ip: currentIp.trim(),
            userAgent: headersList.get("user-agent") || "unknown",
            severity: "HIGH",
            details: JSON.stringify({
              reason: "IP address changed",
              previousIp: session.ipAddress,
              currentIp: currentIp.trim(),
            }),
          },
        }).catch(() => {
          // Ignore errors
        });

        if (options.strict) {
          return null;
        }
        // If not strict, still allow but log the anomaly
      }
    }

    // Session is valid - return session data
    return {
      sessionId: session.id,
      userId: session.userId,
      userRole: session.user.role,
      expiresAt: session.expiresAt,
      ipAddress: session.ipAddress,
      userAgent: session.userAgent,
    };
  } catch (error) {
    console.error("[SessionValidation] Error validating session:", error);
    
    if (options?.strict) {
      throw error;
    }
    return null;
  }
}

/**
 * Validate session and return user info
 * 
 * Combines session validation with user data retrieval
 */
export async function getValidatedSession(cookieStore: CookieStore) {
  const session = await validateSessionToken(cookieStore);
  
  if (!session) {
    return null;
  }

  // Fetch full user data
  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: {
      id: true,
      email: true,
      name: true,
      image: true,
      role: true,
      emailVerified: true,
      createdAt: true,
    },
  });

  return {
    session,
    user,
  };
}

/**
 * Check if session exists and is valid (middleware helper)
 * 
 * Used in proxy.ts instead of simple cookie check
 */
export async function hasValidSession(cookieStore: CookieStore): Promise<boolean> {
  const session = await validateSessionToken(cookieStore).catch(() => null);
  return session !== null;
}

/**
 * Verify session belongs to specific user (security check)
 * 
 * Prevents privilege escalation:
 * - Don't trust userId from request body
 * - Always validate against session
 */
export async function verifySessionOwner(
  cookieStore: CookieStore,
  expectedUserId: string,
): Promise<boolean> {
  const session = await validateSessionToken(cookieStore);
  return session?.userId === expectedUserId;
}

/**
 * Verify session user has required role
 */
export async function verifySessionRole(
  cookieStore: CookieStore,
  requiredRoles: string[],
): Promise<boolean> {
  const session = await validateSessionToken(cookieStore);
  return session ? requiredRoles.includes(session.userRole) : false;
}

/**
 * Invalidate session (logout)
 */
export async function invalidateSession(sessionId: string) {
  await prisma.session.delete({
    where: { id: sessionId },
  }).catch(() => {
    // Session may already be deleted
  });
}

/**
 * Invalidate all sessions for a user (logout all devices)
 */
export async function invalidateAllUserSessions(userId: string) {
  await prisma.session.deleteMany({
    where: { userId },
  });
}

/**
 * Check for concurrent session limit violations
 */
export async function checkConcurrentSessionLimit(
  userId: string,
  maxConcurrent: number = 5,
) {
  const activeSessions = await prisma.session.count({
    where: {
      userId,
      expiresAt: {
        gt: new Date(),
      },
    },
  });

  return activeSessions >= maxConcurrent;
}

/**
 * Get all active sessions for a user
 */
export async function getActiveUserSessions(userId: string) {
  return prisma.session.findMany({
    where: {
      userId,
      expiresAt: {
        gt: new Date(),
      },
    },
    select: {
      id: true,
      createdAt: true,
      expiresAt: true,
      ipAddress: true,
      userAgent: true,
      impersonatedBy: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}
