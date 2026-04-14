import { createHash } from "crypto";
import { Redis } from "@upstash/redis";
import prisma from "@/lib/prisma";
import { monitorConfig } from "@/lib/config/monitoring";
import { sendTelegramDetailed, splitTelegramMessage } from "@/lib/telegram";

type AlertSeverity = "info" | "warning" | "critical";
type IncidentStatus = "healthy" | "warning" | "critical";

interface MonitorAlertInput {
  source: string;
  title: string;
  message: string;
  severity: AlertSeverity;
  metadata?: Record<string, unknown>;
}

interface IncidentState {
  status: IncidentStatus;
  updatedAt: number;
}

const memoryDedup = new Map<string, number>();
const memoryIncident = new Map<string, IncidentState>();

let redis: Redis | null = null;
try {
  if (process.env.REDIS_URL && process.env.REDIS_TOKEN) {
    redis = new Redis({
      url: process.env.REDIS_URL,
      token: process.env.REDIS_TOKEN,
    });
  }
} catch {
  redis = null;
}

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

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

async function isDuplicate(dedupKey: string): Promise<boolean> {
  const key = `monitor:dedup:${dedupKey}`;
  if (redis) {
    const result = await redis.set(key, Date.now(), { nx: true, ex: Math.ceil(monitorConfig.alertDedupWindowMs / 1000) });
    return result !== "OK";
  }

  const now = Date.now();
  const previous = memoryDedup.get(key);
  if (previous && now - previous < monitorConfig.alertDedupWindowMs) {
    return true;
  }
  memoryDedup.set(key, now);
  return false;
}

async function getIncidentState(source: string): Promise<IncidentState | null> {
  const key = `monitor:incident:${source}`;
  if (redis) {
    const state = await redis.get<string>(key);
    if (!state) return null;
    try {
      return JSON.parse(state) as IncidentState;
    } catch {
      return null;
    }
  }
  return memoryIncident.get(key) ?? null;
}

async function setIncidentState(source: string, state: IncidentState): Promise<void> {
  const key = `monitor:incident:${source}`;
  if (redis) {
    await redis.set(key, JSON.stringify(state));
    return;
  }
  memoryIncident.set(key, state);
}

async function writeAuditLog(action: "CREATE" | "UPDATE", entityId: string, payload: Record<string, unknown>): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        action,
        entityType: "monitor_alert",
        entityId,
        newValues: payload,
      },
    });
  } catch {
    // best-effort logging
  }
}

async function sendChunksWithRetry(chatId: string, text: string): Promise<boolean> {
  const chunks = splitTelegramMessage(text);

  for (const chunk of chunks) {
    let success = false;
    for (let attempt = 1; attempt <= monitorConfig.alertMaxRetries; attempt++) {
      const result = await sendTelegramDetailed(chatId, chunk);
      if (result.ok) {
        success = true;
        break;
      }

      if (attempt < monitorConfig.alertMaxRetries) {
        const backoff = Math.min(
          monitorConfig.alertRetryBaseMs * 2 ** (attempt - 1),
          monitorConfig.alertRetryMaxMs
        );
        await sleep(backoff);
      }
    }

    if (!success) {
      return false;
    }
  }

  return true;
}

function buildAlertId(source: string, title: string): string {
  return createHash("sha256").update(`${source}:${title}`).digest("hex").slice(0, 16);
}

function buildMessage(input: MonitorAlertInput, mode: "normal" | "recovery"): string {
  const prefix = input.severity === "critical" ? "🚨" : input.severity === "warning" ? "⚠️" : "✅";
  const header = mode === "recovery" ? `${prefix} <b>Recovery</b>` : `${prefix} <b>${input.title}</b>`;
  return `${header}\nSource: ${input.source}\nSeverity: ${input.severity.toUpperCase()}\n\n${input.message}`;
}

export async function sendMonitorAlert(input: MonitorAlertInput): Promise<{ sent: boolean; reason?: string }> {
  if (monitorConfig.maintenanceMode && input.severity !== "critical") {
    return { sent: false, reason: "maintenance_mode" };
  }

  if (shouldSuppressByQuietHours(input.severity)) {
    return { sent: false, reason: "quiet_hours" };
  }

  const dedupKey = buildAlertId(input.source, input.title);
  const duplicate = await isDuplicate(dedupKey);

  const previousState = await getIncidentState(input.source);
  const nextState: IncidentState = {
    status: toIncidentStatus(input.severity),
    updatedAt: Date.now(),
  };

  const transitioned = previousState?.status !== nextState.status;
  const isRecovery =
    monitorConfig.enableRecoveryAlerts &&
    previousState &&
    previousState.status !== "healthy" &&
    nextState.status === "healthy";

  if (duplicate && !transitioned && !isRecovery) {
    return { sent: false, reason: "duplicate" };
  }

  await setIncidentState(input.source, nextState);

  const message = buildMessage(input, isRecovery ? "recovery" : "normal");
  const chatIds = getChatIds(input.severity);
  if (chatIds.length === 0) {
    return { sent: false, reason: "missing_chat_id" };
  }

  let sentCount = 0;
  for (const chatId of chatIds) {
    const ok = await sendChunksWithRetry(chatId, message);
    if (ok) sentCount += 1;
  }

  const entityId = buildAlertId(input.source, `${input.title}:${input.severity}:${Date.now()}`);
  await writeAuditLog(sentCount > 0 ? "CREATE" : "UPDATE", entityId, {
    source: input.source,
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
