-- AlterTable
ALTER TABLE "post" ADD CONSTRAINT "post_wpId_key" UNIQUE ("wpId");

-- AlterTable
ALTER TABLE "media" ADD CONSTRAINT "media_wpId_key" UNIQUE ("wpId");
