import { Resend } from "resend";
import { sendEmail as sendEmailNodemailer } from "@/features/mail/lib";

let resendClient: Resend | null = null;

function getResendClient(): Resend | null {
  if (!process.env.RESEND_API_KEY) return null;
  if (!resendClient) {
    resendClient = new Resend(process.env.RESEND_API_KEY);
  }
  return resendClient;
}

export async function sendEmailResend({
  to,
  subject,
  text,
  html,
}: {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}) {
  const resend = getResendClient();
  if (!resend) {
    throw new Error("RESEND_API_KEY is not set");
  }

  const from = process.env.RESEND_FROM_EMAIL || process.env.SMTP_FROM || "onboarding@resend.dev";

  const { data, error } = await resend.emails.send({
    from,
    to: [to],
    subject,
    html: html || text || "",
    text: text || undefined,
  });

  if (error) {
    throw new Error(`Resend error: ${error.message}`);
  }

  return data;
}

export async function sendEmail({
  to,
  subject,
  text,
  html,
}: {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}) {
  try {
    const resend = getResendClient();
    if (resend) {
      const result = await sendEmailResend({ to, subject, text, html });
      console.log(`[Email] Sent via Resend to: ${to}`);
      return result;
    }
  } catch (error) {
    console.warn("[Email] Resend failed, falling back to nodemailer:", error);
  }

  console.log(`[Email] Sending via nodemailer to: ${to}`);
  return sendEmailNodemailer({ to, subject, text, html });
}
