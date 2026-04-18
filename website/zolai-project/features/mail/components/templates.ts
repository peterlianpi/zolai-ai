import { DEFAULT_SITE_NAME, DEFAULT_SITE_SHORT_NAME, DEFAULT_SITE_URL } from "@/lib/constants/site";

const BRAND = {
  name: DEFAULT_SITE_NAME,
  shortName: DEFAULT_SITE_SHORT_NAME,
  primaryColor: "#4CA8C6",
  primaryDark: "#3A8BA8",
  darkColor: "#000000",
  lightBg: "#F7F9FB",
  white: "#FFFFFF",
  mutedText: "#64748B",
  border: "#D9E4EC",
  warningBg: "#FEF3C7",
  warningBorder: "#F59E0B",
  warningText: "#92400E",
  url: DEFAULT_SITE_URL,
};

interface EmailTemplateData {
  name: string;
  email: string;
  resetToken?: string;
  resetLink?: string;
  verificationLink?: string;
  actionUrl?: string;
  actionText?: string;
}

interface OrganizationInvitationData {
  organizationName: string;
  inviterName: string;
  inviteLink: string;
  role: string;
}

const createEmailTemplate = (
  headerTitle: string,
  headerEmoji: string,
  content: string,
  subject: string,
  footerText?: string,
) => {
  const baseStyles = `
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: ${BRAND.lightBg}; }
    .container { max-width: 600px; margin: 20px auto; background: ${BRAND.white}; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
    .header { background: linear-gradient(135deg, ${BRAND.primaryColor} 0%, ${BRAND.primaryDark} 100%); color: ${BRAND.white}; padding: 40px 30px; text-align: center; }
    .header h1 { margin: 0; font-size: 28px; font-weight: 700; }
    .header p { margin: 8px 0 0 0; font-size: 16px; opacity: 0.9; }
    .content { padding: 40px 30px; background: ${BRAND.white}; }
    .content h2 { margin: 0 0 20px 0; font-size: 24px; font-weight: 600; color: ${BRAND.darkColor}; }
    .content p { margin: 0 0 16px 0; font-size: 16px; line-height: 1.6; }
    .button { display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, ${BRAND.primaryColor} 0%, ${BRAND.primaryDark} 100%); color: ${BRAND.white}; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; margin: 24px 0; box-shadow: 0 2px 4px rgba(76, 168, 198, 0.3); }
    .secondary-button { background: #f1f5f9; color: #475569; border: 1px solid #e2e8f0; }
    .code { font-family: monospace; font-size: 20px; font-weight: bold; color: ${BRAND.primaryColor}; background: #f8fafc; padding: 16px; border-radius: 8px; text-align: center; margin: 20px 0; border: 2px dashed ${BRAND.border}; }
    .link { word-break: break-all; background: #f8fafc; padding: 16px; border-radius: 8px; margin: 20px 0; border-left: 4px solid ${BRAND.primaryColor}; font-family: monospace; font-size: 14px; }
    .divider { height: 1px; background: ${BRAND.border}; margin: 32px 0; border: none; }
    .footer { text-align: center; padding: 30px; background: #f8fafc; border-top: 1px solid ${BRAND.border}; }
    .footer p { margin: 0; color: ${BRAND.mutedText}; font-size: 14px; }
    .footer a { color: ${BRAND.primaryColor}; text-decoration: none; }
    .warning { background: ${BRAND.warningBg}; border: 1px solid ${BRAND.warningBorder}; border-radius: 8px; padding: 16px; margin: 20px 0; }
    .warning p { margin: 0; color: ${BRAND.warningText}; font-size: 14px; }
    @media (max-width: 600px) { .container { margin: 10px; } .header { padding: 30px 20px; } .content { padding: 30px 20px; } }
  `;

  return {
    subject,
    html: `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>${subject}</title><style>${baseStyles}</style></head><body><div class="container"><div class="header"><h1>${headerEmoji} ${headerTitle}</h1><p>${BRAND.name}</p></div><div class="content">${content}</div><div class="footer"><p>${footerText || `This email was sent to you because you have an account with ${BRAND.name}.`}</p><p style="margin-top:8px"><a href="${BRAND.url}">${BRAND.url}</a></p></div></div></body></html>`,
  };
};

export const emailTemplates = {
  passwordReset: ({ name, email, resetLink }: EmailTemplateData) => {
    const content = `<h2>Hello ${name || "there"},</h2><p>We received a request to reset your ${BRAND.name} account password. Click the button below to set a new password.</p><div style="text-align:center"><a href="${resetLink}" class="button">Reset Password</a></div><p>If you didn't request this, you can safely ignore this email.</p><p>Or copy and paste this link into your browser:</p><div class="link">${resetLink}</div><div class="warning"><p>This link expires in 1 hour for security reasons.</p></div>`;
    return createEmailTemplate("Reset Your Password", "🔑", content, `Reset your ${BRAND.name} password`, `This email was sent to ${email}`);
  },
  emailVerification: ({ name, email, verificationLink }: EmailTemplateData) => {
    const content = `<h2>Welcome${name ? `, ${name}` : ""}!</h2><p>Thank you for joining ${BRAND.name} — the Zomi people's AI Second Brain for preserving and teaching the Tedim Zolai language.</p><p>Please verify your email address to activate your account.</p><div style="text-align:center"><a href="${verificationLink}" class="button">Verify Email Address</a></div><p>Or copy and paste this link:</p><div class="link">${verificationLink}</div><p>Once verified, you'll have access to the language tutor, Bible corpus, linguistics wiki, and training dashboard.</p>`;
    return createEmailTemplate("Verify Your Email", "✅", content, `Verify your ${BRAND.name} account`, `This email was sent to ${email}`);
  },
  welcome: ({ name, email }: EmailTemplateData) => {
    const content = `<h2>Welcome to ${BRAND.name}, ${name}!</h2><p>We're excited to have you on board. Your account has been created successfully.</p><p>Here's what you can do:</p><ul style="margin:16px 0;padding-left:20px"><li>Practice Tedim Zolai with the AI language tutor (A1–C2)</li><li>Browse the full Bible parallel corpus</li><li>Explore the linguistics wiki</li><li>Track AI training runs and dataset progress</li></ul><p>Start at <a href="${BRAND.url}" style="color:${BRAND.primaryColor};text-decoration:none">${BRAND.url}</a></p>`;
    return createEmailTemplate(`Welcome to ${BRAND.name}!`, "👋", content, `Welcome to ${BRAND.name}!`, `This email was sent to ${email}`);
  },
  passwordChanged: ({ name, email }: EmailTemplateData) => {
    const content = `<h2>Password Changed Successfully</h2><p>Hi ${name || "there"},</p><p>This is a confirmation that your ${BRAND.name} account password was changed successfully.</p><div class="warning"><p>If you didn't make this change, please <a href="${BRAND.url}/contact" style="color:${BRAND.primaryDark};text-decoration:none">contact us</a> immediately to secure your account.</p></div>`;
    return createEmailTemplate("Password Changed", "🔒", content, `Your ${BRAND.name} password was changed`, `This email was sent to ${email}`);
  },
  organizationInvitation: ({ organizationName, inviterName, inviteLink, role }: OrganizationInvitationData) => {
    const content = `<h2>You're invited to join ${organizationName}</h2><p>${inviterName} has invited you to join the organization <strong>${organizationName}</strong> as a <strong>${role}</strong>.</p><div style="text-align:center"><a href="${inviteLink}" class="button">Accept Invitation</a></div><p>Or copy and paste this link into your browser:</p><div class="link">${inviteLink}</div><div class="warning"><p>This invitation expires in 7 days. If you don't have an account, one will be created for you when you accept.</p></div>`;
    return createEmailTemplate("Organization Invitation", "🤝", content, `Join ${organizationName} on ${BRAND.name}`, "You received this invitation to join an organization.");
  },
};

export function generateTwoFactorOtpEmail({ name, email, otp }: EmailTemplateData & { otp: string }) {
  const content = `<h2>Your Verification Code</h2><p>Hi ${name || email.split("@")[0]},</p><p>Use the code below to verify your identity:</p><div class="code" style="font-size:32px;letter-spacing:8px;">${otp}</div><div class="warning"><p>This code expires in 10 minutes. Don't share it with anyone.</p></div><p>If you didn't request this code, please ignore this email.</p>`;
  return createEmailTemplate("Your Verification Code", "🛡️", content, `Your ${BRAND.shortName} verification code: ${otp}`, `This email was sent to ${email}`);
}

export function generateNewsletterEmail({ email, title, content: newsletterContent }: { name?: string; email: string; title: string; content: string }) {
  const content = `<h2>${title}</h2><div>${newsletterContent}</div><p style="margin-top:24px">Want to read more? Visit <a href="${BRAND.url}" style="color:${BRAND.primaryColor};text-decoration:none">${BRAND.url}</a></p>`;
  return createEmailTemplate("Newsletter", "newspaper", content, title, `This email was sent to ${email}. <a href="${BRAND.url}/unsubscribe" style="color:${BRAND.primaryColor};text-decoration:none">Unsubscribe</a>`);
}
