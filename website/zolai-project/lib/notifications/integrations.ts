/**
 * Third-Party Integration Notification Service
 * Send notifications to Discord, Slack, Telegram, etc.
 */

export interface DiscordNotificationOptions {
  webhookUrl: string;
  title: string;
  description: string;
  color?: number;
  fields?: Array<{ name: string; value: string; inline?: boolean }>;
  thumbnail?: string;
  url?: string;
}

export interface SlackNotificationOptions {
  webhookUrl: string;
  text: string;
  blocks?: Array<Record<string, unknown>>;
  attachments?: Array<Record<string, unknown>>;
}

export interface TelegramNotificationOptions {
  botToken: string;
  chatId: string;
  message: string;
  parseMode?: "HTML" | "Markdown" | "MarkdownV2";
  buttons?: Array<{ text: string; url: string }>;
}

/**
 * Send notification to Discord webhook
 */
export async function sendDiscordNotification(
  options: DiscordNotificationOptions
): Promise<{ success: boolean; error?: string }> {
  try {
    const embed = {
      title: options.title,
      description: options.description,
      color: options.color || 3898765, // Default cyan color
      fields: options.fields || [],
      thumbnail: options.thumbnail ? { url: options.thumbnail } : undefined,
      url: options.url,
      timestamp: new Date().toISOString(),
    };

    const response = await fetch(options.webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ embeds: [embed] }),
    });

    if (!response.ok) {
      return { success: false, error: `Discord returned ${response.status}` };
    }

    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("[Discord] Notification error:", message);
    return { success: false, error: message };
  }
}

/**
 * Send notification to Slack webhook
 */
export async function sendSlackNotification(
  options: SlackNotificationOptions
): Promise<{ success: boolean; error?: string }> {
  try {
    const payload: Record<string, unknown> = {
      text: options.text,
    };

    if (options.blocks) {
      payload.blocks = options.blocks;
    }

    if (options.attachments) {
      payload.attachments = options.attachments;
    }

    const response = await fetch(options.webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      return { success: false, error: `Slack returned ${response.status}` };
    }

    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("[Slack] Notification error:", message);
    return { success: false, error: message };
  }
}

/**
 * Send notification to Telegram bot
 */
export async function sendTelegramNotification(
  options: TelegramNotificationOptions
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    let messageText = options.message;

    // Add buttons if provided
    if (options.buttons && options.buttons.length > 0) {
      messageText += "\n\n";
      messageText += options.buttons
        .map((btn) => `[${btn.text}](${btn.url})`)
        .join(" | ");
    }

    const params = new URLSearchParams({
      chat_id: options.chatId,
      text: messageText,
      parse_mode: options.parseMode || "HTML",
      disable_web_page_preview: "true",
    });

    const response = await fetch(
      `https://api.telegram.org/bot${options.botToken}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: params.toString(),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      return { success: false, error: error.description || "Telegram error" };
    }

    const data = (await response.json()) as { result: { message_id: number } };
    return { success: true, messageId: String(data.result.message_id) };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("[Telegram] Notification error:", message);
    return { success: false, error: message };
  }
}

/**
 * Send rich Slack notification with blocks
 */
export async function sendSlackBlockNotification(
  webhookUrl: string,
  title: string,
  sections: Array<{ title: string; text: string }>
): Promise<{ success: boolean; error?: string }> {
  try {
    const blocks = [
      {
        type: "header",
        text: {
          type: "plain_text",
          text: title,
        },
      },
      ...sections.map((section) => ({
        type: "section",
        text: {
          type: "mrkdwn",
          text: `*${section.title}*\n${section.text}`,
        },
      })),
      {
        type: "divider",
      },
    ];

    return await sendSlackNotification({ webhookUrl, text: title, blocks });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return { success: false, error: message };
  }
}

/**
 * Send rich Discord notification with multiple fields
 */
export async function sendDiscordEmbedNotification(
  webhookUrl: string,
  title: string,
  description: string,
  fields: Array<{ name: string; value: string; inline?: boolean }>,
  color = 3898765
): Promise<{ success: boolean; error?: string }> {
  return sendDiscordNotification({
    webhookUrl,
    title,
    description,
    fields,
    color,
  });
}

/**
 * Send bulk notifications to multiple platforms
 */
export async function sendMultiPlatformNotification(
  title: string,
  message: string,
  options: {
    discord?: { webhookUrl: string };
    slack?: { webhookUrl: string };
    telegram?: { botToken: string; chatId: string };
  }
): Promise<{
  success: boolean;
  discord: boolean;
  slack: boolean;
  telegram: boolean;
}> {
  const results = await Promise.allSettled([
    options.discord
      ? sendDiscordNotification({
          webhookUrl: options.discord.webhookUrl,
          title,
          description: message,
        })
      : Promise.resolve({ success: false }),
    options.slack
      ? sendSlackNotification({
          webhookUrl: options.slack.webhookUrl,
          text: `*${title}*\n${message}`,
        })
      : Promise.resolve({ success: false }),
    options.telegram
      ? sendTelegramNotification({
          botToken: options.telegram.botToken,
          chatId: options.telegram.chatId,
          message: `<b>${title}</b>\n${message}`,
        })
      : Promise.resolve({ success: false }),
  ]);

  const [discordResult, slackResult, telegramResult] = results;

  return {
    success:
      (discordResult.status === "fulfilled" && discordResult.value.success) ||
      (slackResult.status === "fulfilled" && slackResult.value.success) ||
      (telegramResult.status === "fulfilled" && telegramResult.value.success),
    discord: discordResult.status === "fulfilled" && discordResult.value.success,
    slack: slackResult.status === "fulfilled" && slackResult.value.success,
    telegram: telegramResult.status === "fulfilled" && telegramResult.value.success,
  };
}
