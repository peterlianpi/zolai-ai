import type { Context } from "hono";
import { requireMinRole, forbiddenRoleJson, getSession } from "@/lib/auth/server-guards";

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
  const session = await getSession(c);
  if (!session?.user) {
    return c.json({ error: { code: "UNAUTHORIZED", message: "Authentication required" } }, 401);
  }
  
  const isAdmin = await requireMinRole(c, "ADMIN");
  if (!isAdmin) {
    return forbiddenRoleJson(c);
  }
  await next();
}
