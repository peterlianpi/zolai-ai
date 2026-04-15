"use server";

import { auth } from "@/lib/auth";
import { DEFAULT_SITE_URL } from "@/lib/constants/site";
import { headers as getHeaders } from "next/headers";

export async function sendVerificationEmailAction(email: string) {
  try {
    await auth.api.sendVerificationEmail({
      body: {
        email,
        callbackURL: `${DEFAULT_SITE_URL}/verify-email/success`,
      },
    });
    return { success: true };
  } catch (error) {
    if (error instanceof Error) {
      const msg = error.message;
      if (msg.toLowerCase().includes("already verified")) return { error: "This email is already verified." };
      if (msg.toLowerCase().includes("not found")) return { error: "User not found. Please sign up first." };
      return { error: msg };
    }
    return { error: "An unexpected error occurred" };
  }
}

/**
 * Check if the current user is verified
 * Accepts optional headers for use in server components/actions
 */
export async function checkVerificationStatus(headers?: Headers) {
  try {
    const activeHeaders = headers || await getHeaders();
    const session = await auth.api.getSession({ headers: activeHeaders });
    
    if (!session?.user) {
      return { isVerified: false, user: null };
    }
    
    return { 
      isVerified: !!session.user.emailVerified, 
      user: session.user 
    };
  } catch (error) {
    console.error("[Verification] Error checking status:", error);
    return { isVerified: false, user: null };
  }
}

