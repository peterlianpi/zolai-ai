"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { invalidateAllUserSessions } from "@/lib/auth/validate";

/**
 * Update user profile (name)
 */
export async function updateProfileName(name: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return { success: false, error: "Not authenticated" };
  }

  try {
    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: { name },
    });

    revalidatePath("/settings");
    return { success: true, data: user };
  } catch (error) {
    console.error("Failed to update name:", error);
    return { success: false, error: "Failed to update name" };
  }
}

/**
 * Update user email with verification
 * Sends a verification email to the new address
 */
export async function updateProfileEmail(email: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return { success: false, error: "Not authenticated" };
  }

  try {
    // Check if email is already in use
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser && existingUser.id !== session.user.id) {
      return { success: false, error: "Email already in use" };
    }

    // Update the email and mark as unverified
    await prisma.user.update({
      where: { id: session.user.id },
      data: { email, emailVerified: false },
    });

    // Invalidate all sessions so the stale session cookie is no longer valid
    await invalidateAllUserSessions(session.user.id);

    // Send verification email
    await auth.api.sendVerificationEmail({
      body: { email },
      headers: await headers(),
    });

    revalidatePath("/settings");
    return {
      success: true,
      message:
        "Verification email sent. Please check your inbox to verify your new email.",
    };
  } catch (error) {
    console.error("Failed to update email:", error);
    return { success: false, error: "Failed to update email" };
  }
}

/**
 * Update user preferences including table pagination
 */
export async function updateUserPreferences(preferences: {
  theme?: string;
  language?: string;
  timezone?: string;
  emailNotifications?: boolean;
  inAppNotifications?: boolean;
  tablePagination?: string;
  telegramEnabled?: boolean;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return { success: false, error: "Not authenticated" };
  }

  try {
    // Build update data
    const updateData: {
      theme?: string;
      language?: string;
      timezone?: string;
      emailNotifications?: boolean;
      inAppNotifications?: boolean;
      tablePagination?: string;
      telegramEnabled?: boolean;
    } = {};

    if (preferences.theme !== undefined) updateData.theme = preferences.theme;
    if (preferences.language !== undefined) updateData.language = preferences.language;
    if (preferences.timezone !== undefined) updateData.timezone = preferences.timezone;
    if (preferences.emailNotifications !== undefined) {
      updateData.emailNotifications = preferences.emailNotifications;
    }
    if (preferences.inAppNotifications !== undefined) {
      updateData.inAppNotifications = preferences.inAppNotifications;
    }
    if (preferences.tablePagination !== undefined) {
      updateData.tablePagination = preferences.tablePagination;
    }
    if (preferences.telegramEnabled !== undefined) {
      updateData.telegramEnabled = preferences.telegramEnabled;
    }

    const updated = await prisma.userPreferences.upsert({
      where: { userId: session.user.id },
      update: updateData,
      create: {
        userId: session.user.id,
        ...updateData,
      },
    });

    revalidatePath("/settings");
    return { success: true, data: updated };
  } catch (error) {
    console.error("Failed to update preferences:", error);
    return { success: false, error: "Failed to update preferences" };
  }
}
