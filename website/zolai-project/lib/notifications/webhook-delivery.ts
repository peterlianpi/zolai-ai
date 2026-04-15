/**
 * Webhook Notification Delivery Service
 * Send notifications to external webhooks for integrations
 */

import prisma from "@/lib/prisma";

// SSRF protection: block private/internal IP ranges and non-HTTPS schemes
function validateWebhookUrl(url: string): { valid: boolean; error?: string } {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return { valid: false, error: "Invalid URL" };
  }

  if (parsed.protocol !== "https:") {
    return { valid: false, error: "Webhook URL must use HTTPS" };
  }

  const hostname = parsed.hostname.toLowerCase();

  // Block localhost and loopback
  if (hostname === "localhost" || hostname === "127.0.0.1" || hostname === "::1") {
    return { valid: false, error: "Webhook URL must not target internal addresses" };
  }

  // Block private IP ranges (RFC 1918, link-local, metadata services)
  const privatePatterns = [
    /^10\./,
    /^172\.(1[6-9]|2\d|3[01])\./,
    /^192\.168\./,
    /^169\.254\./,       // link-local / AWS metadata
    /^100\.64\./,        // CGNAT
    /^0\./,
    /^fc00:/i,           // IPv6 ULA
    /^fe80:/i,           // IPv6 link-local
  ];
  if (privatePatterns.some(p => p.test(hostname))) {
    return { valid: false, error: "Webhook URL must not target internal addresses" };
  }

  return { valid: true };
}

interface StoredWebhookEndpoint extends WebhookEndpoint {
  userId: string;
}

type WebhookEndpointStore = {
  findMany: (args: unknown) => Promise<StoredWebhookEndpoint[]>;
  create: (args: unknown) => Promise<StoredWebhookEndpoint>;
  findUnique: (args: unknown) => Promise<StoredWebhookEndpoint | null>;
  delete: (args: unknown) => Promise<unknown>;
  update: (args: unknown) => Promise<StoredWebhookEndpoint>;
};

function getWebhookEndpointStore(): WebhookEndpointStore | null {
  if (
    typeof prisma === "object" &&
    prisma !== null &&
    "webhookEndpoint" in prisma &&
    typeof (prisma as Record<string, unknown>)["webhookEndpoint"] === "object" &&
    (prisma as Record<string, unknown>)["webhookEndpoint"] !== null
  ) {
    return (prisma as Record<string, unknown>)["webhookEndpoint"] as WebhookEndpointStore;
  }
  return null;
}

export interface WebhookPayload {
  event: string;
  timestamp: string;
  data: Record<string, unknown>;
  userId?: string;
}

export interface WebhookEndpoint {
  id: string;
  url: string;
  secret?: string;
  events: string[]; // e.g., ["notification.sent", "notification.read"]
  isActive: boolean;
}

/**
 * Send webhook notification
 */
export async function sendWebhookNotification(
  webhookUrl: string,
  payload: WebhookPayload,
  secret?: string
): Promise<{ success: boolean; statusCode?: number; error?: string }> {
  try {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "User-Agent": "Zolai-Webhook-Service/1.0",
      "X-Webhook-Event": payload.event,
      "X-Webhook-Timestamp": payload.timestamp,
    };

    // Sign webhook with HMAC if secret is provided
    if (secret) {
      const crypto = await import("crypto");
      const signature = crypto
        .createHmac("sha256", secret)
        .update(JSON.stringify(payload))
        .digest("hex");
      headers["X-Webhook-Signature"] = `sha256=${signature}`;
    }

    const response = await fetch(webhookUrl, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.warn(
        `[Webhook] Delivery failed to ${webhookUrl}: ${response.status}`,
        errorText
      );
    }

    return { success: response.ok, statusCode: response.status };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error(
      `[Webhook] Delivery error to ${webhookUrl}:`,
      message
    );
    return { success: false, error: message };
  }
}

/**
 * Send webhook to all registered endpoints for an event
 */
export async function sendWebhookToAllEndpoints(
  event: string,
  payload: Record<string, unknown>,
  userId?: string
): Promise<{
  success: boolean;
  delivered: number;
  failed: number;
}> {
  try {
    const webhookEndpointStore = getWebhookEndpointStore();
    if (!webhookEndpointStore) {
      return { success: true, delivered: 0, failed: 0 };
    }

    // Get active webhook endpoints for this event
    const endpoints = await webhookEndpointStore.findMany({
      where: {
        isActive: true,
        events: {
          has: event,
        },
      },
    });

    if (endpoints.length === 0) {
      return { success: true, delivered: 0, failed: 0 };
    }

    const webhookPayload: WebhookPayload = {
      event,
      timestamp: new Date().toISOString(),
      data: payload,
      userId,
    };

    const results = await Promise.allSettled(
      endpoints.map((endpoint) =>
        sendWebhookNotification(endpoint.url, webhookPayload, endpoint.secret)
      )
    );

    const delivered = results.filter(
      (r) => r.status === "fulfilled" && r.value.success
    ).length;
    const failed = results.length - delivered;

    return { success: failed === 0, delivered, failed };
  } catch (error) {
    console.error("[Webhook] Error sending to endpoints:", error);
    return { success: false, delivered: 0, failed: 0 };
  }
}

/**
 * Register a webhook endpoint
 */
export async function registerWebhookEndpoint(
  userId: string,
  url: string,
  events: string[],
  secret?: string
): Promise<{ success: boolean; endpoint?: WebhookEndpoint; error?: string }> {
  try {
    const webhookEndpointStore = getWebhookEndpointStore();
    if (!webhookEndpointStore) {
      return { success: false, error: "Webhook endpoint storage is not configured" };
    }

    // Validate URL
    const urlValidation = validateWebhookUrl(url);
    if (!urlValidation.valid) {
      return { success: false, error: urlValidation.error };
    }

    // Test webhook by sending a ping event
    const testResult = await sendWebhookNotification(
      url,
      {
        event: "webhook.test",
        timestamp: new Date().toISOString(),
        data: { message: "Test webhook" },
        userId,
      },
      secret
    );

    if (!testResult.success) {
      return {
        success: false,
        error: "Webhook endpoint failed validation - could not reach URL",
      };
    }

    // Create webhook endpoint in database
    const endpoint = await webhookEndpointStore.create({
      data: {
        userId,
        url,
        secret,
        events,
        isActive: true,
      },
    });

    return { success: true, endpoint };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return { success: false, error: message };
  }
}

/**
 * Delete webhook endpoint
 */
export async function deleteWebhookEndpoint(
  userId: string,
  endpointId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const webhookEndpointStore = getWebhookEndpointStore();
    if (!webhookEndpointStore) {
      return { success: false, error: "Webhook endpoint storage is not configured" };
    }

    const endpoint = await webhookEndpointStore.findUnique({
      where: { id: endpointId },
    });

    if (!endpoint) {
      return { success: false, error: "Webhook endpoint not found" };
    }

    if (endpoint.userId !== userId) {
      return { success: false, error: "Unauthorized" };
    }

    await webhookEndpointStore.delete({
      where: { id: endpointId },
    });

    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return { success: false, error: message };
  }
}

/**
 * Update webhook endpoint
 */
export async function updateWebhookEndpoint(
  userId: string,
  endpointId: string,
  updates: { url?: string; secret?: string; events?: string[]; isActive?: boolean }
): Promise<{ success: boolean; endpoint?: WebhookEndpoint; error?: string }> {
  try {
    const webhookEndpointStore = getWebhookEndpointStore();
    if (!webhookEndpointStore) {
      return { success: false, error: "Webhook endpoint storage is not configured" };
    }

    const endpoint = await webhookEndpointStore.findUnique({
      where: { id: endpointId },
    });

    if (!endpoint) {
      return { success: false, error: "Webhook endpoint not found" };
    }

    if (endpoint.userId !== userId) {
      return { success: false, error: "Unauthorized" };
    }

    // Validate new URL if provided
    if (updates.url && updates.url !== endpoint.url) {
      const urlValidation = validateWebhookUrl(updates.url);
      if (!urlValidation.valid) {
        return { success: false, error: urlValidation.error };
      }

      // Test new URL
      const testResult = await sendWebhookNotification(
        updates.url,
        {
          event: "webhook.test",
          timestamp: new Date().toISOString(),
          data: { message: "Test webhook" },
          userId,
        },
        updates.secret || endpoint.secret
      );

      if (!testResult.success) {
        return {
          success: false,
          error: "New webhook endpoint failed validation",
        };
      }
    }

    const updated = await webhookEndpointStore.update({
      where: { id: endpointId },
      data: updates,
    });

    return { success: true, endpoint: updated };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return { success: false, error: message };
  }
}
