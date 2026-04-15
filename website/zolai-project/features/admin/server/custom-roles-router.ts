import { Hono } from "hono";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import prisma from "@/lib/prisma";
import { ok, badRequest, forbidden, internalError } from "@/lib/api/response";
import { requireMinRole } from "@/lib/auth/server-guards";
import { PERMISSIONS } from "@/lib/auth/rbac";

const customRolesRouter = new Hono()
  // Get all custom roles
  .get("/", async (c) => {
    if (!(await requireMinRole(c, "ADMIN"))) {
      return forbidden(c, "Insufficient role");
    }

    try {
      const roles = await prisma.customRole.findMany({
        include: {
          permissions: {
            include: { permission: true },
          },
        },
        orderBy: { createdAt: "desc" },
      });

      return ok(c, roles);
    } catch (error) {
      console.error("[Custom Roles] Error fetching roles:", error);
      return internalError(c, "Failed to fetch roles");
    }
  })

  // Create custom role
  .post(
    "/",
    zValidator(
      "json",
      z.object({
        name: z.string().min(1).max(50),
        description: z.string().optional(),
        baseRole: z.enum(["USER", "VIEWER", "CONTRIBUTOR", "AUTHOR", "EDITOR", "MODERATOR", "CONTENT_ADMIN", "ADMIN", "SUPER_ADMIN"]),
        permissions: z.array(z.string()).optional(),
      })
    ),
    async (c) => {
      if (!(await requireMinRole(c, "SUPER_ADMIN"))) {
        return forbidden(c, "Only super admins can create roles");
      }

      const { name, description, baseRole, permissions } = c.req.valid("json");

      try {
        // Check if role name already exists
        const existing = await prisma.customRole.findUnique({ where: { name } });
        if (existing) {
          return badRequest(c, "Role name already exists");
        }

        // Create role
        const role = await prisma.customRole.create({
          data: {
            name,
            description,
            baseRole: baseRole as never,
          },
        });

        // Add permissions if provided
        if (permissions && permissions.length > 0) {
          const perms = await prisma.permission.findMany({
            where: { name: { in: permissions } },
          });

          await Promise.all(
            perms.map((perm) =>
              prisma.rolePermission.create({
                data: { roleId: role.id, permissionId: perm.id },
              })
            )
          );
        }

        return ok(c, { role, message: "Role created successfully" });
      } catch (error) {
        console.error("[Custom Roles] Error creating role:", error);
        return internalError(c, "Failed to create role");
      }
    }
  )

  // Update custom role
  .patch(
    "/:id",
    zValidator(
      "json",
      z.object({
        name: z.string().optional(),
        description: z.string().optional(),
        isActive: z.boolean().optional(),
      })
    ),
    async (c) => {
      if (!(await requireMinRole(c, "SUPER_ADMIN"))) {
        return forbidden(c, "Only super admins can update roles");
      }

      const { id } = c.req.param();
      const data = c.req.valid("json");

      try {
        const role = await prisma.customRole.update({
          where: { id },
          data,
          include: { permissions: { include: { permission: true } } },
        });

        return ok(c, { role, message: "Role updated successfully" });
      } catch (error) {
        console.error("[Custom Roles] Error updating role:", error);
        return internalError(c, "Failed to update role");
      }
    }
  )

  // Delete custom role
  .delete("/:id", async (c) => {
    if (!(await requireMinRole(c, "SUPER_ADMIN"))) {
      return forbidden(c, "Only super admins can delete roles");
    }

    const { id } = c.req.param();

    try {
      await prisma.customRole.delete({ where: { id } });
      return ok(c, { message: "Role deleted successfully" });
    } catch (error) {
      console.error("[Custom Roles] Error deleting role:", error);
      return internalError(c, "Failed to delete role");
    }
  })

  // Add permission to role
  .post(
    "/:id/permissions",
    zValidator("json", z.object({ permissionName: z.string() })),
    async (c) => {
      if (!(await requireMinRole(c, "SUPER_ADMIN"))) {
        return forbidden(c, "Only super admins can manage permissions");
      }

      const { id } = c.req.param();
      const { permissionName } = c.req.valid("json");

      try {
        // Get or create permission
        let permission = await prisma.permission.findUnique({
          where: { name: permissionName },
        });

        if (!permission) {
          const category = permissionName.split(":")[0] || "other";
          permission = await prisma.permission.create({
            data: {
              name: permissionName,
              category,
            },
          });
        }

        // Add to role
        const rolePermission = await prisma.rolePermission.create({
          data: { roleId: id, permissionId: permission.id },
        });

        return ok(c, { rolePermission, message: "Permission added to role" });
      } catch (error: unknown) {
        const err = error as { code?: string };
        if (err.code === "P2002") {
          return badRequest(c, "Permission already assigned to role");
        }
        console.error("[Custom Roles] Error adding permission:", error);
        return internalError(c, "Failed to add permission");
      }
    }
  )

  // Remove permission from role
  .delete("/:id/permissions/:permissionId", async (c) => {
    if (!(await requireMinRole(c, "SUPER_ADMIN"))) {
      return forbidden(c, "Only super admins can manage permissions");
    }

    const { id, permissionId } = c.req.param();

    try {
      await prisma.rolePermission.deleteMany({
        where: { roleId: id, permissionId },
      });

      return ok(c, { message: "Permission removed from role" });
    } catch (error) {
      console.error("[Custom Roles] Error removing permission:", error);
      return internalError(c, "Failed to remove permission");
    }
  });

// Permissions router
const permissionsRouter = new Hono()
  // Get all available permissions
  .get("/", async (c) => {
    if (!(await requireMinRole(c, "ADMIN"))) {
      return forbidden(c, "Insufficient role");
    }

    try {
      const permissions = await prisma.permission.findMany({
        orderBy: { category: "asc" },
      });

      return ok(c, permissions);
    } catch (error) {
      console.error("[Permissions] Error fetching permissions:", error);
      return internalError(c, "Failed to fetch permissions");
    }
  })

  // Get predefined permissions
  .get("/predefined", async (c) => {
    return ok(c, PERMISSIONS);
  });

export { customRolesRouter, permissionsRouter };
