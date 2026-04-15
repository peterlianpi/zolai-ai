import type { Context } from "hono";
import { requireMinRole, forbiddenRoleJson } from "@/lib/auth/server-guards";

/**
 * Safely convert any value to an object for audit log JSON fields
 */
export function toAuditJson(value: unknown): object {
  return typeof value === "object" && value !== null ? value : {};
}

/**
 * Hono middleware that requires admin access.
 * Apply to admin-only routers to avoid repeating checkIsAdmin in every handler.
 *
 * Usage:
 *   const adminRouter = new Hono().use(adminMiddleware);
 *   adminRouter.get("/users", handler); // automatically protected
 */
export async function adminMiddleware(c: Context, next: () => Promise<void>) {
  const isAdmin = await requireMinRole(c, "ADMIN");
  if (!isAdmin) {
    return c.json(forbiddenRoleJson(), 403);
  }
  await next();
}
