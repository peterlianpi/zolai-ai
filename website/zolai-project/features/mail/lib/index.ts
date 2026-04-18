import nodemailer from "nodemailer";

let transporter: nodemailer.Transporter | null = null;
let verifyPromise: Promise<void> | null = null;

function getTransporter() {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.ethereal.email",
      port: parseInt(process.env.SMTP_PORT || "587"),
      secure: process.env.SMTP_PORT === "465",
      requireTLS: process.env.SMTP_PORT !== "465",
      auth: {
        user: process.env.SMTP_USER || "your-ethereal-user@ethereal.email",
        pass: process.env.SMTP_PASS || "your-ethereal-password",
      },
      tls: {
        rejectUnauthorized: false,
      },
      debug: process.env.NODE_ENV === "development",
      logger: process.env.NODE_ENV === "development",
    });
  }

  return transporter;
}

async function verifyTransporter() {
  if (process.env.NODE_ENV !== "development" || verifyPromise) {
    return verifyPromise;
  }

  verifyPromise = getTransporter()
    .verify()
    .then(() => {
    })
    .catch((_error: Error) => {
      verifyPromise = null;
    });

  return verifyPromise;
}

export async function sendEmail({
  to,
  subject,
  text,
  html,
  from: fromOverride,
  replyTo,
}: {
  to: string;
  subject: string;
  text?: string;
  html?: string;
  from?: string;
  replyTo?: string;
}) {
  const from = fromOverride || process.env.SMTP_FROM || process.env.RESEND_FROM_EMAIL;

  if (!from) {
    const errorMsg =
      "Neither `SMTP_FROM` nor `RESEND_FROM_EMAIL` is set. Please set one of them to a valid email address.";
    throw new Error(errorMsg);
  }

  try {
    await verifyTransporter();


    const info = await getTransporter().sendMail({
      from,
      to,
      subject,
      text,
      html,
      ...(replyTo && { replyTo }),
    });


    // In development, log the preview URL if using Ethereal
    if (process.env.NODE_ENV === "development" && info.messageId) {
    }

    return info;
  } catch (_error) {
    if (error instanceof Error && "code" in error) {
    }
    throw error;
  }
}
