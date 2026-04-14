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

const incidentKey = (source: string) => `monitor.incident.${source}`;
const silenceKey = (source: string) => `monitor.silence.${source}`;

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
        newValues: payload,
      },
    });
  } catch {
    // best-effort logging
  }
}

async function getIncidentState(source: string): Promise<IncidentState | null> {
  const setting = await prisma.siteSetting.findUnique({ where: { key: incidentKey(source) } });
  if (!setting) return null;
  try {
    return JSON.parse(setting.value) as IncidentState;
  } catch {
    return null;
  }
}

async function setIncidentState(source: string, state: IncidentState): Promise<void> {
  await prisma.siteSetting.upsert({
    where: { key: incidentKey(source) },
    update: { value: JSON.stringify(state) },
    create: { key: incidentKey(source), value: JSON.stringify(state) },
  });
}

async function getSilencedUntil(source: string): Promise<number | null> {
  const setting = await prisma.siteSetting.findUnique({ where: { key: silenceKey(source) } });
  if (!setting) return null;
  const value = Number.parseInt(setting.value, 10);
  return Number.isFinite(value) ? value : null;
}

async function isSilenced(source: string): Promise<boolean> {
  const until = await getSilencedUntil(source);
  return until !== null && Date.now() < until;
}

async function isDuplicate(dedupKey: string): Promise<boolean> {
  const threshold = new Date(Date.now() - monitorConfig.alertDedupWindowMs);
  const existing = await prisma.auditLog.findFirst({
    where: {
      entityType: "monitor_alert",
      entityId: dedupKey,
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
        await writeAuditLog("CREATE", "monitor_delivery", `${deliveryId}:${chatId}:${chunkIndex}:${attempt}`, {
          chatId,
          chunkIndex,
          attempt,
          status: "sent",
        });
        break;
      }

      lastError = result.error ?? "delivery_failed";
      await writeAuditLog("UPDATE", "monitor_delivery", `${deliveryId}:${chatId}:${chunkIndex}:${attempt}`, {
        chatId,
        chunkIndex,
        attempt,
        status: "failed",
        error: lastError,
      });

      if (attempt < monitorConfig.alertMaxRetries) {
        const backoff = Math.min(monitorConfig.alertRetryBaseMs * 2 ** (attempt - 1), monitorConfig.alertRetryMaxMs);
        await sleep(backoff);
      }
    }

    if (!success) {
      await writeAuditLog("UPDATE", "monitor_delivery", `${deliveryId}:${chatId}:${chunkIndex}:final`, {
        chatId,
        chunkIndex,
        status: "failed_final",
        error: lastError,
      });
      return false;
    }
  }

  return true;
}

export async function setMonitorSilence(source: string, minutes = monitorConfig.alertDefaultSilenceMinutes): Promise<number> {
  const silencedUntil = Date.now() + Math.max(1, minutes) * 60 * 1000;
  await prisma.siteSetting.upsert({
    where: { key: silenceKey(source) },
    update: { value: String(silencedUntil) },
    create: { key: silenceKey(source), value: String(silencedUntil) },
  });
  return silencedUntil;
}

export async function clearMonitorSilence(source: string): Promise<void> {
  await prisma.siteSetting.deleteMany({ where: { key: silenceKey(source) } });
}

export async function getMonitorIncidents(): Promise<MonitorIncident[]> {
  const [incidentSettings, silenceSettings] = await Promise.all([
    prisma.siteSetting.findMany({ where: { key: { startsWith: "monitor.incident." } }, orderBy: { key: "asc" } }),
    prisma.siteSetting.findMany({ where: { key: { startsWith: "monitor.silence." } } }),
  ]);

  const silenceMap = new Map<string, number>();
  for (const setting of silenceSettings) {
    const source = setting.key.replace("monitor.silence.", "");
    const value = Number.parseInt(setting.value, 10);
    silenceMap.set(source, Number.isFinite(value) ? value : 0);
  }

  const incidents: MonitorIncident[] = [];
  for (const setting of incidentSettings) {
    try {
      const source = setting.key.replace("monitor.incident.", "");
      const parsed = JSON.parse(setting.value) as IncidentState;
      incidents.push({
        source,
        status: parsed.status,
        updatedAt: parsed.updatedAt,
        silencedUntil: silenceMap.get(source) ?? null,
      });
    } catch {
      // ignore invalid records
    }
  }

  return incidents;
}

export async function getRecentMonitorAlerts(limit = 50): Promise<Array<Record<string, unknown>>> {
  const rows = await prisma.auditLog.findMany({
    where: { entityType: { in: ["monitor_alert", "monitor_delivery"] } },
    orderBy: { createdAt: "desc" },
    take: Math.max(1, Math.min(limit, 200)),
    select: {
      id: true,
      action: true,
      entityType: true,
      entityId: true,
      createdAt: true,
      newValues: true,
    },
  });

  return rows.map(row => ({
    id: row.id,
    action: row.action,
    entityType: row.entityType,
    entityId: row.entityId,
    createdAt: row.createdAt,
    payload: row.newValues,
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

  const dedupKey = hashId(`${input.source}:${input.title}:${input.severity}`);
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

  const deliveryId = hashId(`${input.source}:${Date.now()}:${Math.random()}`);
  let sentCount = 0;
  for (const chatId of chatIds) {
    const ok = await sendChunksWithRetry(chatId, message, deliveryId);
    if (ok) sentCount += 1;
  }

  await writeAuditLog(sentCount > 0 ? "CREATE" : "UPDATE", "monitor_alert", dedupKey, {
    source: input.source,
    title: input.title,
    severity: input.severity,
    sentCount,
    totalChats: chatIds.length,
    dedupKey,
    transitioned,
    isRecovery,
    metadata: input.metadata ?? {},
    timestamp: Date.now(),
  });

  return sentCount > 0 ? { sent: true } : { sent: false, reason: "delivery_failed" };
}
