import { Hono } from "hono";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import { revalidateTag } from "next/cache";
import prisma from "@/lib/prisma";
import { ok } from "@/lib/api/response";
import { SITE_SETTINGS_CACHE_TAG, PUBLIC_LAYOUT_CACHE_TAG } from "@/features/settings/server/constants";

const adminSiteSettingsRouter = new Hono()
  .get("/", async (c) => {
    const settings = await prisma.siteSetting.findMany({
      orderBy: { key: "asc" },
    });

    return ok(c, settings);
  })

  .put(
    "/",
    zValidator(
      "json",
      z.object({
        key: z.string().min(1, "Key is required"),
        value: z.string(),
      })
    ),
    async (c) => {
      try {
        const { key, value } = c.req.valid("json");

        const setting = await prisma.siteSetting.upsert({
          where: { key },
          update: { value },
          create: { key, value },
        });

        revalidateTag(SITE_SETTINGS_CACHE_TAG, "max");
        revalidateTag(PUBLIC_LAYOUT_CACHE_TAG, "max");

        return ok(c, setting);
      } catch (error) {
        const prismaError = error as { code?: string };
        if (prismaError?.code === "P2002") {
          return c.json(
            { success: false, error: { code: "CONFLICT", message: "Site setting already exists." } },
            409
          );
        }
        throw error;
      }
    }
  );

export default adminSiteSettingsRouter;
