"use server";

import { sendEmail as sendEmailViaResend } from "@/lib/email/resend";
import { emailTemplates } from "@/features/mail/components/templates";

export interface SendEmailParams {
  to: string;
  subject: string;
  html?: string;
  text?: string;
}

/**
 * Server action to send emails using Nodemailer.
 * This should be called from client components when email sending is needed.
 */
export async function sendEmail(params: SendEmailParams) {
  try {
    const result = await sendEmailViaResend({
      to: params.to,
      subject: params.subject,
      text: params.text,
      html: params.html,
    });
    // Resend responses and Nodemailer responses have different identifier fields.
    const messageId =
      (result as { messageId?: string }).messageId ??
      (result as { id?: string }).id;
    return { success: true, messageId };
  } catch (error) {
    console.error("[Server Action] Failed to send email:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to send email",
    };
  }
}

/**
 * Server action to send a welcome email with the given parameters.
 */
export async function sendWelcomeEmail(name: string, email: string) {
  try {
    const { subject, html } = emailTemplates.welcome({
      name,
      email,
    });

    const result = await sendEmailViaResend({
      to: email,
      subject: `[Action Required] ${subject}`,
      html,
    });

    console.log("[Server Action] Welcome email sent to:", email);
    const messageId =
      (result as { messageId?: string }).messageId ??
      (result as { id?: string }).id;
    return { success: true, messageId };
  } catch (error) {
    console.error("[Server Action] Failed to send welcome email:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to send welcome email",
    };
  }
}
