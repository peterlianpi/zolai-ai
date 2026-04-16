import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { ok } from "@/lib/api/response";
import { sendEmail } from "@/lib/email/resend";
import { fromAddressFor } from "@/lib/email/addresses";

const submitSchema = z.object({
  name:     z.string().min(1).max(100),
  email:    z.string().email(),
  subject:  z.string().min(1).max(200),
  category: z.enum(["general", "bug", "feature", "language", "account", "other"]),
  message:  z.string().min(10).max(5000),
});

const app = new Hono()

  .post("/", zValidator("json", submitSchema), async (c) => {
    const { name, email, subject, category, message } = c.req.valid("json");

    const to = category === "bug" || category === "account"
      ? "support@zolai.space"
      : "hello@zolai.space";

    await sendEmail({
      to,
      from: fromAddressFor(to),
      replyTo: email,
      subject: `[${category.toUpperCase()}] ${subject}`,
      html: `
        <p><strong>From:</strong> ${name} &lt;${email}&gt;</p>
        <p><strong>Category:</strong> ${category}</p>
        <hr/>
        <p>${message.replace(/\n/g, "<br/>")}</p>
      `,
      text: `From: ${name} <${email}>\nCategory: ${category}\n\n${message}`,
    });

    return ok(c, { sent: true });
  });

export default app;
