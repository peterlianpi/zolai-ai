import { Hono } from "hono";
import { checkIsAdmin } from "@/lib/auth/server-guards";
import { ok, internalError } from "@/lib/api/response";

const app = new Hono()
  // GET /api/check-role - Check if current user is admin
  .get("/", async (c) => {
    try {
      const isAdmin = await checkIsAdmin(c);
      return ok(c, { isAdmin });
    } catch (_error) {
      return internalError(c, "Failed to check role");
    }
  });

export default app;