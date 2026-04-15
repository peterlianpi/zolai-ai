-- CreateEnum
CREATE TYPE "SecurityAlertType" AS ENUM ('SUSPICIOUS_LOGIN', 'NEW_DEVICE_LOGIN', 'MULTIPLE_FAILED_LOGINS', 'PASSWORD_BREACH_DETECTED', 'UNUSUAL_LOCATION_LOGIN', 'ACCOUNT_LOCKED');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "SecurityEventType" ADD VALUE 'DEVICE_SESSION_CREATED';
ALTER TYPE "SecurityEventType" ADD VALUE 'DEVICE_SESSION_REVOKED';
ALTER TYPE "SecurityEventType" ADD VALUE 'ALL_OTHER_SESSIONS_REVOKED';
ALTER TYPE "SecurityEventType" ADD VALUE 'PASSWORD_BREACH_DETECTED';
ALTER TYPE "SecurityEventType" ADD VALUE 'CAPTCHA_FAILED';
ALTER TYPE "SecurityEventType" ADD VALUE 'NEW_DEVICE_LOGIN';
ALTER TYPE "SecurityEventType" ADD VALUE 'UNUSUAL_LOCATION_LOGIN';
ALTER TYPE "SecurityEventType" ADD VALUE 'TWO_FACTOR_ENABLED';
ALTER TYPE "SecurityEventType" ADD VALUE 'TWO_FACTOR_DISABLED';
ALTER TYPE "SecurityEventType" ADD VALUE 'TWO_FACTOR_BACKUP_CODES_GENERATED';
ALTER TYPE "SecurityEventType" ADD VALUE 'ACCOUNT_LOCKED';
ALTER TYPE "SecurityEventType" ADD VALUE 'ACCOUNT_UNLOCKED';

-- CreateTable
CREATE TABLE "security_alert" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "SecurityAlertType" NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "severity" "SecuritySeverity" NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "isResolved" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolvedAt" TIMESTAMP(3),
    "resolvedBy" TEXT,

    CONSTRAINT "security_alert_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "security_settings" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "twoFactorEnabled" BOOLEAN NOT NULL DEFAULT false,
    "emailNotificationsEnabled" BOOLEAN NOT NULL DEFAULT true,
    "suspiciousActivityAlerts" BOOLEAN NOT NULL DEFAULT true,
    "newDeviceAlerts" BOOLEAN NOT NULL DEFAULT true,
    "locationBasedAlerts" BOOLEAN NOT NULL DEFAULT false,
    "sessionTimeout" INTEGER NOT NULL DEFAULT 30,
    "maxSessions" INTEGER NOT NULL DEFAULT 5,
    "allowedCountries" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "blockedCountries" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "trustedDevices" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "security_settings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "security_alert_userId_isRead_idx" ON "security_alert"("userId", "isRead");

-- CreateIndex
CREATE INDEX "security_alert_userId_createdAt_idx" ON "security_alert"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "security_alert_severity_idx" ON "security_alert"("severity");

-- CreateIndex
CREATE UNIQUE INDEX "security_settings_userId_key" ON "security_settings"("userId");

-- CreateIndex
CREATE INDEX "security_settings_userId_idx" ON "security_settings"("userId");
