/**
 * CSRF Protection Module
 * 
 * Implements token-based CSRF protection for mutations (POST, PUT, PATCH, DELETE)
 * Works with Hono middleware pattern
 */

import { randomBytes } from "crypto";
import { cookies } from "next/headers";
import prisma from "@/lib/prisma";
import type { Context, Next } from "hono";

const CSRF_TOKEN_NAME = "csrf-token";
const CSRF_TOKEN_COOKIE = "__csrf-token";
const CSRF_TOKEN_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Generate a new CSRF token
 */
function generateToken(): string {
  return randomBytes(32).toString("hex");
}

/**
 * Generate CSRF token pair (token + cookie)
 * Store in encrypted cookie and return token for form/header
 */
export async function generateCSRFToken(): Promise<string> {
  try {
    const token = generateToken();
    const cookieJar = await cookies();
    
    // Store token in secure, httpOnly cookie
    cookieJar.set(CSRF_TOKEN_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: CSRF_TOKEN_EXPIRY,
      path: "/",
    });

    return token;
  } catch (error) {
    console.error("[CSRF] Failed to generate token:", error);
    throw new Error("Failed to generate CSRF token");
  }
}

/**
 * Validate CSRF token from request
 * 
 * Expects token in:
 * - Header: X-CSRF-Token
 * - Form field: csrf-token
 * - Query param: csrf_token
 */
export async function validateCSRFToken(
  request: Request,
): Promise<boolean> {
  try {
    const cookieJar = await cookies();
    const storedToken = cookieJar.get(CSRF_TOKEN_COOKIE)?.value;

    if (!storedToken) {
      return false;
    }

    // Check header first (API requests)
    let receivedToken = request.headers.get("X-CSRF-Token") || request.headers.get("x-csrf-token");

    // Check form data if not in header
    if (!receivedToken && request.method !== "GET" && request.method !== "HEAD") {
      try {
        const contentType = request.headers.get("content-type");
        
        if (contentType?.includes("application/json")) {
          // Note: cloned() is important if we need to read the body again later
          const body = await request.clone().json();
          receivedToken = body[CSRF_TOKEN_NAME];
        } else if (contentType?.includes("application/x-www-form-urlencoded") || contentType?.includes("multipart/form-data")) {
          const formData = await request.clone().formData();
          receivedToken = formData.get(CSRF_TOKEN_NAME) as string;
        }
      } catch (error) {
        // Ignore body parsing errors - check query param
        console.warn("[CSRF] Failed to parse body for token:", error);
      }
    }

    // Check query param
    if (!receivedToken) {
      const url = new URL(request.url);
      receivedToken = url.searchParams.get("csrf_token") || url.searchParams.get(CSRF_TOKEN_NAME);
    }

    if (!receivedToken) {
      return false;
    }

    // Validate token matches
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
  // Skip for non-mutating methods
  if (["GET", "HEAD", "OPTIONS", "TRACE"].includes(c.req.method)) {
    return next();
  }

  // Skip for Bearer tokens (standard API access)
  const authHeader = c.req.header("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    return next();
  }

  // Validate CSRF token
  const isValid = await validateCSRFToken(c.req.raw);
  
  if (!isValid) {
    await logCSRFViolation(c.req.raw, "Invalid or missing CSRF token");
    return c.json(
      { 
        error: { 
          code: "CSRF_TOKEN_INVALID",
          message: "Invalid or missing CSRF token. Please refresh the page." 
        } 
      },
      403
    );
  }

  return next();
};

/**
 * Middleware for protecting API routes with CSRF tokens
 * 
 * Usage with Hono:
 * ```typescript
 * const routes = app.post("/api/action", 
 *   csrfMiddleware,
 *   actionHandler
 * );
 * ```
 * @deprecated Use csrfMiddleware for Hono routes
 */
export function createCSRFMiddleware() {
  return async (request: Request) => {
    // Only validate for state-changing methods
    if (!["POST", "PUT", "PATCH", "DELETE"].includes(request.method)) {
      return null; // Not applicable
    }

    // Skip validation for API keys or bearer tokens
    const authHeader = request.headers.get("authorization");
    if (authHeader?.startsWith("Bearer ")) {
      return null; // External API - skip CSRF
    }

    // Validate CSRF token
    const isValid = await validateCSRFToken(request);
    
    if (!isValid) {
      return new Response(
        JSON.stringify({ 
          error: { 
            code: "CSRF_TOKEN_INVALID",
            message: "Invalid or missing CSRF token" 
          } 
        }),
        { 
          status: 403, 
          headers: { "Content-Type": "application/json" } 
        },
      );
    }

    return null; // Continue to handler
  };
}


/**
 * Get CSRF token for forms/API calls
 * 
 * Call on page load to generate token
 */
export async function getOrCreateCSRFToken(): Promise<string> {
  const cookieJar = await cookies();
  let token = cookieJar.get(CSRF_TOKEN_COOKIE)?.value;

  if (!token) {
    token = await generateCSRFToken();
  }

  return token;
}

/**
 * Revoke CSRF token (logout, password change, etc.)
 */
export async function revokeCSRFToken() {
  try {
    const cookieJar = await cookies();
    cookieJar.delete(CSRF_TOKEN_COOKIE);
  } catch (error) {
    console.error("[CSRF] Failed to revoke token:", error);
  }
}

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
        type: "SUSPICIOUS_LOGIN",
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
