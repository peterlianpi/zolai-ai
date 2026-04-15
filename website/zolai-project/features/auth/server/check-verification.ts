import { Hono } from "hono";
import prisma from "@/lib/prisma";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { ok } from "@/lib/api/response";

const app = new Hono().post(
  "/",
  zValidator(
    "json",
    z.object({
      email: z.string().email(),
    })
  ),
  async (c) => {
    const { email } = c.req.valid("json");

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      select: { emailVerified: true },
    });

    if (!user) {
      return ok(c, { exists: false, unverified: false });
    }

    return ok(c, { exists: true, unverified: !user.emailVerified });
  }
);

export default app;
