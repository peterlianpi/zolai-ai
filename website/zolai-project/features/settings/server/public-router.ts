import type { SiteSettingWhereInput } from "@/lib/generated/prisma/models";
import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { ok } from "@/lib/api/response";
import { PUBLIC_SITE_SETTING_KEYS } from "@/features/settings/server/constants";

const siteSettingsRouter = new Hono().get(
  "/",
  zValidator(
    "query",
    z.object({
      keys: z.string().optional(),
    }),
  ),
  async (c) => {
    const { keys } = c.req.valid("query");
    const requestedKeys = keys
      ? keys
          .split(",")
          .map((key) => key.trim())
          .filter(Boolean)
      : [];

    const allowedKeys = requestedKeys.length
      ? requestedKeys.filter((key) =>
          PUBLIC_SITE_SETTING_KEYS.includes(
            key as (typeof PUBLIC_SITE_SETTING_KEYS)[number],
          ),
        )
      : [...PUBLIC_SITE_SETTING_KEYS];

    const where: SiteSettingWhereInput = {
      key: { in: allowedKeys },
    };

    const settings = await prisma.siteSetting.findMany({
      where,
      orderBy: { key: "asc" },
    });

    c.header("Cache-Control", "public, s-maxage=60, stale-while-revalidate=300");

    return ok(c, settings);
  },
);

export default siteSettingsRouter;
