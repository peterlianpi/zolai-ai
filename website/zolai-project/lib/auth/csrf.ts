/**
 * CSRF Protection Module
 * 
 * Implements token-based CSRF protection for mutations (POST, PUT, PATCH, DELETE)
 * Works with Hono middleware pattern
 */

import prisma from "@/lib/prisma";
import type { Context, Next } from "hono";
import { getCookie } from "hono/cookie";

const CSRF_TOKEN_NAME = "csrf-token";
const CSRF_TOKEN_COOKIE = "__csrf-token";

/**
 * Validate CSRF token from a Hono context.
 * Reads the stored token from the httpOnly cookie and compares
 * against the X-CSRF-Token header (JSON/API) or form field (form posts).
 */
async function validateCSRFToken(c: Context): Promise<boolean> {
  try {
    const storedToken = getCookie(c, CSRF_TOKEN_COOKIE);
    if (!storedToken) return false;

    // Header first — preferred for all RPC/JSON requests
    const receivedToken =
      c.req.header("X-CSRF-Token") ||
      c.req.header("x-csrf-token") ||
      (() => {
        const ct = c.req.header("content-type") ?? "";
        if (ct.includes("application/x-www-form-urlencoded")) {
          // For form posts the token may come as a query param fallback
          return new URL(c.req.url).searchParams.get("csrf_token") ??
                 new URL(c.req.url).searchParams.get(CSRF_TOKEN_NAME);
        }
        return null;
      })();

    if (!receivedToken) return false;
    return receivedToken === storedToken;
  } catch (error) {
    console.error("[CSRF] Token validation error:", error);
    return false;
  }
}

/**
 * Hono Middleware for CSRF protection
 */
export const csrfMiddleware = async (c: Context, next: Next) => {
  if (["GET", "HEAD", "OPTIONS", "TRACE"].includes(c.req.method)) {
    return next();
  }

  const path = new URL(c.req.url).pathname;
  if (path === "/api/csrf-token") {
    return next();
  }

  const authHeader = c.req.header("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    return next();
  }

  const isValid = await validateCSRFToken(c);

  if (!isValid) {
    await logCSRFViolation(c.req.raw, "Invalid or missing CSRF token");
    return c.json(
      { error: { code: "CSRF_TOKEN_INVALID", message: "Invalid or missing CSRF token. Please refresh the page." } },
      403
    );
  }

  return next();
};

/**
 * Log CSRF token usage for security monitoring
 */
export async function logCSRFViolation(
  request: Request,
  reason: string,
  userId?: string,
) {
  try {
    const headersList = request.headers;
    const ip = 
      headersList.get("x-forwarded-for")?.split(",")[0] ||
      headersList.get("x-real-ip") ||
      "unknown";

    await prisma.securityEvent.create({
      data: {
        type: "INVALID_TOKEN",
        ip: ip.trim(),
        userAgent: headersList.get("user-agent") || "unknown",
        userId,
        severity: "MEDIUM",
        details: JSON.stringify({
          reason: "CSRF token violation",
          endpoint: new URL(request.url).pathname,
          method: request.method,
          detail: reason,
        }),
      },
    }).catch(() => {
      // Ignore errors
    });
  } catch (error) {
    console.error("[CSRF] Failed to log violation:", error);
  }
}
