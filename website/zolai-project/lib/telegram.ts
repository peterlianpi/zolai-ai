import { monitorConfig } from "@/lib/config/monitoring";

const TOKEN = process.env.TELEGRAM_BOT_TOKEN!;
const API = `https://api.telegram.org/bot${TOKEN}`;

/** Telegram message sending with progress tracking */
export interface SendProgress {
  status: "pending" | "processing" | "success" | "failed";
  timestamp: number;
  retryCount?: number;
}

export async function sendTelegram(chatId: string | number, text: string, options?: { progressCallback?: (progress: SendProgress) => void }): Promise<boolean> {
  if (!TOKEN) {
    options?.progressCallback?.({ status: "failed", timestamp: Date.now() });
    return false;
  }
  
  try {
    options?.progressCallback?.({ status: "processing", timestamp: Date.now() });
    
    const response = await fetch(`${API}/sendMessage`, {
      method: "POST",
      headers: 
      { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        chat_id: chatId, 
        text, 
        parse_mode: "HTML",
        disable_web_page_preview: monitorConfig.telegramDisableWebPreview
      }),
      timeout: monitorConfig.telegramTimeoutMs
    });
    
    if (!response.ok) {
      throw new Error(`Telegram API error: ${response.status} ${response.statusText}`);
    }
    
    options?.progressCallback?.({ status: "success", timestamp: Date.now() });
    return true;
  } catch (error) {
    console.error("Failed to send Telegram message:", error);
    options?.progressCallback?.({ status: "failed", timestamp: Date.now(), retryCount: 1 });
    return false;
  }
}

/** Notify the admin chat ID (server alerts, cron, errors) */
export async function notify(text: string, options?: { progressCallback?: (progress: SendProgress) => void }) {
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (chatId) await sendTelegram(chatId, text, options);
}

/** Notify all users who have telegramEnabled=true (import prisma lazily to avoid circular deps) */
export async function notifyAll(text: string, options?: { progressCallback?: (progress: SendProgress) => void }) {
  const { default: prisma } = await import("@/lib/prisma");
  const prefs = await prisma.userPreferences.findMany({
    where: { telegramEnabled: true, telegramChatId: { not: null } },
    select: { telegramChatId: true },
  });
  
  // Send batch with progress tracking
  const promises = prefs.map(p => 
    sendTelegram(p.telegramChatId!, text, { 
      progressCallback: (progress) => {
        if (progress.status === "success") {
          console.log(`✅ Telegram message sent to user: ${p.telegramChatId}`);
        } else if (progress.status === "failed") {
          console.error(`❌ Failed to send Telegram message to user: ${p.telegramChatId}`);
        }
        options?.progressCallback?.(progress);
      }
    })
  );
  
  await Promise.all(promises);
}
