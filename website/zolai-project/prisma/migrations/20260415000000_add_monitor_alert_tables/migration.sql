-- Create enums for monitor system
CREATE TYPE "MonitorSeverity" AS ENUM ('INFO', 'WARNING', 'CRITICAL');
CREATE TYPE "MonitorDeliveryStatus" AS ENUM ('SENT', 'FAILED', 'FAILED_FINAL');
CREATE TYPE "IncidentStatus" AS ENUM ('HEALTHY', 'WARNING', 'CRITICAL');

-- Create monitor_alert table
CREATE TABLE "monitor_alert" (
  "id" TEXT NOT NULL,
  "source" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "message" TEXT NOT NULL,
  "severity" "MonitorSeverity" NOT NULL,
  "sent" BOOLEAN NOT NULL DEFAULT false,
  "reason" TEXT,
  "dedupKey" TEXT NOT NULL,
  "transitioned" BOOLEAN NOT NULL DEFAULT false,
  "isRecovery" BOOLEAN NOT NULL DEFAULT false,
  "metadata" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "monitor_alert_pkey" PRIMARY KEY ("id")
);

-- Create monitor_alert_delivery table
CREATE TABLE "monitor_alert_delivery" (
  "id" TEXT NOT NULL,
  "alertId" TEXT NOT NULL,
  "chatId" TEXT NOT NULL,
  "chunkIndex" INTEGER NOT NULL,
  "attempt" INTEGER NOT NULL,
  "status" "MonitorDeliveryStatus" NOT NULL,
  "error" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "monitor_alert_delivery_pkey" PRIMARY KEY ("id")
);

-- Create monitor_incident table
CREATE TABLE "monitor_incident" (
  "id" TEXT NOT NULL,
  "source" TEXT NOT NULL,
  "status" "IncidentStatus" NOT NULL,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "silencedUntil" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "monitor_incident_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "monitor_incident_source_key" ON "monitor_incident"("source");
CREATE INDEX "monitor_alert_source_createdAt_idx" ON "monitor_alert"("source", "createdAt");
CREATE INDEX "monitor_alert_severity_createdAt_idx" ON "monitor_alert"("severity", "createdAt");
CREATE INDEX "monitor_alert_dedupKey_idx" ON "monitor_alert"("dedupKey");
CREATE INDEX "monitor_alert_delivery_alertId_createdAt_idx" ON "monitor_alert_delivery"("alertId", "createdAt");
CREATE INDEX "monitor_alert_delivery_chatId_createdAt_idx" ON "monitor_alert_delivery"("chatId", "createdAt");
CREATE INDEX "monitor_incident_status_updatedAt_idx" ON "monitor_incident"("status", "updatedAt");

ALTER TABLE "monitor_alert_delivery"
  ADD CONSTRAINT "monitor_alert_delivery_alertId_fkey"
  FOREIGN KEY ("alertId") REFERENCES "monitor_alert"("id") ON DELETE CASCADE ON UPDATE CASCADE;
