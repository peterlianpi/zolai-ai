/**
 * Canonical role definitions for backward compatibility
 */

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

export type AppRole = (typeof ROLES)[keyof typeof ROLES];

export { ALL_ROLES } from "./rbac";
export { isAdmin as isAdminRole, isSuperAdmin } from "./rbac";
