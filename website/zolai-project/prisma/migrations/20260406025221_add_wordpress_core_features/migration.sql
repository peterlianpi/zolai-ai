-- CreateEnum
CREATE TYPE "CommentStatus" AS ENUM ('APPROVED', 'PENDING', 'SPAM', 'TRASH');

-- CreateEnum
CREATE TYPE "SecurityEventType" AS ENUM ('BRUTE_FORCE', 'IP_BLOCKED', 'SUSPICIOUS_LOGIN', 'RATE_LIMIT_EXCEEDED', 'INVALID_TOKEN', 'SQL_INJECTION_ATTEMPT', 'XSS_ATTEMPT', 'FILE_UPLOAD_BLOCKED', 'PASSWORD_CHANGE', 'EMAIL_CHANGE', 'ROLE_CHANGE');

-- CreateEnum
CREATE TYPE "SecuritySeverity" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateEnum
CREATE TYPE "BackupType" AS ENUM ('FULL', 'DATABASE', 'MEDIA', 'CONFIG');

-- CreateEnum
CREATE TYPE "BackupStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'FAILED', 'DELETED');

-- CreateEnum
CREATE TYPE "SubscriberStatus" AS ENUM ('PENDING', 'CONFIRMED', 'UNSUBSCRIBED', 'BOUNCED');

-- CreateEnum
CREATE TYPE "CampaignStatus" AS ENUM ('DRAFT', 'SCHEDULED', 'SENDING', 'SENT', 'FAILED', 'CANCELLED');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "AuditAction" ADD VALUE 'LOGIN';
ALTER TYPE "AuditAction" ADD VALUE 'LOGOUT';
ALTER TYPE "AuditAction" ADD VALUE 'PUBLISH';
ALTER TYPE "AuditAction" ADD VALUE 'UNPUBLISH';
ALTER TYPE "AuditAction" ADD VALUE 'RESTORE';
ALTER TYPE "AuditAction" ADD VALUE 'EXPORT';
ALTER TYPE "AuditAction" ADD VALUE 'IMPORT';

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "PostStatus" ADD VALUE 'PRIVATE';
ALTER TYPE "PostStatus" ADD VALUE 'FUTURE';

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "UserRole" ADD VALUE 'EDITOR';
ALTER TYPE "UserRole" ADD VALUE 'AUTHOR';
ALTER TYPE "UserRole" ADD VALUE 'CONTRIBUTOR';
ALTER TYPE "UserRole" ADD VALUE 'SUPER_ADMIN';

-- AlterTable
ALTER TABLE "media" ADD COLUMN     "blurHash" TEXT,
ADD COLUMN     "caption" TEXT,
ADD COLUMN     "description" TEXT,
ADD COLUMN     "thumbnailUrl" TEXT;

-- AlterTable
ALTER TABLE "post" ADD COLUMN     "allowComments" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "allowPings" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "contentRaw" TEXT,
ADD COLUMN     "isSticky" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "password" TEXT,
ADD COLUMN     "pingStatus" TEXT NOT NULL DEFAULT 'open',
ADD COLUMN     "readingTime" INTEGER,
ADD COLUMN     "wordCount" INTEGER;

-- AlterTable
ALTER TABLE "redirect" ADD COLUMN     "hitCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "lastHitAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "term" ADD COLUMN     "count" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "comment" (
    "id" TEXT NOT NULL,
    "wpId" INTEGER,
    "postId" TEXT NOT NULL,
    "parentId" TEXT,
    "authorId" TEXT,
    "authorName" TEXT NOT NULL,
    "authorEmail" TEXT,
    "authorUrl" TEXT,
    "authorIp" TEXT,
    "content" TEXT NOT NULL,
    "status" "CommentStatus" NOT NULL DEFAULT 'PENDING',
    "spamScore" DOUBLE PRECISION,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "moderatedAt" TIMESTAMP(3),
    "moderatedById" TEXT,
    "akismetMeta" JSONB,

    CONSTRAINT "comment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "revision" (
    "id" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "contentHtml" TEXT NOT NULL,
    "contentRaw" TEXT,
    "excerpt" TEXT,
    "slug" TEXT,
    "status" "PostStatus" NOT NULL DEFAULT 'DRAFT',
    "isAutoDraft" BOOLEAN NOT NULL DEFAULT false,
    "authorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "revision_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "menu" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "location" TEXT,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "menu_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "menu_item" (
    "id" TEXT NOT NULL,
    "menuId" TEXT NOT NULL,
    "parentId" TEXT,
    "label" TEXT NOT NULL,
    "url" TEXT,
    "postId" TEXT,
    "target" TEXT,
    "classes" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "menu_item_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "form" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "fields" JSONB NOT NULL,
    "settings" JSONB,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "honeypot" BOOLEAN NOT NULL DEFAULT true,
    "notifyEmail" TEXT,
    "autoReply" BOOLEAN NOT NULL DEFAULT false,
    "autoReplySubject" TEXT,
    "autoReplyBody" TEXT,
    "successMessage" TEXT,
    "submitCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "form_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "form_submission" (
    "id" TEXT NOT NULL,
    "formId" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "ip" TEXT,
    "userAgent" TEXT,
    "isSpam" BOOLEAN NOT NULL DEFAULT false,
    "spamReason" TEXT,
    "submittedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "form_submission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "seo_setting" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "seo_setting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notification_template" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "variables" JSONB,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "type" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "notification_template_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "blocked_ip" (
    "id" TEXT NOT NULL,
    "ip" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "blockedById" TEXT,
    "expiresAt" TIMESTAMP(3),
    "hitCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "blocked_ip_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "security_event" (
    "id" TEXT NOT NULL,
    "type" "SecurityEventType" NOT NULL,
    "ip" TEXT,
    "userAgent" TEXT,
    "userId" TEXT,
    "email" TEXT,
    "details" JSONB,
    "severity" "SecuritySeverity" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "security_event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "backup" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "BackupType" NOT NULL,
    "status" "BackupStatus" NOT NULL DEFAULT 'PENDING',
    "filePath" TEXT,
    "fileSize" INTEGER,
    "checksum" TEXT,
    "error" TEXT,
    "createdById" TEXT,
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "backup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subscriber" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "status" "SubscriberStatus" NOT NULL DEFAULT 'PENDING',
    "token" TEXT NOT NULL,
    "subscribedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "confirmedAt" TIMESTAMP(3),
    "unsubscribedAt" TIMESTAMP(3),
    "source" TEXT,
    "moderatedById" TEXT,

    CONSTRAINT "subscriber_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "newsletter_campaign" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "status" "CampaignStatus" NOT NULL DEFAULT 'DRAFT',
    "sentCount" INTEGER NOT NULL DEFAULT 0,
    "openCount" INTEGER NOT NULL DEFAULT 0,
    "clickCount" INTEGER NOT NULL DEFAULT 0,
    "scheduledAt" TIMESTAMP(3),
    "sentAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "newsletter_campaign_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cookie_consent" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "preferences" JSONB NOT NULL,
    "ip" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cookie_consent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "comment_wpId_key" ON "comment"("wpId");

-- CreateIndex
CREATE INDEX "comment_postId_status_idx" ON "comment"("postId", "status");

-- CreateIndex
CREATE INDEX "comment_authorEmail_idx" ON "comment"("authorEmail");

-- CreateIndex
CREATE INDEX "comment_authorIp_idx" ON "comment"("authorIp");

-- CreateIndex
CREATE INDEX "comment_status_createdAt_idx" ON "comment"("status", "createdAt");

-- CreateIndex
CREATE INDEX "comment_spamScore_idx" ON "comment"("spamScore");

-- CreateIndex
CREATE INDEX "revision_postId_createdAt_idx" ON "revision"("postId", "createdAt");

-- CreateIndex
CREATE INDEX "revision_postId_isAutoDraft_idx" ON "revision"("postId", "isAutoDraft");

-- CreateIndex
CREATE INDEX "revision_authorId_idx" ON "revision"("authorId");

-- CreateIndex
CREATE UNIQUE INDEX "menu_slug_key" ON "menu"("slug");

-- CreateIndex
CREATE INDEX "menu_location_idx" ON "menu"("location");

-- CreateIndex
CREATE INDEX "menu_item_menuId_order_idx" ON "menu_item"("menuId", "order");

-- CreateIndex
CREATE INDEX "menu_item_parentId_idx" ON "menu_item"("parentId");

-- CreateIndex
CREATE UNIQUE INDEX "form_slug_key" ON "form"("slug");

-- CreateIndex
CREATE INDEX "form_isActive_idx" ON "form"("isActive");

-- CreateIndex
CREATE INDEX "form_submission_formId_createdAt_idx" ON "form_submission"("formId", "createdAt");

-- CreateIndex
CREATE INDEX "form_submission_isSpam_idx" ON "form_submission"("isSpam");

-- CreateIndex
CREATE INDEX "form_submission_ip_idx" ON "form_submission"("ip");

-- CreateIndex
CREATE UNIQUE INDEX "seo_setting_key_key" ON "seo_setting"("key");

-- CreateIndex
CREATE UNIQUE INDEX "notification_template_slug_key" ON "notification_template"("slug");

-- CreateIndex
CREATE INDEX "notification_template_type_idx" ON "notification_template"("type");

-- CreateIndex
CREATE INDEX "notification_template_isActive_idx" ON "notification_template"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "blocked_ip_ip_key" ON "blocked_ip"("ip");

-- CreateIndex
CREATE INDEX "blocked_ip_ip_idx" ON "blocked_ip"("ip");

-- CreateIndex
CREATE INDEX "blocked_ip_expiresAt_idx" ON "blocked_ip"("expiresAt");

-- CreateIndex
CREATE INDEX "blocked_ip_blockedById_idx" ON "blocked_ip"("blockedById");

-- CreateIndex
CREATE INDEX "security_event_type_createdAt_idx" ON "security_event"("type", "createdAt");

-- CreateIndex
CREATE INDEX "security_event_ip_idx" ON "security_event"("ip");

-- CreateIndex
CREATE INDEX "security_event_severity_idx" ON "security_event"("severity");

-- CreateIndex
CREATE INDEX "security_event_userId_idx" ON "security_event"("userId");

-- CreateIndex
CREATE INDEX "backup_status_idx" ON "backup"("status");

-- CreateIndex
CREATE INDEX "backup_type_idx" ON "backup"("type");

-- CreateIndex
CREATE INDEX "backup_createdAt_idx" ON "backup"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "subscriber_email_key" ON "subscriber"("email");

-- CreateIndex
CREATE UNIQUE INDEX "subscriber_token_key" ON "subscriber"("token");

-- CreateIndex
CREATE INDEX "subscriber_status_idx" ON "subscriber"("status");

-- CreateIndex
CREATE INDEX "subscriber_email_idx" ON "subscriber"("email");

-- CreateIndex
CREATE INDEX "newsletter_campaign_status_idx" ON "newsletter_campaign"("status");

-- CreateIndex
CREATE INDEX "newsletter_campaign_scheduledAt_idx" ON "newsletter_campaign"("scheduledAt");

-- CreateIndex
CREATE UNIQUE INDEX "cookie_consent_sessionId_key" ON "cookie_consent"("sessionId");

-- CreateIndex
CREATE INDEX "cookie_consent_sessionId_idx" ON "cookie_consent"("sessionId");

-- CreateIndex
CREATE INDEX "cookie_consent_createdAt_idx" ON "cookie_consent"("createdAt");

-- CreateIndex
CREATE INDEX "media_createdAt_idx" ON "media"("createdAt");

-- CreateIndex
CREATE INDEX "post_isSticky_idx" ON "post"("isSticky");

-- CreateIndex
CREATE INDEX "post_status_publishedAt_idx" ON "post"("status", "publishedAt");

-- CreateIndex
CREATE INDEX "redirect_hitCount_idx" ON "redirect"("hitCount");

-- AddForeignKey
ALTER TABLE "comment" ADD CONSTRAINT "comment_postId_fkey" FOREIGN KEY ("postId") REFERENCES "post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comment" ADD CONSTRAINT "comment_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "comment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comment" ADD CONSTRAINT "comment_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comment" ADD CONSTRAINT "comment_moderatedById_fkey" FOREIGN KEY ("moderatedById") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "revision" ADD CONSTRAINT "revision_postId_fkey" FOREIGN KEY ("postId") REFERENCES "post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "revision" ADD CONSTRAINT "revision_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "menu_item" ADD CONSTRAINT "menu_item_menuId_fkey" FOREIGN KEY ("menuId") REFERENCES "menu"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "menu_item" ADD CONSTRAINT "menu_item_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "menu_item"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "form_submission" ADD CONSTRAINT "form_submission_formId_fkey" FOREIGN KEY ("formId") REFERENCES "form"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "form_submission" ADD CONSTRAINT "form_submission_submittedById_fkey" FOREIGN KEY ("submittedById") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blocked_ip" ADD CONSTRAINT "blocked_ip_blockedById_fkey" FOREIGN KEY ("blockedById") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "backup" ADD CONSTRAINT "backup_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscriber" ADD CONSTRAINT "subscriber_moderatedById_fkey" FOREIGN KEY ("moderatedById") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;
