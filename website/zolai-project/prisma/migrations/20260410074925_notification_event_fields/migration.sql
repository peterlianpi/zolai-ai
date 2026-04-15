-- AlterTable
ALTER TABLE "notification" ADD COLUMN     "action" TEXT,
ADD COLUMN     "actorName" TEXT,
ADD COLUMN     "actorUserId" TEXT,
ADD COLUMN     "link" TEXT,
ADD COLUMN     "metadata" JSONB;

-- CreateIndex
CREATE INDEX "notification_userId_createdAt_idx" ON "notification"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "notification_userId_read_createdAt_idx" ON "notification"("userId", "read", "createdAt");

-- CreateIndex
CREATE INDEX "notification_entityType_entityId_idx" ON "notification"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "notification_actorUserId_idx" ON "notification"("actorUserId");
