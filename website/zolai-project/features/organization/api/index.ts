import { Hono } from "hono";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import { ok, created, internalError, unauthorized, forbidden } from "@/lib/api/response";
import {
  createOrganizationAction,
  getOrganizationsAction,
  getUserOrganizationsAction,
  getOrganizationMembersAction,
  inviteMemberAction,
  updateMemberRoleAction,
  removeMemberAction,
  switchOrganizationAction,
} from "@/features/organization/server/organization-actions";
import { requireMinRole } from "@/lib/auth/server-guards";

// Validation schemas
const createOrganizationSchema = z.object({
  name: z.string().min(1, "Name is required"),
  slug: z.string().min(1, "Slug is required").regex(/^[a-z0-9-]+$/, "Slug must contain only lowercase letters, numbers, and hyphens"),
  logo: z.string().url().optional(),
});

const inviteMemberSchema = z.object({
  organizationId: z.string().min(1, "Organization ID is required"),
  email: z.string().email("Valid email is required"),
  role: z.enum(["member", "admin"]).refine(val => ["member", "admin"].includes(val), {
    message: "Role must be 'member' or 'admin'"
  }),
});

const updateMemberSchema = z.object({
  memberId: z.string().min(1, "Member ID is required"),
  role: z.enum(["member", "admin", "owner"]).refine(val => ["member", "admin", "owner"].includes(val), {
    message: "Role must be 'member', 'admin', or 'owner'"
  }),
});

const switchOrganizationSchema = z.object({
  organizationId: z.string().min(1, "Organization ID is required"),
});

const organizations = new Hono()
   // GET /api/organizations - Get all organizations (admin) or user's organizations
   .get("/", async (c) => {
     const isAdmin = c.req.query("admin") === "true";
     
     if (isAdmin) {
       // Check if user has sufficient role for admin organization access
       if (!(await requireMinRole(c, "ADMIN"))) {
         return forbidden(c, "Insufficient role");
       }
       
       // Get all organizations (admin only)
       const result = await getOrganizationsAction();
       if (!result.success) {
         return unauthorized(c, result.error || "Failed to fetch organizations");
       }
       return ok(c, result.data || []);
     } else {
       // Get user's organizations
       const result = await getUserOrganizationsAction();
       if (!result.success) {
         return internalError(c, result.error || "Failed to fetch user organizations");
       }
       return ok(c, result.data || []);
     }
   })

   // POST /api/organizations - Create a new organization (Super Admin only)
   .post(
     "/",
     zValidator("json", createOrganizationSchema),
     async (c) => {
       // Check if user has sufficient role for organization creation (Super Admin only)
       if (!(await requireMinRole(c, "SUPER_ADMIN"))) {
         return forbidden(c, "Insufficient role");
       }
      const data = c.req.valid("json");
      
      const result = await createOrganizationAction(data);
      if (!result.success) {
        return internalError(c, result.error || "Failed to create organization");
      }
      
      return created(c, result.data);
    }
  )

  // GET /api/organizations/:id/members - Get organization members
  .get("/:id/members", async (c) => {
    const organizationId = c.req.param("id");
    
    const result = await getOrganizationMembersAction(organizationId);
    if (!result.success) {
      return internalError(c, result.error || "Failed to fetch organization members");
    }
    
    return ok(c, result.data || []);
  })

  // POST /api/organizations/invite - Invite member to organization
  .post(
    "/invite",
    zValidator("json", inviteMemberSchema),
    async (c) => {
      const data = c.req.valid("json");
      
      const result = await inviteMemberAction(data);
      if (!result.success) {
        return internalError(c, result.error || "Failed to invite member");
      }
      
      return created(c, result.data);
    }
  )

  // PATCH /api/organizations/members/:id - Update member role
  .patch(
    "/members/:id",
    zValidator("json", updateMemberSchema.omit({ memberId: true })),
    async (c) => {
      const memberId = c.req.param("id");
      const { role } = c.req.valid("json");
      
      const result = await updateMemberRoleAction({ memberId, role });
      if (!result.success) {
        return internalError(c, result.error || "Failed to update member role");
      }
      
      return ok(c, { message: "Member role updated successfully" });
    }
  )

  // DELETE /api/organizations/members/:id - Remove member from organization
  .delete("/members/:id", async (c) => {
    const memberId = c.req.param("id");
    
    const result = await removeMemberAction(memberId);
    if (!result.success) {
      return internalError(c, result.error || "Failed to remove member");
    }
    
    return ok(c, { message: "Member removed successfully" });
  })

  // POST /api/organizations/switch - Switch active organization
  .post(
    "/switch",
    zValidator("json", switchOrganizationSchema),
    async (c) => {
      const { organizationId } = c.req.valid("json");
      
      const result = await switchOrganizationAction(organizationId);
      if (!result.success) {
        return internalError(c, result.error || "Failed to switch organization");
      }
      
      return ok(c, { message: "Organization switched successfully" });
    }
  );

export default organizations;