/**
 * Better Auth Access Control Configuration
 * Defines permissions and roles for the admin plugin
 */

import { createAccessControl } from "better-auth/plugins/access";
import { defaultStatements, adminAc } from "better-auth/plugins/admin/access";

// Define custom permissions alongside default admin permissions
export const statement = {
  ...defaultStatements,
  content: ["create", "edit", "delete", "publish"],
  system: ["backup", "config"],
} as const;

export const ac = createAccessControl(statement);

// Define roles with their permissions
export const user = ac.newRole({
  user: ["get"],
});

export const viewer = ac.newRole({
  user: ["get"],
});

export const contributor = ac.newRole({
  user: ["get"],
  content: ["create"],
});

export const author = ac.newRole({
  user: ["get"],
  content: ["create", "edit"],
});

export const editor = ac.newRole({
  user: ["get"],
  content: ["create", "edit", "delete", "publish"],
});

export const moderator = ac.newRole({
  user: ["get", "ban"],
  content: ["create", "edit", "delete"],
  session: ["list", "revoke"],
});

export const contentAdmin = ac.newRole({
  user: ["get"],
  content: ["create", "edit", "delete", "publish"],
  session: ["list", "revoke"],
});

export const admin = ac.newRole({
  ...adminAc.statements,
  content: ["create", "edit", "delete", "publish"],
  system: ["backup"],
});

export const superAdmin = ac.newRole({
  ...adminAc.statements,
  content: ["create", "edit", "delete", "publish"],
  system: ["backup", "config"],
});
