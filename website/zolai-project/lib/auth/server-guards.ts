/**
 * Server-side permission guards for API routes and pages
 */

import { Context } from "hono";
import { auth } from "@/lib/auth";
import { hasPermission, isAdmin, isSuperAdmin, Permission } from "./rbac";

// Hono context helpers
export async function getSession(c: Context) {
  const cookie = c.req.header("cookie");
  const headerObj: Record<string, string> = cookie ? { Cookie: cookie } : {};
  return auth.api.getSession({ headers: headerObj });
}

export async function getSessionUserId(c: Context): Promise<string | null> {
  const session = await getSession(c);
  return session?.user?.id ?? null;
}

export async function getSessionFromContext(c: Context) {
  return getSession(c);
}

export async function getIpAndUa(c: Context) {
  return {
    ipAddress: c.req.header("x-forwarded-for") ?? c.req.header("x-real-ip") ?? null,
    userAgent: c.req.header("user-agent") ?? null,
  };
}

export async function checkIsAdmin(c: Context): Promise<boolean> {
  const session = await getSession(c);
  return session?.user ? isAdmin(session.user.role) : false;
}

export async function checkIsSuperAdmin(c: Context): Promise<boolean> {
  const session = await getSession(c);
  return session?.user ? isSuperAdmin(session.user.role) : false;
}

// Role hierarchy helpers
const ROLE_HIERARCHY: Record<string, number> = {
  user: 0,
  viewer: 0,
  contributor: 1,
  author: 2,
  editor: 3,
  moderator: 4,
  contentAdmin: 4,
  admin: 5,
  superAdmin: 6,
};

export async function requireMinRole(c: Context, minRole: string): Promise<boolean> {
  const session = await getSession(c);
  if (!session?.user) return false;
  
  // Normalize role to camelCase (e.g., "SUPER_ADMIN" → "superAdmin")
  const normalize = (r: string | null | undefined): string => {
    if (!r) return "";
    if (r === r.toUpperCase()) return r.toLowerCase().replace(/_([a-z])/g, (_, c) => c.toUpperCase());
    return r;
  };
  
  const userLevel = ROLE_HIERARCHY[normalize(session.user.role)] ?? 0;
  const requiredLevel = ROLE_HIERARCHY[normalize(minRole)] ?? 999;
  
  return userLevel >= requiredLevel;
}

export function forbiddenRoleJson(c: Context) {
  return c.json({ error: { code: "FORBIDDEN", message: "Insufficient role" } }, 403);
}

export async function requireAuth(c: Context) {
  const session = await getSession(c);
  if (!session?.user) {
    return c.json({ error: { code: "UNAUTHORIZED", message: "Authentication required" } }, 401);
  }
  return session;
}

export async function requirePermission(c: Context, permission: Permission) {
  const session = await getSession(c);
  if (!session?.user || !hasPermission(session.user.role, permission)) {
    return c.json({ error: { code: "FORBIDDEN", message: "Insufficient permissions" } }, 403);
  }
  return session;
}

export async function requireAdmin(c: Context) {
  const session = await getSession(c);
  if (!session?.user || !isAdmin(session.user.role)) {
    return c.json({ error: { code: "FORBIDDEN", message: "Admin access required" } }, 403);
  }
  return session;
}

// Next.js page helpers
export async function getServerSession() {
  // Import the fixed version that handles URL-encoded cookies from Hono
  const { getServerSession: getSession } = await import("@/lib/auth/server");
  return getSession();
}

export async function requireServerAuth() {
  const session = await getServerSession();
  if (!session?.user) {
    throw new Error("Authentication required");
  }
  return session;
}

export async function requireServerPermission(permission: Permission) {
  const session = await getServerSession();
  if (!session?.user || !hasPermission(session.user.role, permission)) {
    throw new Error("Insufficient permissions");
  }
  return session;
}

export async function requireServerAdmin() {
  const session = await getServerSession();
  if (!session?.user || !isAdmin(session.user.role)) {
    throw new Error("Admin access required");
  }
  return session;
}
