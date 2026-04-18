import { Hono } from "hono";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import prisma from "@/lib/prisma";
import { getSessionUserId } from "@/lib/auth/server-guards";
import { ok, unauthorized } from "@/lib/api/response";
import { revalidateTag } from "next/cache";

const updatePreferencesSchema = z.object({
  theme: z.string().optional(),
  language: z.string().optional(),
  timezone: z.string().optional(),
  emailNotifications: z.boolean().optional(),
  inAppNotifications: z.boolean().optional(),
  tablePagination: z.enum(["infinite", "normal"]).optional(),
  telegramChatId: z.string().optional(),
  telegramEnabled: z.boolean().optional(),
  aiProvider: z.enum(["groq", "gemini", "openai", "anthropic", "openrouter", "nvidia"]).optional(),
  aiModel: z.string().optional(),
});

const preferences = new Hono()

  // GET /api/preferences - Get user preferences
  .get("/", async (c) => {
    const userId = await getSessionUserId(c);
    if (!userId) {
      return unauthorized(c, "Authentication required");
    }

    const userPrefs = await prisma.userPreferences.findUnique({
      where: { userId },
    });

    return ok(c, userPrefs || {
      theme: "system",
      language: "en",
      timezone: "UTC",
      emailNotifications: true,
      inAppNotifications: true,
      tablePagination: "infinite",
      telegramChatId: null,
      telegramEnabled: false,
    });
  })

  // PUT /api/preferences - Update user preferences
  .put("/", zValidator("json", updatePreferencesSchema), async (c) => {
    const userId = await getSessionUserId(c);
    if (!userId) {
      return unauthorized(c, "Not authenticated");
    }

    const data = c.req.valid("json");

    const preferences = await prisma.userPreferences.upsert({
      where: { userId },
      update: data,
      create: { userId, ...data },
    });

    // Invalidate the layout cache so next page load picks up new prefs
    revalidateTag(`user-prefs-${userId}`, "max");

    return ok(c, preferences);
  });

export default preferences;