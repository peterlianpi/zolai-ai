import { redirect } from "next/navigation";
import { betterAuth, User } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { 
  admin, 
  organization, 
  twoFactor,
  captcha,
  haveIBeenPwned,
  multiSession
} from "better-auth/plugins";
import prisma from "./prisma";
import { sendEmail } from "@/lib/email/resend";
import { DEFAULT_SITE_NAME } from "@/lib/constants/site";
import {
  emailTemplates,
  generateTwoFactorOtpEmail,
} from "@/features/mail/components/templates";
import { ac, user, viewer, contributor, author, editor, moderator, contentAdmin, admin as adminRole, superAdmin } from "./auth/access-control";
import { logImpersonation } from "./auth/audit";

// Helper function to send 2FA OTP email
async function sendTwoFactorOtpEmail(
  email: string,
  userName: string,
  otp: string,
) {
  const { subject, html } = generateTwoFactorOtpEmail({
    name: userName,
    email,
    otp,
  });

  await sendEmail({
    to: email,
    subject,
    html,
  });
}

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  trustHost: true,
  advanced: {
    useSecureCookies: false,
    ipAddress: {
      ipv6Subnet: 64,
    },
  },
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  databaseHooks: {
    user: {
      create: {
        before: async (user) => {
          // Map Better Auth camelCase roles to Prisma uppercase enum
          const roleMap: Record<string, string> = {
            user: "USER", viewer: "USER", contributor: "EDITOR",
            author: "EDITOR", editor: "EDITOR", moderator: "EDITOR",
            contentAdmin: "ADMIN", admin: "ADMIN", superAdmin: "SUPER_ADMIN",
          };
          const incoming = (user.role as string) ?? "user";
          const mapped = roleMap[incoming] ?? incoming.toUpperCase();
          return { data: { ...user, role: mapped } };
        },
        after: async (user) => {
          const { notify } = await import("@/lib/telegram");
          notify(`👤 New signup: <b>${user.name}</b> (${user.email})`).catch(() => {});
        },
      },
    },
  },
  trustedOrigins: [
    process.env.NEXT_PUBLIC_APP_URL || "",
    process.env.BETTER_AUTH_URL || "",
    // Local development origins
    "http://localhost:3000",
    "http://localhost:3001",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:3001",
  ].filter(Boolean),
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day 
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5, // 5 minutes
    },
  },
  cookies: {
    sessionToken: {
      attributes: {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 7, // 7 days
      },
    },
  },
  rateLimit: {
    enabled: process.env.NODE_ENV === "production",
    window: 60, // 60 seconds
    max: 100,
    storage: "database",
    customRules: {
      "/sign-in/email": { window: 15 * 60, max: 5 },
      "/reset-password": { window: 60 * 60, max: 3 },
    },
  },
  emailAndPassword: {
    enabled: true,
    autoSignIn: false,
    requireEmailVerification: process.env.NODE_ENV === "production",
    sendResetPassword: async (
      { user, url, token: _ }: { user: User; url: string; token: string },
      _request?: Request,
    ): Promise<void> => {
      const { subject, html } = emailTemplates.passwordReset({
        name: user.name || user.email.split("@")[0],
        email: user.email,
        resetLink: url,
      });

      try {
        await sendEmail({
          to: user.email,
          subject,
          html,
        });
      } catch (error) {
        console.error("[Better Auth] Failed to send reset email:", error);
      }
    },
  },
  emailVerification: {
    autoSignInAfterVerification: true,
    sendOnSignUp: true,
    sendVerificationEmail: async (
      { user, url, token: _ }: { user: User; url: string; token: string },
      _request?: Request,
    ): Promise<void> => {
      const { subject, html } = emailTemplates.emailVerification({
        name: user.name || user.email.split("@")[0],
        email: user.email,
        verificationLink: url,
      });

      console.log("[Better Auth] Sending verification email to:", user.email);
      console.log("[Better Auth] Verification URL:", url);

      try {
        await sendEmail({
          to: user.email,
          subject,
          html,
        });
      } catch (error) {
        console.error("[Better Auth] Failed to send verification email:", error);
      }
    },

    onPasswordReset: async (
      { user }: { user: User },
      _request?: Request,
    ): Promise<void> => {
      const { subject, html } = emailTemplates.passwordChanged({
        name: user.name || user.email.split("@")[0],
        email: user.email,
      });

      await sendEmail({
        to: user.email,
        subject,
        html,
      });
    },
  },
  onVerifyEmail: async (
    { user: _ }: { user: User },
    request?: Request,
  ): Promise<void> => {
    // Redirect to the success page after email verification
    if (request) {
      const url = new URL(request.url);
      const callbackURL =
        url.searchParams.get("callbackURL") || "/verify-email/success";
      throw redirect(callbackURL);
    }
    throw redirect("/verify-email/success");
  },
  plugins: [
    admin({
      ac,
      roles: {
        user,
        viewer,
        contributor,
        author,
        editor,
        moderator,
        contentAdmin,
        admin: adminRole,
        superAdmin,
      },
      defaultRole: "user",
      adminRoles: ["admin", "superAdmin", "contentAdmin", "moderator"],
      impersonationSessionDuration: 60 * 60, // 1 hour (NIST recommendation)
      defaultBanReason: "Policy violation",
      defaultBanExpiresIn: 60 * 60 * 24 * 7, // 7 days
      bannedUserMessage: "Your account has been banned. Please contact support.",
      allowImpersonatingAdmins: false,
      onImpersonationStart: async (data: { actor: { id: string }; subject: { id: string } }) => {
        await logImpersonation(data.actor.id, data.subject.id, "start");
      },
      onImpersonationEnd: async (data: { actor: { id: string }; subject: { id: string } }) => {
        await logImpersonation(data.actor.id, data.subject.id, "end");
      },
    }),
    // Enhanced rate limiting with custom rules
    // (Already configured in main config above)
    
    // CAPTCHA protection — only active when key is configured
    ...(process.env.RECAPTCHA_SECRET_KEY ? [captcha({
      provider: "google",
      secretKey: process.env.RECAPTCHA_SECRET_KEY,
      endpoints: ["/sign-up/email", "/reset-password", "/forgot-password"],
    })] : process.env.HCAPTCHA_SECRET_KEY ? [captcha({
      provider: "hcaptcha",
      secretKey: process.env.HCAPTCHA_SECRET_KEY,
      endpoints: ["/sign-up/email", "/reset-password", "/forgot-password"],
    })] : []),
    
    // Password breach detection 
    haveIBeenPwned({
      paths: ["/sign-up/email", "/change-password", "/reset-password"],
      enabled: process.env.NODE_ENV === "production",
      customPasswordCompromisedMessage: "This password has been found in data breaches. Please choose a different password.",
    }),
    
    // Multi-session management for device tracking
    multiSession({
      maximumSessions: 10, // Allow up to 10 concurrent sessions
    }),
    
    twoFactor({
      issuer: process.env.NEXT_PUBLIC_APP_NAME || DEFAULT_SITE_NAME,
      
      // TOTP Settings - Fixed to use SHA256 and stronger codes
      totp: {
        period: 30,
        digits: 8, // Changed from 6 to 8 (stronger codes)
        algorithm: "SHA256", // Changed from SHA1 to SHA256 (secure)
      },
      
      // Backup codes settings - Stronger codes  
      backupCodes: {
        amount: 12, // Changed from 10 to 12
        length: 12, // Changed from 8 to 12 (NIST recommendation)
      },
      
      // Email OTP as fallback method
      sendVerificationOTP: async ({ 
        email, 
        otp, 
        type: _ 
      }: { 
        email: string; 
        otp: string; 
        type: string; 
      }) => {
        const userName = email.split("@")[0];
        await sendTwoFactorOtpEmail(email, userName, otp);
      },
      
      // Trusted device settings - Shorter expiration
      trustedDeviceEnabled: true,
      trustedDeviceExpires: 60 * 60 * 24 * 7, // Changed from 30 days to 7 days
    }),
    organization({
      allowUserToCreateOrganization: false, // Only admins can create organizations
      organizationLimit: 1, // Users can only be in one organization
      sendInvitationEmail: async (data) => {
        const { email, organization, inviter, role, id } = data;
        
        const { subject, html } = emailTemplates.organizationInvitation({
          organizationName: organization.name,
          inviterName: inviter.user.name || inviter.user.email.split("@")[0],
          inviteLink: `${process.env.NEXT_PUBLIC_APP_URL}/org/accept-invitation?id=${id}`,
          role: role,
        });

        try {
          await sendEmail({
            to: email,
            subject,
            html,
          });
        } catch (error) {
          console.error("[Better Auth] Failed to send invitation email:", error);
        }
      },
    }),
  ],
});

