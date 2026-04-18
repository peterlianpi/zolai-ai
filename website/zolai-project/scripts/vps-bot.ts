#!/usr/bin/env bun
// scripts/vps-bot.ts
// Standalone Telegram bot for VPS monitoring — runs independently of Next.js
// Handles: /status /restart /logs /deploy commands from Telegram

import { execSync } from "child_process";

const TOKEN = process.env.TELEGRAM_BOT_TOKEN!;
const ALLOWED_CHAT = process.env.TELEGRAM_CHAT_ID!;
const BASE = `https://api.telegram.org/bot${TOKEN}`;

if (!TOKEN || !ALLOWED_CHAT) {
  console.error("TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID required");
  process.exit(1);
}

async function send(chatId: string, text: string) {
  await fetch(`${BASE}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: "HTML" }),
  });
}

function run(cmd: string, maxLines = 20): string {
  try {
    return execSync(cmd, { timeout: 10000 })
      .toString()
      .trim()
      .split("\n")
      .slice(-maxLines)
      .join("\n");
  } catch (e) {
    return `Error: ${(e as Error).message.slice(0, 200)}`;
  }
}

async function handleCommand(chatId: string, text: string) {
  if (chatId !== ALLOWED_CHAT) {
    await send(chatId, "⛔ Unauthorized");
    return;
  }

  const cmd = text.split(" ")[0].toLowerCase();

  switch (cmd) {
    case "/status": {
      const uptime = run("uptime -p");
      const mem = run("free -h | awk 'NR==2{print $3\"/\"$2}'");
      const disk = run("df -h / | awk 'NR==2{print $3\"/\"$2\" (\"$5\")\"}'");
      const svc = run("systemctl is-active zolai");
      const http = await fetch("https://zolai.space/", { signal: AbortSignal.timeout(5000) })
        .then(r => `HTTP ${r.status}`)
        .catch(() => "DOWN");
      await send(chatId,
        `📊 <b>VPS Status</b>\n` +
        `🌐 Site: ${http}\n` +
        `⚙️ Service: ${svc}\n` +
        `⏱ Uptime: ${uptime}\n` +
        `💾 Memory: ${mem}\n` +
        `💿 Disk: ${disk}`
      );
      break;
    }

    case "/restart": {
      await send(chatId, "🔄 Restarting zolai service...");
      const result = run("sudo systemctl restart zolai && sleep 3 && systemctl is-active zolai");
      await send(chatId, `✅ Restart result: <code>${result}</code>`);
      break;
    }

    case "/logs": {
      const logs = run("journalctl -u zolai -n 30 --no-pager -o short");
      await send(chatId, `📋 <b>Last 30 log lines:</b>\n<pre>${logs.slice(0, 3500)}</pre>`);
      break;
    }

    case "/deploy": {
      await send(chatId, "🚀 Triggering deploy...\nThis will take ~2 min.");
      // Trigger via GitHub Actions API if token set, else run locally
      const ghToken = process.env.GITHUB_TOKEN;
      const ghRepo = process.env.GITHUB_REPO; // e.g. "username/zolai"
      if (ghToken && ghRepo) {
        const res = await fetch(`https://api.github.com/repos/${ghRepo}/actions/workflows/deploy.yml/dispatches`, {
          method: "POST",
          headers: { Authorization: `Bearer ${ghToken}`, "Content-Type": "application/json" },
          body: JSON.stringify({ ref: "master" }),
        });
        await send(chatId, res.ok ? "✅ Deploy triggered via GitHub Actions" : `❌ GitHub API error: ${res.status}`);
      } else {
        await send(chatId, "⚠️ Set GITHUB_TOKEN and GITHUB_REPO env vars to trigger remote deploy");
      }
      break;
    }

    case "/help":
    default:
      await send(chatId,
        `🤖 <b>Zolai VPS Bot</b>\n\n` +
        `/status — VPS + site health\n` +
        `/restart — restart Next.js service\n` +
        `/logs — last 30 log lines\n` +
        `/deploy — trigger GitHub Actions deploy`
      );
  }
}

// Long-polling loop
let offset = 0;
console.log("Zolai VPS bot started");

while (true) {
  try {
    const res = await fetch(`${BASE}/getUpdates?offset=${offset}&timeout=30`);
    const data = await res.json() as { ok: boolean; result: Array<{ update_id: number; message?: { chat: { id: number }; text?: string } }> };
    if (data.ok) {
      for (const update of data.result) {
        offset = update.update_id + 1;
        const msg = update.message;
        if (msg?.text) {
          await handleCommand(String(msg.chat.id), msg.text).catch(console.error);
        }
      }
    }
  } catch {
    await new Promise(r => setTimeout(r, 5000));
  }
}
