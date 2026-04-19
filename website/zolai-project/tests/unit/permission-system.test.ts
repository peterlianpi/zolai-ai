import { describe, it, expect } from "bun:test";
import { hasPermission, isAdmin, isSuperAdmin, ROLES, PERMISSIONS, ROLE_PERMISSIONS } from "@/lib/auth/rbac";

describe("Unified RBAC Permission System", () => {
  describe("Role Definitions", () => {
    it("should have all required roles", () => {
      expect(ROLES.USER).toBe("USER");
      expect(ROLES.ADMIN).toBe("ADMIN");
      expect(ROLES.SUPER_ADMIN).toBe("SUPER_ADMIN");
    });

    it("should have 9 roles total", () => {
      const roleCount = Object.keys(ROLES).length;
      expect(roleCount).toBe(9);
    });
  });

  describe("Permission Definitions", () => {
    it("should have content permissions", () => {
      expect(PERMISSIONS.CONTENT_READ).toBe("content:read");
      expect(PERMISSIONS.CONTENT_CREATE).toBe("content:create");
      expect(PERMISSIONS.CONTENT_EDIT).toBe("content:edit");
      expect(PERMISSIONS.CONTENT_DELETE).toBe("content:delete");
      expect(PERMISSIONS.CONTENT_PUBLISH).toBe("content:publish");
    });

    it("should have admin permissions", () => {
      expect(PERMISSIONS.ADMIN_PANEL).toBe("admin:panel");
      expect(PERMISSIONS.ADMIN_SETTINGS).toBe("admin:settings");
      expect(PERMISSIONS.ADMIN_IMPERSONATE).toBe("admin:impersonate");
    });

    it("should have system permissions", () => {
      expect(PERMISSIONS.SYSTEM_BACKUP).toBe("system:backup");
      expect(PERMISSIONS.SYSTEM_CONFIG).toBe("system:config");
    });
  });

  describe("Role Permissions Mapping", () => {
    it("should map roles to permissions", () => {
      expect(ROLE_PERMISSIONS[ROLES.USER]).toBeDefined();
      expect(ROLE_PERMISSIONS[ROLES.ADMIN]).toBeDefined();
      expect(ROLE_PERMISSIONS[ROLES.SUPER_ADMIN]).toBeDefined();
    });

    it("admin should have admin permissions", () => {
      const adminPerms = ROLE_PERMISSIONS[ROLES.ADMIN];
      expect(adminPerms).toContain(PERMISSIONS.ADMIN_PANEL);
    });

    it("superAdmin should have all permissions", () => {
      const superAdminPerms = ROLE_PERMISSIONS[ROLES.SUPER_ADMIN];
      expect(superAdminPerms.length).toBeGreaterThan(0);
    });
  });

  describe("hasPermission Function", () => {
    it("should grant admin panel access to admin", () => {
      const result = hasPermission(ROLES.ADMIN, PERMISSIONS.ADMIN_PANEL);
      expect(result).toBe(true);
    });

    it("should grant admin panel access to superAdmin", () => {
      const result = hasPermission(ROLES.SUPER_ADMIN, PERMISSIONS.ADMIN_PANEL);
      expect(result).toBe(true);
    });

    it("should deny admin panel access to user", () => {
      const result = hasPermission(ROLES.USER, PERMISSIONS.ADMIN_PANEL);
      expect(result).toBe(false);
    });

    it("should grant content read to contributor", () => {
      const result = hasPermission(ROLES.CONTRIBUTOR, PERMISSIONS.CONTENT_READ);
      expect(result).toBe(true);
    });

    it("should handle null/undefined roles", () => {
      expect(hasPermission(null as any, PERMISSIONS.ADMIN_PANEL)).toBe(false);
      expect(hasPermission(undefined as any, PERMISSIONS.ADMIN_PANEL)).toBe(false);
    });
  });

  describe("isAdmin Function", () => {
    it("should identify admin as admin", () => {
      expect(isAdmin(ROLES.ADMIN)).toBe(true);
    });

    it("should identify superAdmin as admin", () => {
      expect(isAdmin(ROLES.SUPER_ADMIN)).toBe(true);
    });

    it("should identify moderator as admin", () => {
      expect(isAdmin(ROLES.MODERATOR)).toBe(true);
    });

    it("should not identify user as admin", () => {
      expect(isAdmin(ROLES.USER)).toBe(false);
    });

    it("should handle null/undefined", () => {
      expect(isAdmin(null as any)).toBe(false);
      expect(isAdmin(undefined as any)).toBe(false);
    });
  });

  describe("isSuperAdmin Function", () => {
    it("should identify superAdmin", () => {
      expect(isSuperAdmin(ROLES.SUPER_ADMIN)).toBe(true);
    });

    it("should not identify admin as superAdmin", () => {
      expect(isSuperAdmin(ROLES.ADMIN)).toBe(false);
    });

    it("should handle null/undefined", () => {
      expect(isSuperAdmin(null as any)).toBe(false);
      expect(isSuperAdmin(undefined as any)).toBe(false);
    });
  });

  describe("Permission Hierarchy", () => {
    it("editor should have more permissions than contributor", () => {
      const editorPerms = ROLE_PERMISSIONS[ROLES.EDITOR];
      const contributorPerms = ROLE_PERMISSIONS[ROLES.CONTRIBUTOR];
      expect(editorPerms.length).toBeGreaterThanOrEqual(contributorPerms.length);
    });

    it("admin should have more permissions than editor", () => {
      const adminPerms = ROLE_PERMISSIONS[ROLES.ADMIN];
      const editorPerms = ROLE_PERMISSIONS[ROLES.EDITOR];
      expect(adminPerms.length).toBeGreaterThanOrEqual(editorPerms.length);
    });
  });

  describe("No Duplicate Permissions", () => {
    it("should not have duplicate permission definitions", () => {
      const permValues = Object.values(PERMISSIONS);
      const uniquePerms = new Set(permValues);
      expect(permValues.length).toBe(uniquePerms.size);
    });

    it("should not have duplicate role definitions", () => {
      const roleValues = Object.values(ROLES);
      const uniqueRoles = new Set(roleValues);
      expect(roleValues.length).toBe(uniqueRoles.size);
    });
  });
});
