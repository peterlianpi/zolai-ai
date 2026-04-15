import { twoFactorClient, adminClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";
import { ac, user, viewer, contributor, author, editor, moderator, contentAdmin, admin, superAdmin } from "./auth/access-control";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  plugins: [
    twoFactorClient(),
    adminClient({
      ac,
      roles: {
        user,
        viewer,
        contributor,
        author,
        editor,
        moderator,
        contentAdmin,
        admin,
        superAdmin,
      },
    }),
  ],
});

export const {
  signIn,
  signUp,
  signOut,
  useSession,
  requestPasswordReset,
  resetPassword,
  changePassword,
} = authClient;
