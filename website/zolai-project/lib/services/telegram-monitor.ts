import { createHash } from "crypto";
import prisma from "@/lib/prisma";
import { monitorConfig } from "@/lib/config/monitoring";
import { sendTelegramDetailed, splitTelegramMessage } from "@/lib/telegram";

export type AlertSeverity = "info" | "warning" | "critical";
export type IncidentStatus = "healthy" | "warning" | "critical";

export interface MonitorAlertInput {
  source: string;
  title: string;
  message: string;
  severity: AlertSeverity;
  metadata?: Record<string, unknown>;
}

export interface MonitorIncident {
  source: string;
  status: IncidentStatus;
  updatedAt: number;
  silencedUntil: number | null;
}

interface IncidentState {
  status: IncidentStatus;
  updatedAt: number;
}

interface MonitorAlertResult {
  sent: boolean;
  reason?: string;
}

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// incidentKey is kept for reference if needed; unused after migration to Prisma models
// const incidentKey = (source: string) => `monitor.incident.${source}`;
const severityToDb = {
  info: "INFO",
  warning: "WARNING",
  critical: "CRITICAL",
} as const;

const statusToDb = {
  healthy: "HEALTHY",
  warning: "WARNING",
  critical: "CRITICAL",
} as const;

const dbToStatus: Record<string, IncidentStatus> = {
  HEALTHY: "healthy",
  WARNING: "warning",
  CRITICAL: "critical",
};

function getChatIds(severity: AlertSeverity): string[] {
  const adminChat = process.env.TELEGRAM_CHAT_ID ? [process.env.TELEGRAM_CHAT_ID] : [];
  if (severity === "critical") {
    return [...new Set([...monitorConfig.criticalChatIds, ...monitorConfig.warningChatIds, ...monitorConfig.infoChatIds, ...adminChat])];
  }
  if (severity === "warning") {
    return [...new Set([...monitorConfig.warningChatIds, ...monitorConfig.infoChatIds, ...adminChat])];
  }
  return [...new Set([...monitorConfig.infoChatIds, ...adminChat])];
}

function shouldSuppressByQuietHours(severity: AlertSeverity): boolean {
  if (severity === "critical") return false;
  const start = monitorConfig.alertQuietHoursStart;
  const end = monitorConfig.alertQuietHoursEnd;
  if (start < 0 || end < 0 || start > 23 || end > 23) return false;

  const hour = new Date().getHours();
  if (start === end) return false;

  if (start < end) {
    return hour >= start && hour < end;
  }
  return hour >= start || hour < end;
}

function toIncidentStatus(severity: AlertSeverity): IncidentStatus {
  if (severity === "critical") return "critical";
  if (severity === "warning") return "warning";
  return "healthy";
}

function hashId(input: string): string {
  return createHash("sha256").update(input).digest("hex").slice(0, 24);
}

function buildMessage(input: MonitorAlertInput, mode: "normal" | "recovery"): string {
  const prefix = input.severity === "critical" ? "🚨" : input.severity === "warning" ? "⚠️" : "✅";
  const header = mode === "recovery" ? `${prefix} <b>Recovery</b>` : `${prefix} <b>${input.title}</b>`;
  return `${header}\nSource: ${input.source}\nSeverity: ${input.severity.toUpperCase()}\n\n${input.message}`;
}

async function writeAuditLog(action: "CREATE" | "UPDATE", entityType: string, entityId: string, payload: Record<string, unknown>): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        action,
        entityType,
        entityId,
        newValues: payload as import("@/lib/generated/prisma").Prisma.InputJsonValue,
      },
    });
  } catch {
    // best-effort logging
  }
}

async function getIncidentState(source: string): Promise<IncidentState | null> {
  const incident = await prisma.monitorIncident.findUnique({
    where: { source },
    select: { status: true, updatedAt: true },
  });
  if (!incident) {
    return null;
  }
  return {
    status: dbToStatus[incident.status] ?? "healthy",
    updatedAt: incident.updatedAt.getTime(),
  };
}

async function setIncidentState(source: string, state: IncidentState): Promise<void> {
  await prisma.monitorIncident.upsert({
    where: { source },
    update: {
      status: statusToDb[state.status],
      updatedAt: new Date(state.updatedAt),
    },
    create: {
      source,
      status: statusToDb[state.status],
      updatedAt: new Date(state.updatedAt),
    },
  });
}

async function getSilencedUntil(source: string): Promise<number | null> {
  const incident = await prisma.monitorIncident.findUnique({
    where: { source },
    select: { silencedUntil: true },
  });
  if (!incident?.silencedUntil) return null;
  return incident.silencedUntil.getTime();
}

async function isSilenced(source: string): Promise<boolean> {
  const until = await getSilencedUntil(source);
  return until !== null && Date.now() < until;
}

async function isDuplicate(dedupKey: string): Promise<boolean> {
  const threshold = new Date(Date.now() - monitorConfig.alertDedupWindowMs);
  const existing = await prisma.monitorAlert.findFirst({
    where: {
      dedupKey,
      createdAt: { gte: threshold },
    },
    select: { id: true },
  });
  return Boolean(existing);
}

async function sendChunksWithRetry(chatId: string, text: string, deliveryId: string): Promise<boolean> {
  const chunks = splitTelegramMessage(text);

  for (let chunkIndex = 0; chunkIndex < chunks.length; chunkIndex += 1) {
    const chunk = chunks[chunkIndex];
    let success = false;
    let lastError = "";

    for (let attempt = 1; attempt <= monitorConfig.alertMaxRetries; attempt += 1) {
      const result = await sendTelegramDetailed(chatId, chunk);
      if (result.ok) {
        success = true;
        await prisma.monitorAlertDelivery.create({
          data: {
            alertId: deliveryId,
            chatId,
            chunkIndex,
            attempt,
            status: "SENT",
          },
        });
        break;
      }

      lastError = result.error ?? "delivery_failed";
      await prisma.monitorAlertDelivery.create({
        data: {
          alertId: deliveryId,
          chatId,
          chunkIndex,
          attempt,
          status: "FAILED",
          error: lastError,
        },
      });

      if (attempt < monitorConfig.alertMaxRetries) {
        const backoff = Math.min(monitorConfig.alertRetryBaseMs * 2 ** (attempt - 1), monitorConfig.alertRetryMaxMs);
        await sleep(backoff);
      }
    }

    if (!success) {
      await prisma.monitorAlertDelivery.create({
        data: {
          alertId: deliveryId,
          chatId,
          chunkIndex,
          attempt: monitorConfig.alertMaxRetries,
          status: "FAILED_FINAL",
          error: lastError,
        },
      });
      return false;
    }
  }

  return true;
}

export async function setMonitorSilence(source: string, minutes = monitorConfig.alertDefaultSilenceMinutes): Promise<number> {
  const silencedUntil = Date.now() + Math.max(1, minutes) * 60 * 1000;
  await prisma.monitorIncident.upsert({
    where: { source },
    update: { silencedUntil: new Date(silencedUntil) },
    create: {
      source,
      status: "HEALTHY",
      silencedUntil: new Date(silencedUntil),
    },
  });
  return silencedUntil;
}

export async function clearMonitorSilence(source: string): Promise<void> {
  await prisma.monitorIncident.updateMany({
    where: { source },
    data: { silencedUntil: null },
  });
}

export async function getMonitorIncidents(): Promise<MonitorIncident[]> {
  const incidents = await prisma.monitorIncident.findMany({
    orderBy: [{ status: "desc" }, { updatedAt: "desc" }],
    select: {
      source: true,
      status: true,
      updatedAt: true,
      silencedUntil: true,
    },
  });

  return incidents.map(incident => ({
    source: incident.source,
    status: dbToStatus[incident.status] ?? "healthy",
    updatedAt: incident.updatedAt.getTime(),
    silencedUntil: incident.silencedUntil ? incident.silencedUntil.getTime() : null,
  }));
}

export async function getRecentMonitorAlerts(limit = 50): Promise<Array<Record<string, unknown>>> {
  const rows = await prisma.monitorAlert.findMany({
    orderBy: { createdAt: "desc" },
    take: Math.max(1, Math.min(limit, 200)),
    include: {
      deliveries: {
        orderBy: { createdAt: "desc" },
        take: 20,
      },
    },
  });

  return rows.map(row => ({
    id: row.id,
    source: row.source,
    title: row.title,
    severity: row.severity,
    sent: row.sent,
    reason: row.reason,
    dedupKey: row.dedupKey,
    transitioned: row.transitioned,
    isRecovery: row.isRecovery,
    metadata: row.metadata,
    createdAt: row.createdAt,
    deliveries: row.deliveries,
  }));
}

export async function sendMonitorAlert(input: MonitorAlertInput): Promise<MonitorAlertResult> {
  if (monitorConfig.maintenanceMode && input.severity !== "critical") {
    return { sent: false, reason: "maintenance_mode" };
  }

  if (shouldSuppressByQuietHours(input.severity)) {
    return { sent: false, reason: "quiet_hours" };
  }

  if (await isSilenced(input.source)) {
    return { sent: false, reason: "silenced" };
  }

  const dedupKey = hashId(
    input.severity === "info"
      // Heartbeat info alerts: dedup per hour bucket so each hour's first alert sends
      ? `${input.source}:${input.title}:${input.severity}:${Math.floor(Date.now() / 3600000)}`
      : `${input.source}:${input.title}:${input.severity}`
  );
  const duplicate = await isDuplicate(dedupKey);

  const previousState = await getIncidentState(input.source);
  const nextState: IncidentState = { status: toIncidentStatus(input.severity), updatedAt: Date.now() };
  const transitioned = previousState?.status !== nextState.status;
  const isRecovery = Boolean(
    monitorConfig.enableRecoveryAlerts &&
    previousState &&
    previousState.status !== "healthy" &&
    nextState.status === "healthy"
  );

  if (duplicate && !transitioned && !isRecovery) {
    return { sent: false, reason: "duplicate" };
  }

  await setIncidentState(input.source, nextState);

  const message = buildMessage(input, isRecovery ? "recovery" : "normal");
  const chatIds = getChatIds(input.severity);
  if (chatIds.length === 0) {
    return { sent: false, reason: "missing_chat_id" };
  }

  const alert = await prisma.monitorAlert.create({
    data: {
      source: input.source,
      title: input.title,
      message,
      severity: severityToDb[input.severity],
      sent: false,
      dedupKey,
      transitioned,
      isRecovery,
      metadata: (input.metadata ?? {}) as import("@/lib/generated/prisma").Prisma.InputJsonValue,
    },
  });

  const deliveryId = alert.id;
  let sentCount = 0;
  for (const chatId of chatIds) {
    const ok = await sendChunksWithRetry(chatId, message, deliveryId);
    if (ok) sentCount += 1;
  }

  await prisma.monitorAlert.update({
    where: { id: alert.id },
    data: {
      sent: sentCount > 0,
      reason: sentCount > 0 ? null : "delivery_failed",
      metadata: {
        ...(input.metadata ?? {}),
        sentCount,
        totalChats: chatIds.length,
        timestamp: Date.now(),
      },
    },
  });

  await writeAuditLog(sentCount > 0 ? "CREATE" : "UPDATE", "monitor_alert", alert.id, {
    source: input.source,
    title: input.title,
    severity: input.severity,
    sentCount,
    totalChats: chatIds.length,
    dedupKey,
    transitioned,
    isRecovery,
  });

  return sentCount > 0 ? { sent: true } : { sent: false, reason: "delivery_failed" };
}
