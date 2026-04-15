import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export async function sendEmail(options: EmailOptions): Promise<boolean> {
  if (!process.env.SMTP_HOST) {
    console.warn('[Email] SMTP not configured, skipping email');
    return false;
  }

  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM || 'noreply@example.com',
      ...options,
    });
    return true;
  } catch (error) {
    console.error('[Email] Failed to send:', error);
    return false;
  }
}

export function buildSecurityEmailHtml(
  title: string,
  message: string,
  actionUrl?: string,
  actionText?: string
): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #f5f5f5; padding: 20px; border-radius: 5px; margin-bottom: 20px; }
          .header h1 { margin: 0; color: #d32f2f; }
          .content { line-height: 1.6; margin-bottom: 20px; }
          .action { text-align: center; margin: 30px 0; }
          .button { 
            display: inline-block; 
            padding: 12px 24px; 
            background: #1976d2; 
            color: white; 
            text-decoration: none; 
            border-radius: 5px;
          }
          .footer { 
            border-top: 1px solid #ddd; 
            padding-top: 20px; 
            font-size: 12px; 
            color: #999;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔒 ${title}</h1>
          </div>
          <div class="content">
            ${message}
          </div>
          ${actionUrl && actionText ? `
            <div class="action">
              <a href="${actionUrl}" class="button">${actionText}</a>
            </div>
          ` : ''}
          <div class="footer">
            <p>If you did not request this action, please ignore this email or contact support.</p>
            <p>© ${new Date().getFullYear()} ${process.env.NEXT_PUBLIC_APP_NAME || 'Zolai'}. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;
}
