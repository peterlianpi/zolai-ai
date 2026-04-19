import { Hono } from "hono";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import prisma from "@/lib/prisma";
import { getSessionUserId } from "@/lib/auth/server-guards";
import { toAuditJson } from "@/lib/audit";
import { ok, notFound, badRequest, unauthorized, forbidden, internalError } from "@/lib/api/response";
import { requireMinRole } from "@/lib/auth/server-guards";
import { ALL_ROLES } from "@/lib/auth/roles";
import { UserRole } from "@/lib/generated/prisma";

// Validation schemas
const updateUserRoleSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  role: z.enum(ALL_ROLES as unknown as [string, ...string[]]),
  reason: z.string().optional().refine((val) => val === undefined || val.length <= 500, {
    message: "Reason must be at most 500 characters",
  }),
});

const bulkRoleUpdateSchema = z.object({
  userIds: z.array(z.string().min(1)).min(1, "At least one user ID is required"),
  role: z.enum(ALL_ROLES as unknown as [string, ...string[]]),
  reason: z.string().optional().refine((val) => val === undefined || val.length <= 500, {
    message: "Reason must be at most 500 characters",
  }),
});

const roleManagement = new Hono()
  // Get role distribution metrics
  .get(
    "/metrics",
    async (c) => {
      // Check if user has sufficient role for role metrics (admin only)
      if (!(await requireMinRole(c, "ADMIN"))) {
        return forbidden(c, "Insufficient role");
      }

      try {
        const roleCounts = await prisma.user.groupBy({
          by: ["role"],
          _count: true,
          where: { deletedAt: null, banned: { not: true } },
        });

        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const roleChangeWhere = {
          action: "UPDATE" as const,
          entityType: "User",
          createdAt: { gte: thirtyDaysAgo },
        };

        const [roleChanges, recentRoleChanges] = await Promise.all([
          prisma.auditLog.count({ where: roleChangeWhere }),
          prisma.auditLog.findMany({
            where: roleChangeWhere,
            orderBy: { createdAt: "desc" },
            take: 10,
            select: {
              id: true,
              createdAt: true,
              oldValues: true,
              newValues: true,
              entityId: true,
              createdById: true,
            },
          }),
        ]);

        const affectedUserIds = [...new Set(recentRoleChanges.map((c) => c.entityId))];
        const changedByIds = [...new Set(recentRoleChanges.map((c) => c.createdById).filter(Boolean))] as string[];
        const [affectedUsers, changedByUsers] = await Promise.all([
          prisma.user.findMany({ where: { id: { in: affectedUserIds } }, select: { id: true, name: true, email: true } }),
          prisma.user.findMany({ where: { id: { in: changedByIds } }, select: { id: true, name: true } }),
        ]);
        const userMap = Object.fromEntries(affectedUsers.map((u) => [u.id, u]));
        const changedByMap = Object.fromEntries(changedByUsers.map((u) => [u.id, u]));

        return ok(c, {
          roleDistribution: roleCounts.reduce((acc, { role, _count }) => {
            acc[role] = _count;
            return acc;
          }, {} as Record<string, number>),
          roleChangesLast30Days: roleChanges,
          recentRoleChanges: recentRoleChanges.map((change) => ({
            id: change.id,
            timestamp: change.createdAt,
            affectedUser: userMap[change.entityId] ?? null,
            oldRole: (change.oldValues as Record<string, string> | null)?.role ?? null,
            newRole: (change.newValues as Record<string, string> | null)?.role ?? null,
            changedBy: change.createdById ? (changedByMap[change.createdById] ?? null) : null,
          })),
        });
      } catch (error) {
        console.error("[Role Management] Error fetching metrics:", error);
        return internalError(c, "Failed to fetch role metrics");
      }
    }
  )
  // Update a single user's role
  .post(
    "/update-role",
    zValidator("json", updateUserRoleSchema),
    async (c) => {
      // Check if user has sufficient role for role updates (admin only)
      if (!(await requireMinRole(c, "ADMIN"))) {
        return forbidden(c, "Insufficient role");
      }

      const { userId, role: roleStr, reason } = c.req.valid("json");
        const role = roleStr as UserRole;

      try {
        // Check if user exists
        const user = await prisma.user.findUnique({
          where: { id: userId },
        });

        if (!user) {
          return notFound(c, "User not found");
        }

        // Prevent users from modifying their own role to prevent self-promotion/demotion
        const currentUserId = await getSessionUserId(c);
        if (!currentUserId) {
          return unauthorized(c, "Not authenticated");
        }
        if (currentUserId === userId) {
          return badRequest(c, "You cannot modify your own role");
        }

        // Store old role for audit
        const oldRole = user.role;

        // Update user role
        const updatedUser = await prisma.user.update({
          where: { id: userId },
          data: {
            role,
            // Track when role was last changed
            updatedAt: new Date(),
          },
        });

        // Create audit log entry for role change
        await prisma.auditLog.create({
          data: {
            action: "UPDATE",
            entityType: "User",
            entityId: userId,
            oldValues: toAuditJson({ role: oldRole }),
            newValues: toAuditJson({ role }),
            details: reason
              ? `Role changed from ${oldRole} to ${role}. Reason: ${reason}`
              : `Role changed from ${oldRole} to ${role}`,
            createdById: currentUserId,
          },
        });

        return ok(c, {
          user: {
            id: updatedUser.id,
            name: updatedUser.name,
            email: updatedUser.email,
            role: updatedUser.role,
          },
          message: `User role updated from ${oldRole} to ${role}`,
        });
      } catch (error) {
        console.error("[Role Management] Error updating user role:", error);
        return internalError(c, "Failed to update user role");
      }
    }
  )
  // Bulk update user roles
  .post(
    "/bulk-update-role",
    zValidator("json", bulkRoleUpdateSchema),
    async (c) => {
      // Check if user has sufficient role for bulk role updates (admin only)
      if (!(await requireMinRole(c, "ADMIN"))) {
        return forbidden(c, "Insufficient role");
      }

      const { userIds, role: roleStr2, reason } = c.req.valid("json");
        const role = roleStr2 as UserRole;

      try {
        // Check if all users exist
        const users = await prisma.user.findMany({
          where: {
            id: { in: userIds },
            deletedAt: null,
            banned: false,
          },
        });

        if (users.length !== userIds.length) {
          return notFound(c, "One or more users not found");
        }

        // Prevent users from modifying their own role
        const currentUserId = await getSessionUserId(c);
        if (!currentUserId) {
          return unauthorized(c, "Not authenticated");
        }
        const selfInList = userIds.includes(currentUserId);
        if (selfInList) {
          return badRequest(c, "You cannot modify your own role");
        }

        // Store old roles for audit
        const oldRoles = users.reduce((acc, user) => {
          acc[user.id] = user.role;
          return acc;
        }, {} as Record<string, string>);

        // Update user roles in bulk
        const result = await prisma.user.updateMany({
          where: {
            id: { in: userIds },
          },
          data: {
            role,
            updatedAt: new Date(),
          },
        });

        // Create audit log entries for each role change
        const auditPromises = userIds.map((userId) =>
          prisma.auditLog.create({
            data: {
              action: "UPDATE",
              entityType: "User",
              entityId: userId,
              oldValues: toAuditJson({ role: oldRoles[userId] }),
              newValues: toAuditJson({ role }),
              details: reason
                ? `Role changed from ${oldRoles[userId]} to ${role}. Reason: ${reason}`
                : `Role changed from ${oldRoles[userId]} to ${role}`,
              createdById: currentUserId,
            },
          })
        );

        await Promise.all(auditPromises);

        return ok(c, {
          count: result.count,
          message: `${result.count} user roles updated to ${role}`,
        });
      } catch (error) {
        console.error("[Role Management] Error bulk updating user roles:", error);
        return internalError(c, "Failed to bulk update user roles");
      }
    }
  );

export default roleManagement;
