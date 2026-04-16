import { Hono } from "hono";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import type { Context } from "hono";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth/server-guards";
import { ok, list, notFound } from "@/lib/api/response";
import { sendEmail } from "@/lib/email/resend";
import { fromAddressFor } from "@/lib/email/addresses";

const inboundWebhookSchema = z.object({
  type: z.string(),
  data: z.object({
    to: z.array(z.object({ email: z.string() })),
    from: z.object({ email: z.string(), name: z.string().optional() }),
    subject: z.string().optional(),
    text: z.string().optional(),
    html: z.string().optional(),
    reply_to: z.array(z.object({ email: z.string() })).optional(),
  }),
});

type InboundData = z.infer<typeof inboundWebhookSchema>["data"];

async function saveInbound(c: Context, data: InboundData) {
  await prisma.inboundEmail.create({
    data: {
      to: data.to[0]?.email ?? "",
      from: data.from.email,
      fromName: data.from.name ?? null,
      subject: data.subject ?? "(no subject)",
      text: data.text ?? null,
      html: data.html ?? null,
      replyTo: data.reply_to?.[0]?.email ?? null,
    },
  });
  return ok(c, { received: true });
}

const replySchema = z.object({
  text: z.string().min(1),
  html: z.string().optional(),
});

const app = new Hono()

  // POST /api/inbound-email/webhook — called by Resend (Svix-signed)
  .post("/webhook", async (c) => {
    const rawBody = await c.req.text();
    const body = JSON.parse(rawBody);
    const svixSecret = process.env.RESEND_WEBHOOK_SECRET;
    const workerSecret = process.env.WEBHOOK_SECRET;

    // Verify Svix signature (from Resend direct)
    if (svixSecret && c.req.header("svix-id")) {
      const { Webhook } = await import("svix");
      try {
        new Webhook(svixSecret).verify(rawBody, {
          "svix-id":        c.req.header("svix-id") ?? "",
          "svix-timestamp": c.req.header("svix-timestamp") ?? "",
          "svix-signature": c.req.header("svix-signature") ?? "",
        });
      } catch {
        return c.json({ error: "Invalid signature" }, 401);
      }
    // Verify shared secret (from Cloudflare Worker)
    } else if (workerSecret) {
      if (c.req.header("x-webhook-secret") !== workerSecret) {
        return c.json({ error: "Unauthorized" }, 401);
      }
    }

    const parsed = inboundWebhookSchema.safeParse(body);
    if (!parsed.success || parsed.data.type !== "email.received") return ok(c, { ignored: true });
    return saveInbound(c, parsed.data.data);
  })

  // GET /api/inbound-email
  .get("/", async (c) => {
    if (!(await requireAdmin(c))) return c.json({ error: "Forbidden" }, 403);

    const inbox = c.req.query("inbox");
    const page = Number(c.req.query("page") ?? 1);
    const limit = Number(c.req.query("limit") ?? 20);
    const where: Record<string, unknown> = {};
    if (inbox) where.to = inbox;
    if (c.req.query("unread") === "true") where.isRead = false;

    const [emails, total] = await Promise.all([
      prisma.inboundEmail.findMany({ where, orderBy: { createdAt: "desc" }, skip: (page - 1) * limit, take: limit }),
      prisma.inboundEmail.count({ where }),
    ]);
    return list(c, emails, { total, page, limit, totalPages: Math.ceil(total / limit) });
  })

  // GET /api/inbound-email/:id
  .get("/:id", async (c) => {
    if (!(await requireAdmin(c))) return c.json({ error: "Forbidden" }, 403);
    const email = await prisma.inboundEmail.findUnique({ where: { id: c.req.param("id") } });
    if (!email) return notFound(c, "Email not found");
    if (!email.isRead) await prisma.inboundEmail.update({ where: { id: email.id }, data: { isRead: true } });
    return ok(c, { ...email, isRead: true });
  })

  // POST /api/inbound-email/:id/reply
  .post("/:id/reply", zValidator("json", replySchema), async (c) => {
    if (!(await requireAdmin(c))) return c.json({ error: "Forbidden" }, 403);
    const email = await prisma.inboundEmail.findUnique({ where: { id: c.req.param("id") } });
    if (!email) return notFound(c, "Email not found");

    const { text, html } = c.req.valid("json");
    await sendEmail({
      to: email.replyTo ?? email.from,
      from: fromAddressFor(email.to),
      subject: email.subject.startsWith("Re:") ? email.subject : `Re: ${email.subject}`,
      text,
      html,
    });
    await prisma.inboundEmail.update({ where: { id: email.id }, data: { isReplied: true, repliedAt: new Date() } });
    return ok(c, { replied: true });
  })

  // DELETE /api/inbound-email/:id
  .delete("/:id", async (c) => {
    if (!(await requireAdmin(c))) return c.json({ error: "Forbidden" }, 403);
    const email = await prisma.inboundEmail.findUnique({ where: { id: c.req.param("id") } });
    if (!email) return notFound(c, "Email not found");
    await prisma.inboundEmail.delete({ where: { id: email.id } });
    return ok(c, { id: email.id });
  });

export default app;
