/**
 * Web Push Notification Delivery Service
 * Handles browser push notifications using Web Push API
 */

export interface PushSubscriptionData {
  userId: string;
  subscription: PushSubscription;
  userAgent?: string;
  isActive: boolean;
}

/**
 * Subscribe user to push notifications
 * Requires user permission and valid service worker
 */
export async function subscribeToPushNotifications(): Promise<{
  success: boolean;
  subscription?: PushSubscription;
  error?: string;
}> {
  try {
    // Check if service worker and push API are supported
    if (!("serviceWorker" in navigator)) {
      return { success: false, error: "Service Worker not supported" };
    }

    if (!("PushManager" in window)) {
      return { success: false, error: "Push notifications not supported" };
    }

    // Register service worker
    const registration = await navigator.serviceWorker.register(
      "/sw.js",
      { scope: "/" }
    );

    // Request notification permission
    if (Notification.permission === "denied") {
      return { success: false, error: "Notification permission denied" };
    }

    if (Notification.permission !== "granted") {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        return { success: false, error: "User denied notification permission" };
      }
    }

    // Subscribe to push notifications
    const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    if (!vapidPublicKey) {
      return { success: false, error: "VAPID key not configured" };
    }

    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(vapidPublicKey).buffer as ArrayBuffer,
    });

    // Save subscription to server
    await saveSubscriptionToServer(subscription);

    return { success: true, subscription };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("[Push] Subscription error:", message);
    return { success: false, error: message };
  }
}

/**
 * Unsubscribe user from push notifications
 */
export async function unsubscribeFromPushNotifications(): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    if (!("serviceWorker" in navigator)) {
      return { success: false, error: "Service Worker not supported" };
    }

    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();

    if (!subscription) {
      return { success: true }; // Already unsubscribed
    }

    await subscription.unsubscribe();
    await deleteSubscriptionFromServer(subscription);

    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("[Push] Unsubscribe error:", message);
    return { success: false, error: message };
  }
}

/**
 * Send push notification to subscribed users
 * Called from server-side
 */
export async function sendPushNotification(
  subscriptions: PushSubscription[],
  payload: {
    title: string;
    body: string;
    icon?: string;
    tag?: string;
    badge?: string;
    data?: Record<string, string>;
  }
): Promise<{ success: boolean; sent: number; failed: number }> {
  let sent = 0;
  let failed = 0;

  const promises = subscriptions.map(async (subscription) => {
    try {
      const response = await fetch(subscription.endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // Add authentication headers if needed
        },
        body: JSON.stringify({
          notification: {
            title: payload.title,
            body: payload.body,
            icon: payload.icon || "/icon-192x192.png",
            badge: payload.badge || "/badge-72x72.png",
            tag: payload.tag || "default",
            data: payload.data,
          },
        }),
      });

      if (response.ok) {
        sent++;
      } else {
        failed++;
      }
    } catch (error) {
      console.error("[Push] Notification send error:", error);
      failed++;
    }
  });

  await Promise.all(promises);
  return { success: failed === 0, sent, failed };
}

/**
 * Save push subscription to server for future sending
 */
async function saveSubscriptionToServer(
  subscription: PushSubscription
): Promise<void> {
  const response = await fetch("/api/notifications/subscriptions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(subscription),
  });

  if (!response.ok) {
    throw new Error("Failed to save subscription");
  }
}

/**
 * Delete push subscription from server
 */
async function deleteSubscriptionFromServer(
  subscription: PushSubscription
): Promise<void> {
  const response = await fetch("/api/notifications/subscriptions", {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(subscription),
  });

  if (!response.ok) {
    throw new Error("Failed to delete subscription");
  }
}

/**
 * Convert VAPID public key from base64 to Uint8Array
 */
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, "+")
    .replace(/_/g, "/");

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }

  return outputArray;
}
