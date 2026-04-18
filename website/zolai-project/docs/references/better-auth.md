# Better Auth Reference

**Version:** 1.5.6 | **Docs:** https://www.better-auth.com

## Configuration

```ts
// lib/auth.ts
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { admin } from "better-auth/plugins";
import { emailOTP } from "better-auth/plugins";
import prisma from "./prisma";

export const auth = betterAuth({
  database: prismaAdapter(prisma, { provider: "postgresql" }),
  trustedOrigins: process.env.NODE_ENV === "development"
    ? [process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"]
    : [process.env.NEXT_PUBLIC_APP_URL || ""].filter(Boolean),
  rateLimit: {
    enabled: process.env.NODE_ENV === "production",
    window: 60,
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
    sendResetPassword: async ({ user, url }) => {
      // Send reset email
    },
  },
  emailVerification: {
    autoSignInAfterVerification: true,
    sendOnSignUp: false,
    sendVerificationEmail: async ({ user, url }) => {
      // Send verification email
    },
  },
  plugins: [
    admin({
      ac,
      roles: { admin: adminRole, user: userRole },
      defaultRole: "USER",
      adminRoles: ["ADMIN"],
      impersonationSessionDuration: 60 * 60 * 24,
    }),
    emailOTP({
      async sendVerificationOTP({ email, otp }) {
        // Send OTP email
      },
    }),
  ],
});
```

## Session Configuration

```ts
export const auth = betterAuth({
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day (refresh window)
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60, // 5 minutes
    },
  },
  advanced: {
    cookies: {
      session_token: {
        name: "better-auth.session_token",
        attributes: {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          path: "/",
        },
      },
    },
  },
});
```

## Server-Side Usage

```ts
// lib/auth/hono-helpers.ts
import { auth } from "@/lib/auth";

export async function getSessionUserId(c: Context): Promise<string> {
  const session = await auth.api.getSession({ headers: c.req.raw.headers });
  if (!session) throw new Error("Unauthorized");
  return session.user.id;
}

export async function checkIsAdmin(c: Context): Promise<boolean> {
  const session = await auth.api.getSession({ headers: c.req.raw.headers });
  return session?.user?.role === "ADMIN";
}
```

## Client-Side Usage

```ts
// lib/auth-client.ts
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL,
});

export const { signIn, signUp, signOut, useSession } = authClient;
```

## Usage in Components

```tsx
"use client";
import { useSession } from "@/lib/auth-client";

export function UserProfile() {
  const { data: session, isPending } = useSession();

  if (isPending) return <div>Loading...</div>;
  if (!session) return <div>Not logged in</div>;

  return <div>Welcome, {session.user.name}</div>;
}
```

## Admin Plugin

```ts
import { admin, createAccessControl } from "better-auth/plugins";

const ac = createAccessControl({
  admin: {
    "user": ["create", "read", "update", "delete"],
    "post": ["create", "read", "update", "delete"],
  },
  user: {
    "user": ["read"],
    "post": ["create", "read"],
  },
});

export const auth = betterAuth({
  plugins: [
    admin({
      ac,
      roles: {
        admin: { user: ["create", "read", "update", "delete"] },
        user: { user: ["read"] },
      },
      defaultRole: "USER",
      adminRoles: ["ADMIN"],
    }),
  ],
});
```

## Email OTP Plugin

```ts
import { emailOTP } from "better-auth/plugins";

export const auth = betterAuth({
  plugins: [
    emailOTP({
      async sendVerificationOTP({ email, otp, type }) {
        // type: "sign-in" | "email-verification" | "forget-password"
        await sendEmail({
          to: email,
          subject: `Your verification code: ${otp}`,
          html: `<p>Your code is: <strong>${otp}</strong></p>`,
        });
      },
      expiresIn: 60 * 5, // 5 minutes
      otpLength: 6,
    }),
  ],
});
```

## API Routes

```ts
// app/api/auth/[...all]/route.ts
import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";

export const { GET, POST } = toNextJsHandler(auth);
```

## Session Retrieval

```ts
// Server component
import { auth } from "@/lib/auth";

export default async function Page() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return redirect("/login");
  return <div>Welcome {session.user.name}</div>;
}
```

## Security Best Practices

1. **httpOnly cookies** — sessions stored in cookies, not localStorage
2. **Rate limiting** — especially on login and password reset
3. **Email verification** — required in production
4. **Trusted origins** — configure for CSRF protection
5. **Secure cookies** — `secure: true` in production
6. **SameSite cookies** — `lax` or `strict`
7. **Session expiration** — reasonable timeout (7 days recommended)
8. **Password requirements** — enforce strong passwords
9. **Audit logging** — log auth events
10. **Don't expose session data** — only return what's needed
