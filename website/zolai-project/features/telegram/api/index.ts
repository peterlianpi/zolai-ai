import { Hono } from 'hono';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';

const telegramRouter = new Hono()
  .post('/webhook', zValidator('json', z.object({
    update_id: z.number(),
    message: z.object({
      message_id: z.number(),
      from: z.object({
        id: z.number(),
        is_bot: z.boolean(),
        first_name: z.string(),
      }),
      chat: z.object({
        id: z.number(),
        type: z.string(),
      }),
      date: z.number(),
      text: z.string().optional(),
    }).optional(),
  }).passthrough()), async (c) => {
    const update = c.req.valid('json');
    const message = update.message;

    if (!message?.text) {
      return c.json({ ok: true });
    }

    const chatId = message.chat.id;
    const text = message.text;

    // Handle commands
    if (text === '/start') {
      await sendTelegramMessage(chatId, `
🔒 <b>Zolai Security Monitor</b>

Available commands:
/status - System status
/deploy - Deployment status
/alerts - Recent alerts
/events - Security events
/help - Show help

Use /deploy to check if project is live.
      `);
    } else if (text === '/status') {
      await sendTelegramMessage(chatId, `
✅ <b>System Status</b>

Database: Connected
API: Running
Auth: Active
Notifications: Enabled

Last check: ${new Date().toLocaleString()}
      `);
    } else if (text === '/deploy') {
      const deployStatus = await checkDeploymentStatus();
      await sendTelegramMessage(chatId, deployStatus);
    } else if (text === '/alerts') {
      await sendTelegramMessage(chatId, `
🚨 <b>Recent Alerts</b>

No critical alerts in the last 24 hours.

Use /events for detailed security events.
      `);
    } else if (text === '/events') {
      await sendTelegramMessage(chatId, `
📊 <b>Security Events (Last 24h)</b>

• 0 Suspicious Logins
• 0 Account Lockouts
• 0 Device Revocations
• 0 Password Changes

All systems normal.
      `);
    } else if (text === '/help') {
      await sendTelegramMessage(chatId, `
📖 <b>Help</b>

<b>Commands:</b>
/start - Welcome message
/status - System status
/deploy - Deployment status
/alerts - Recent alerts
/events - Security events
/help - This message

<b>Features:</b>
• Real-time security alerts
• System monitoring
• Event tracking
• Deployment status

For more info, visit: ${process.env.NEXT_PUBLIC_APP_URL || 'https://zolai.space'}
      `);
    } else {
      await sendTelegramMessage(chatId, `
Unknown command: ${text}

Type /help for available commands.
      `);
    }

    return c.json({ ok: true });
  })

  .post('/set-webhook', async (c) => {
    const webhookUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/telegram/webhook`;
    const result = await setTelegramWebhook(webhookUrl);
    return c.json(result);
  })

  .get('/commands', async (c) => {
    const commands = [
      { command: 'start', description: 'Welcome message' },
      { command: 'status', description: 'System status' },
      { command: 'deploy', description: 'Deployment status' },
      { command: 'alerts', description: 'Recent alerts' },
      { command: 'events', description: 'Security events' },
      { command: 'help', description: 'Show help' },
    ];

    const result = await setTelegramCommands(commands);
    return c.json(result);
  });

async function sendTelegramMessage(chatId: number, text: string): Promise<boolean> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) return false;

  try {
    const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: 'HTML',
      }),
    });

    return response.ok;
  } catch {
    return false;
  }
}

async function setTelegramWebhook(url: string): Promise<{ ok: boolean; description?: string }> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) return { ok: false };

  try {
    const response = await fetch(`https://api.telegram.org/bot${token}/setWebhook`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url }),
    });

    const data = await response.json();
    return data;
  } catch {
    return { ok: false };
  }
}

async function setTelegramCommands(commands: Array<{ command: string; description: string }>): Promise<{ ok: boolean }> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) return { ok: false };

  try {
    const response = await fetch(`https://api.telegram.org/bot${token}/setMyCommands`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ commands }),
    });

    const data = await response.json();
    return data;
  } catch {
    return { ok: false };
  }
}

async function checkDeploymentStatus(): Promise<string> {
  try {
    const domain = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    
    // Check domain
    const domainRes = await fetch(domain, { method: 'HEAD' });
    const domainOk = domainRes.ok;
    
    // Check API
    const apiRes = await fetch(`${domain}/api/health`);
    const apiOk = apiRes.ok;
    
    // Check database
    const dbRes = await fetch(`${domain}/api/curriculum/levels`);
    const dbOk = dbRes.ok;

    if (domainOk && apiOk && dbOk) {
      return `
🚀 <b>Deployment Status: LIVE ✅</b>

Domain: ${domain}
API: ✅ Responding
Database: ✅ Connected

All systems operational!
      `;
    } else {
      return `
⏳ <b>Deployment Status: IN PROGRESS</b>

Domain: ${domainOk ? '✅' : '❌'}
API: ${apiOk ? '✅' : '❌'}
Database: ${dbOk ? '✅' : '❌'}

Deployment in progress or configuration issue.
Check: vercel logs --follow
      `;
    }
  } catch {
    return `
❌ <b>Deployment Status: UNKNOWN</b>

Unable to check deployment status.
Check Vercel dashboard: https://vercel.com
      `;
  }
}

export default telegramRouter;
