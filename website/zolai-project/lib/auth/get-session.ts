/**
 * Consolidated Session Retrieval Utility
 * 
 * Provides unified functions for session retrieval across:
 * - Next.js Server Components (Pages/Layouts)
 * - Server Actions
 * - Hono API Routes
 * 
 * This ensures consistent session validation, role checking, and error handling.
 */

import { headers } from "next/headers";
import { Context } from "hono";
import { auth } from "@/lib/auth";
import { 
  AuthenticationError, 
  AuthorizationError
} from "./errors";
import { isAdminRole, isSuperAdmin as isSuperAdminRole } from "./roles";

/**
 * Get session from Next.js server context (headers)
 * 
 * @returns The session or null if not authenticated
 */
export async function getValidSession() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) return null;

    // Check expiration
    if (new Date() > session.session.expiresAt) {
      return null;
    }

    return session;
  } catch (error) {
    console.error("[GetSession] Error retrieving session:", error);
    return null;
  }
}

/**
 * Require session from Next.js server context
 * 
 * @throws AuthenticationError if not authenticated
 */
export async function requireSession() {
  const session = await getValidSession();
  if (!session) {
    throw new AuthenticationError("Authentication required");
  }
  return session;
}

/**
 * Get session from Hono context
 * 
 * @param c Hono Context
 * @returns The session or null if not authenticated
 */
export async function getSessionFromContext(c: Context) {
  try {
    const cookie = c.req.header("cookie");
    const headerObj: Record<string, string> = cookie ? { Cookie: cookie } : {};
    
    const session = await auth.api.getSession({
      headers: headerObj,
    });

    if (!session) return null;

    // Check expiration
    if (new Date() > session.session.expiresAt) {
      return null;
    }

    return session;
  } catch (error) {
    console.error("[GetSession] Error retrieving session from context:", error);
    return null;
  }
}

/**
 * Require session from Hono context
 * 
 * @param c Hono Context
 * @throws AuthenticationError if not authenticated
 */
export async function requireSessionFromContext(c: Context) {
  const session = await getSessionFromContext(c);
  if (!session) {
    throw new AuthenticationError("Authentication required");
  }
  return session;
}

/**
 * Require admin role
 * 
 * @throws AuthorizationError if user is not an admin
 */
export async function requireAdminSession() {
  const session = await requireSession();
  if (!isAdminRole(session.user.role)) {
    throw new AuthorizationError("Admin access required");
  }
  return session;
}

/**
 * Require super admin role
 */
export async function requireSuperAdminSession() {
  const session = await requireSession();
  if (!isSuperAdminRole(session.user.role)) {
    throw new AuthorizationError("Super admin access required");
  }
  return session;
}
