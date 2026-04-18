import { Hono } from "hono";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import prisma from "@/lib/prisma";
import { getSessionUserId } from "@/lib/auth/server-guards";
import { ok, unauthorized, error } from "@/lib/api/response";

const updateProfileSchema = z.object({
  name: z.string().min(1, "Name is required").max(255).optional(),
  email: z.string().email("Invalid email").optional(),
});

const profile = new Hono()
  // GET /api/profile - Get user profile
  .get("/", async (c) => {
    const userId = await getSessionUserId(c);
    if (!userId) {
      return unauthorized(c, "Not authenticated");
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        emailVerified: true,
        image: true,
        role: true,
        createdAt: true,
      },
    });

    if (!user) {
      return error(c, "User not found", "USER_NOT_FOUND", 404);
    }

    return ok(c, user);
  })
  // PATCH /api/profile - Update user profile
  .patch(
    "/",
    zValidator("json", updateProfileSchema),
    async (c) => {
      const userId = await getSessionUserId(c);
      if (!userId) {
        return unauthorized(c, "Not authenticated");
      }

      const data = c.req.valid("json");

      // Check if email is already taken (if changing email)
      if (data.email) {
        const existingUser = await prisma.user.findFirst({
          where: {
            email: data.email,
            id: { not: userId },
          },
        });

        if (existingUser) {
          return error(c, "Email is already in use", "EMAIL_TAKEN", 409);
        }
      }

      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data,
        select: {
          id: true,
          name: true,
          email: true,
          emailVerified: true,
          image: true,
          role: true,
          createdAt: true,
        },
      });

      return ok(c, updatedUser);
    }
  );

export default profile;
