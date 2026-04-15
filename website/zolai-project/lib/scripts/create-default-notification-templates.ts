import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";
import { DEFAULT_SITE_NAME, DEFAULT_TEAM_NAME } from "../constants/site";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is required to run notification template seeding");
}

const pool = new Pool({ connectionString: databaseUrl });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

interface NotificationTemplate {
  name: string;
  slug: string;
  subject: string;
  body: string;
  type: string;
  variables?: Record<string, string>;
  isActive: boolean;
}

const defaultTemplates: NotificationTemplate[] = [
  {
    name: "Welcome Email",
    slug: "welcome-email",
    subject: `Welcome to ${DEFAULT_SITE_NAME}!`,
    body: `Hi {{userName}},

Welcome to ${DEFAULT_SITE_NAME}! We're excited to have you join the mission to preserve and teach the Tedim Zolai language.

Your account has been successfully created and you can now:
- Practice Zolai with the AI language tutor (A1–C2)
- Browse the full Bible parallel corpus
- Explore the linguistics wiki
- Track AI training runs and dataset progress

If you have any questions, feel free to reach out.

Best regards,
${DEFAULT_TEAM_NAME}`,
    type: "system",
    variables: {
      userName: "John Doe"
    },
    isActive: true,
  },
  {
    name: "Password Reset",
    slug: "password-reset",
    subject: "Password Reset Request",
    body: `Hi {{userName}},

We received a request to reset your password for your Zolai AI account.

If you made this request, click the link below to reset your password:
{{resetLink}}

This link will expire in 1 hour for security reasons.

If you didn't request this password reset, please ignore this email. Your password will remain unchanged.

Best regards,
${DEFAULT_TEAM_NAME}`,
    type: "security",
    variables: {
      userName: "John Doe",
      resetLink: "https://example.com/reset-password?token=abc123"
    },
    isActive: true,
  },
  {
    name: "New Comment",
    slug: "new-comment",
    subject: "New Comment on Your Post",
    body: `Hi {{authorName}},

Someone commented on your post "{{postTitle}}":

{{commentContent}}

View the full discussion: {{postLink}}

Best regards,
${DEFAULT_TEAM_NAME}`,
    type: "content",
    variables: {
      authorName: "John Doe",
      postTitle: "Sample Post Title",
      commentContent: "This is a sample comment...",
      postLink: "https://example.com/posts/sample-post"
    },
    isActive: true,
  },
  {
    name: "Post Published",
    slug: "post-published",
    subject: "Your Post Has Been Published",
    body: `Hi {{authorName}},

Great news! Your post "{{postTitle}}" has been published and is now live on ${DEFAULT_SITE_NAME}.

View your published post: {{postLink}}

Thank you for contributing!

Best regards,
${DEFAULT_TEAM_NAME}`,
    type: "content",
    variables: {
      authorName: "John Doe",
      postTitle: "Sample Post Title",
      postLink: "https://example.com/posts/sample-post"
    },
    isActive: true,
  },
  {
    name: "Account Suspended",
    slug: "account-suspended",
    subject: "Account Suspension Notice",
    body: `Hi {{userName}},

Your account on ${DEFAULT_SITE_NAME} has been temporarily suspended due to {{reason}}.

Suspension details:
- Reason: {{reason}}
- Duration: {{duration}}
- Suspended by: {{adminName}}

If you believe this suspension was made in error, please contact us with reference ID: {{referenceId}}

Best regards,
${DEFAULT_TEAM_NAME}`,
    type: "security",
    variables: {
      userName: "John Doe",
      reason: "Violation of community guidelines",
      duration: "7 days",
      adminName: "Admin User",
      referenceId: "SUSP-12345"
    },
    isActive: true,
  },
  {
    name: "Newsletter Subscription",
    slug: "newsletter-subscription",
    subject: "Confirm Your Newsletter Subscription",
    body: `Hi {{subscriberName}},

Thank you for subscribing to the ${DEFAULT_SITE_NAME} newsletter!

Please confirm your email address by clicking the link below:
{{confirmationLink}}

You'll receive our latest news, articles, and updates directly in your inbox.

If you didn't subscribe to our newsletter, please ignore this email.

Best regards,
${DEFAULT_TEAM_NAME}`,
    type: "marketing",
    variables: {
      subscriberName: "John Doe",
      confirmationLink: "https://example.com/newsletter/confirm?token=abc123"
    },
    isActive: true,
  },
  {
    name: "Content Approval",
    slug: "content-approval",
    subject: "Content Approved for Publication",
    body: `Hi {{authorName}},

Your submitted content "{{contentTitle}}" has been reviewed and approved for publication.

Your content is now live and visible to all users.

View your published content: {{contentLink}}

Thank you for your contribution!

Best regards,
${DEFAULT_TEAM_NAME}`,
    type: "content",
    variables: {
      authorName: "John Doe",
      contentTitle: "Sample Content Title",
      contentLink: "https://example.com/content/sample-content"
    },
    isActive: true,
  },
  {
    name: "Content Rejection",
    slug: "content-rejection",
    subject: "Content Submission Update",
    body: `Hi {{authorName}},

Thank you for submitting "{{contentTitle}}" to ${DEFAULT_SITE_NAME}.

After review, we regret to inform you that your content does not meet our current publishing guidelines for the following reason(s):

{{rejectionReason}}

You can:
1. Edit and resubmit your content
2. Contact our editorial team for guidance
3. Check our content guidelines: {{guidelinesLink}}

We appreciate your interest in contributing to our platform.

Best regards,
${DEFAULT_TEAM_NAME}`,
    type: "content",
    variables: {
      authorName: "John Doe",
      contentTitle: "Sample Content Title",
      rejectionReason: "Content does not meet quality standards",
      guidelinesLink: "https://example.com/guidelines"
    },
    isActive: true,
  },
];

export async function createDefaultTemplates() {
  console.log("Creating default notification templates...");
  try {
    for (const template of defaultTemplates) {
      try {
        // Check if template already exists
        const existing = await prisma.notificationTemplate.findUnique({
          where: { slug: template.slug },
        });

        if (existing) {
          // Update existing template
          const updated = await prisma.notificationTemplate.update({
            where: { slug: template.slug },
            data: {
              name: template.name,
              subject: template.subject,
              body: template.body,
              type: template.type,
              variables: template.variables,
              isActive: template.isActive,
            },
          });
          console.log(`Updated template: ${updated.name} (${updated.slug})`);
        } else {
          // Create new template
          const created = await prisma.notificationTemplate.create({
            data: template,
          });
          console.log(`Created template: ${created.name} (${created.slug})`);
        }
      } catch (error) {
        console.error(`Failed to handle template "${template.name}":`, error);
      }
    }
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }

  console.log("Default notification templates creation completed!");
}
