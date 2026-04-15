-- AlterTable "user"
ALTER TABLE "user" ADD COLUMN "failedLoginAttempts" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "user" ADD COLUMN "lastFailedLoginAt" TIMESTAMP(3);

-- CreateTable "login_attempt"
CREATE TABLE "login_attempt" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "ipAddress" TEXT NOT NULL,
    "success" BOOLEAN NOT NULL,
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "login_attempt_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "login_attempt_email_createdAt_idx" ON "login_attempt"("email", "createdAt");

-- CreateIndex
CREATE INDEX "login_attempt_ipAddress_createdAt_idx" ON "login_attempt"("ipAddress", "createdAt");

-- CreateIndex
CREATE INDEX "login_attempt_success_idx" ON "login_attempt"("success");
