/*
  Warnings:

  - You are about to drop the column `cancelReason` on the `appointment` table. All the data in the column will be lost.
  - You are about to drop the column `cancelledAt` on the `appointment` table. All the data in the column will be lost.
  - You are about to drop the column `emailNotificationSent` on the `appointment` table. All the data in the column will be lost.
  - You are about to drop the column `reminderSent` on the `appointment` table. All the data in the column will be lost.
  - You are about to drop the column `reminderSentAt` on the `appointment` table. All the data in the column will be lost.
  - You are about to drop the column `appointmentId` on the `audit_log` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "PostType" AS ENUM ('POST', 'PAGE', 'NEWS');

-- CreateEnum
CREATE TYPE "PostStatus" AS ENUM ('DRAFT', 'PENDING', 'PUBLISHED', 'TRASH');

-- DropForeignKey
ALTER TABLE "appointment" DROP CONSTRAINT "appointment_userId_fkey";

-- DropForeignKey
ALTER TABLE "audit_log" DROP CONSTRAINT "audit_log_appointmentId_fkey";

-- DropIndex
DROP INDEX "appointment_emailNotificationSent_idx";

-- DropIndex
DROP INDEX "appointment_reminderSent_idx";

-- DropIndex
DROP INDEX "appointment_userId_startDateTime_idx";

-- AlterTable
ALTER TABLE "appointment" DROP COLUMN "cancelReason",
DROP COLUMN "cancelledAt",
DROP COLUMN "emailNotificationSent",
DROP COLUMN "reminderSent",
DROP COLUMN "reminderSentAt",
ADD COLUMN     "emailNotification" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "duration" DROP NOT NULL;

-- AlterTable
ALTER TABLE "audit_log" DROP COLUMN "appointmentId";

-- AlterTable
ALTER TABLE "session" ADD COLUMN     "impersonatedBy" TEXT;

-- AlterTable
ALTER TABLE "user" ADD COLUMN     "banExpires" TIMESTAMP(3),
ADD COLUMN     "banReason" TEXT,
ADD COLUMN     "banned" BOOLEAN DEFAULT false;

-- CreateTable
CREATE TABLE "post" (
    "id" TEXT NOT NULL,
    "wpId" INTEGER,
    "type" "PostType" NOT NULL,
    "status" "PostStatus" NOT NULL DEFAULT 'DRAFT',
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "excerpt" TEXT,
    "contentHtml" TEXT NOT NULL,
    "menuOrder" INTEGER NOT NULL DEFAULT 0,
    "publishedAt" TIMESTAMP(3),
    "publishedAtGmt" TIMESTAMP(3),
    "modifiedAt" TIMESTAMP(3) NOT NULL,
    "commentStatus" TEXT NOT NULL DEFAULT 'open',
    "locale" TEXT NOT NULL DEFAULT 'en',
    "translationGroup" TEXT,
    "seoTitle" TEXT,
    "seoDescription" TEXT,
    "seoKeywords" TEXT,
    "canonicalUrl" TEXT,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "isPopular" BOOLEAN NOT NULL DEFAULT false,
    "authorId" TEXT NOT NULL,
    "parentId" TEXT,
    "featuredMediaId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "post_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "post_meta" (
    "id" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,

    CONSTRAINT "post_meta_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "taxonomy" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "taxonomy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "term" (
    "id" TEXT NOT NULL,
    "wpTermId" INTEGER,
    "taxonomyId" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "parentTermId" TEXT,

    CONSTRAINT "term_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "post_term" (
    "postId" TEXT NOT NULL,
    "termId" TEXT NOT NULL,

    CONSTRAINT "post_term_pkey" PRIMARY KEY ("postId","termId")
);

-- CreateTable
CREATE TABLE "media" (
    "id" TEXT NOT NULL,
    "wpId" INTEGER,
    "url" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "filePath" TEXT,
    "altText" TEXT,
    "width" INTEGER,
    "height" INTEGER,
    "fileSize" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "media_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "redirect" (
    "id" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "destination" TEXT NOT NULL,
    "statusCode" INTEGER NOT NULL DEFAULT 301,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "redirect_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "site_setting" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "site_setting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_preferences" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "theme" TEXT NOT NULL DEFAULT 'system',
    "language" TEXT NOT NULL DEFAULT 'en',
    "timezone" TEXT NOT NULL DEFAULT 'UTC',
    "emailNotifications" BOOLEAN NOT NULL DEFAULT true,
    "inAppNotifications" BOOLEAN NOT NULL DEFAULT true,
    "defaultDuration" INTEGER NOT NULL DEFAULT 60,
    "bufferTime" INTEGER NOT NULL DEFAULT 15,
    "reminderEnabled" BOOLEAN NOT NULL DEFAULT true,
    "reminderHoursBefore" INTEGER NOT NULL DEFAULT 24,
    "emailReminders" BOOLEAN NOT NULL DEFAULT true,
    "inAppReminders" BOOLEAN NOT NULL DEFAULT true,
    "appointmentCreatedNotif" BOOLEAN NOT NULL DEFAULT true,
    "appointmentRescheduledNotif" BOOLEAN NOT NULL DEFAULT true,
    "appointmentCancelledNotif" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_preferences_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "post_type_status_publishedAt_idx" ON "post"("type", "status", "publishedAt");

-- CreateIndex
CREATE INDEX "post_slug_locale_idx" ON "post"("slug", "locale");

-- CreateIndex
CREATE INDEX "post_translationGroup_idx" ON "post"("translationGroup");

-- CreateIndex
CREATE INDEX "post_isFeatured_idx" ON "post"("isFeatured");

-- CreateIndex
CREATE INDEX "post_authorId_idx" ON "post"("authorId");

-- CreateIndex
CREATE UNIQUE INDEX "post_type_slug_locale_key" ON "post"("type", "slug", "locale");

-- CreateIndex
CREATE INDEX "post_meta_postId_key_idx" ON "post_meta"("postId", "key");

-- CreateIndex
CREATE UNIQUE INDEX "taxonomy_slug_key" ON "taxonomy"("slug");

-- CreateIndex
CREATE INDEX "term_slug_idx" ON "term"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "term_taxonomyId_slug_key" ON "term"("taxonomyId", "slug");

-- CreateIndex
CREATE INDEX "post_term_postId_idx" ON "post_term"("postId");

-- CreateIndex
CREATE INDEX "post_term_termId_idx" ON "post_term"("termId");

-- CreateIndex
CREATE INDEX "media_mimeType_idx" ON "media"("mimeType");

-- CreateIndex
CREATE UNIQUE INDEX "redirect_source_key" ON "redirect"("source");

-- CreateIndex
CREATE INDEX "redirect_source_enabled_idx" ON "redirect"("source", "enabled");

-- CreateIndex
CREATE UNIQUE INDEX "site_setting_key_key" ON "site_setting"("key");

-- CreateIndex
CREATE UNIQUE INDEX "user_preferences_userId_key" ON "user_preferences"("userId");

-- CreateIndex
CREATE INDEX "user_preferences_userId_idx" ON "user_preferences"("userId");

-- CreateIndex
CREATE INDEX "notification_type_idx" ON "notification"("type");

-- AddForeignKey
ALTER TABLE "post" ADD CONSTRAINT "post_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "post" ADD CONSTRAINT "post_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "post"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "post" ADD CONSTRAINT "post_featuredMediaId_fkey" FOREIGN KEY ("featuredMediaId") REFERENCES "media"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "post_meta" ADD CONSTRAINT "post_meta_postId_fkey" FOREIGN KEY ("postId") REFERENCES "post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "term" ADD CONSTRAINT "term_taxonomyId_fkey" FOREIGN KEY ("taxonomyId") REFERENCES "taxonomy"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "term" ADD CONSTRAINT "term_parentTermId_fkey" FOREIGN KEY ("parentTermId") REFERENCES "term"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "post_term" ADD CONSTRAINT "post_term_postId_fkey" FOREIGN KEY ("postId") REFERENCES "post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "post_term" ADD CONSTRAINT "post_term_termId_fkey" FOREIGN KEY ("termId") REFERENCES "term"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_preferences" ADD CONSTRAINT "user_preferences_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
