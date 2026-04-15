/**
 * Unified permission system for client and server
 * Single source of truth for role-based access control
 */

export const PERMISSIONS = {
  // Content permissions
  CONTENT_READ: "content:read",
  CONTENT_CREATE: "content:create",
  CONTENT_EDIT: "content:edit", 
  CONTENT_DELETE: "content:delete",
  CONTENT_PUBLISH: "content:publish",
  
  // User management
  USER_READ: "user:read",
  USER_EDIT: "user:edit",
  USER_DELETE: "user:delete",
  USER_BAN: "user:ban",
  
  // Admin functions
  ADMIN_PANEL: "admin:panel",
  ADMIN_SETTINGS: "admin:settings",
  ADMIN_IMPERSONATE: "admin:impersonate",
  
  // System permissions
  SYSTEM_BACKUP: "system:backup",
  SYSTEM_CONFIG: "system:config",
} as const;

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

// Role definitions
export const ROLES = {
  USER: "user",
  VIEWER: "viewer", 
  CONTRIBUTOR: "contributor",
  AUTHOR: "author",
  EDITOR: "editor",
  MODERATOR: "moderator",
  CONTENT_ADMIN: "contentAdmin",
  ADMIN: "admin",
  SUPER_ADMIN: "superAdmin",
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

export const ALL_ROLES = Object.values(ROLES);

// Role-to-permissions mapping (strict)
export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  [ROLES.USER]: [PERMISSIONS.CONTENT_READ],
  [ROLES.VIEWER]: [PERMISSIONS.CONTENT_READ],
  [ROLES.CONTRIBUTOR]: [PERMISSIONS.CONTENT_READ, PERMISSIONS.CONTENT_CREATE],
  [ROLES.AUTHOR]: [PERMISSIONS.CONTENT_READ, PERMISSIONS.CONTENT_CREATE, PERMISSIONS.CONTENT_EDIT],
  [ROLES.EDITOR]: [
    PERMISSIONS.CONTENT_READ,
    PERMISSIONS.CONTENT_CREATE,
    PERMISSIONS.CONTENT_EDIT,
    PERMISSIONS.CONTENT_PUBLISH,
  ],
  [ROLES.MODERATOR]: [
    PERMISSIONS.CONTENT_READ,
    PERMISSIONS.CONTENT_CREATE,
    PERMISSIONS.CONTENT_EDIT,
    PERMISSIONS.CONTENT_DELETE,
    PERMISSIONS.USER_READ,
    PERMISSIONS.USER_BAN,
    PERMISSIONS.ADMIN_PANEL,
  ],
  [ROLES.CONTENT_ADMIN]: [
    PERMISSIONS.CONTENT_READ,
    PERMISSIONS.CONTENT_CREATE,
    PERMISSIONS.CONTENT_EDIT,
    PERMISSIONS.CONTENT_DELETE,
    PERMISSIONS.CONTENT_PUBLISH,
    PERMISSIONS.USER_READ,
    PERMISSIONS.ADMIN_PANEL,
  ],
  [ROLES.ADMIN]: [
    PERMISSIONS.CONTENT_READ,
    PERMISSIONS.CONTENT_CREATE,
    PERMISSIONS.CONTENT_EDIT,
    PERMISSIONS.CONTENT_DELETE,
    PERMISSIONS.CONTENT_PUBLISH,
    PERMISSIONS.USER_READ,
    PERMISSIONS.USER_EDIT,
    PERMISSIONS.USER_DELETE,
    PERMISSIONS.USER_BAN,
    PERMISSIONS.ADMIN_PANEL,
    PERMISSIONS.ADMIN_SETTINGS,
  ],
  [ROLES.SUPER_ADMIN]: [
    PERMISSIONS.CONTENT_READ,
    PERMISSIONS.CONTENT_CREATE,
    PERMISSIONS.CONTENT_EDIT,
    PERMISSIONS.CONTENT_DELETE,
    PERMISSIONS.CONTENT_PUBLISH,
    PERMISSIONS.USER_READ,
    PERMISSIONS.USER_EDIT,
    PERMISSIONS.USER_DELETE,
    PERMISSIONS.USER_BAN,
    PERMISSIONS.ADMIN_PANEL,
    PERMISSIONS.ADMIN_SETTINGS,
    PERMISSIONS.ADMIN_IMPERSONATE,
    PERMISSIONS.SYSTEM_BACKUP,
    PERMISSIONS.SYSTEM_CONFIG,
  ],
};

// Admin roles (for quick checks)
export const ADMIN_ROLES: Role[] = [ROLES.ADMIN, ROLES.SUPER_ADMIN, ROLES.CONTENT_ADMIN, ROLES.MODERATOR];

// Core permission functions (work on both client and server)
// Normalize role string to camelCase (e.g., "SUPER_ADMIN" → "superAdmin")
function normalizeRole(r: string): string {
  if (!r) return r;
  return r.replace(/_([a-z])/gi, (_, c) => c.toUpperCase()).replace(/^[A-Z]/, (c) => c.toLowerCase());
}

export function hasPermission(userRole: string | null | undefined, permission: Permission): boolean {
  if (!userRole) return false;
  // Try exact match first, then normalized
  let permissions = ROLE_PERMISSIONS[userRole as Role];
  if (!permissions) {
    const normalized = normalizeRole(userRole) as Role;
    permissions = ROLE_PERMISSIONS[normalized] || [];
  }
  return permissions.includes(permission);
}

export function hasAnyPermission(userRole: string | null | undefined, permissions: Permission[]): boolean {
  return permissions.some(permission => hasPermission(userRole, permission));
}

export function hasAllPermissions(userRole: string | null | undefined, permissions: Permission[]): boolean {
  return permissions.every(permission => hasPermission(userRole, permission));
}

export function isAdmin(userRole: string | null | undefined): boolean {
  if (!userRole) return false;
  // Try exact match first, then lowercase
  if (ADMIN_ROLES.includes(userRole as Role)) return true;
  const normalizedRole = userRole.toLowerCase() as Role;
  return ADMIN_ROLES.includes(normalizedRole);
}

export function isSuperAdmin(userRole: string | null | undefined): boolean {
  if (!userRole) return false;
  // Check exact match first, then normalized
  if (userRole === ROLES.SUPER_ADMIN) return true;
  const normalized = normalizeRole(userRole);
  return normalized === ROLES.SUPER_ADMIN;
}
