#!/usr/bin/env bun
// scripts/multi-vps-bot.ts — Multi-VPS Telegram Bot
// Runs locally, SSHes into each VPS to run commands
// Usage: bun scripts/multi-vps-bot.ts

import { execSync } from "child_process";

// ─── Config ──────────────────────────────────────────────────────────────────
const TOKEN = process.env.TELEGRAM_BOT_TOKEN!;
const ALLOWED_CHAT = process.env.TELEGRAM_CHAT_ID!;
const BASE = `https://api.telegram.org/bot${TOKEN}`;

if (!TOKEN || !ALLOWED_CHAT) {
  console.error("❌ TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID required");
  process.exit(1);
}

// ─── VPS Registry ────────────────────────────────────────────────────────────
interface VPS {
  id: string;       // short name used in commands
  label: string;    // display name
  host: string;     // SSH host alias (from ~/.ssh/config) or user@ip
  site: string;     // HTTP URL to health-check
  dir: string;      // app directory on VPS
  services: string[]; // systemd services to monitor
}

const VPS_LIST: VPS[] = [
  {
    id: "zolai",
    label: "Zolai Production",
    host: "zolai",                        // ~/.ssh/config alias
    site: "http://localhost:3000",
    dir: "/home/ubuntu/zolai",
    services: ["zolai-next", "zolai-chat"],
  },
  // Add more VPS here:
  // {
  //   id: "staging",
  //   label: "Zolai Staging",
  //   host: "zolai-staging",
  //   site: "http://localhost:3000",
  //   dir: "/home/ubuntu/zolai",
  //   services: ["zolai-next"],
  // },
];

// Active VPS selection per chat (defaults to first)
const selected: Record<string, string> = {};
function getVPS(chatId: string): VPS {
  const id = selected[chatId] ?? VPS_LIST[0].id;
  return VPS_LIST.find(v => v.id === id) ?? VPS_LIST[0];
}

// ─── Types ───────────────────────────────────────────────────────────────────
interface TgUpdate {
  update_id: number;
  message?: { chat: { id: number }; text?: string; from?: { first_name?: string }; message_id: number };
  callback_query?: { id: string; data?: string; message?: { chat: { id: number }; message_id: number } };
}
interface InlineKeyboard {
  inline_keyboard: Array<Array<{ text: string; callback_data: string }>>;
}

// ─── SSH Runner ──────────────────────────────────────────────────────────────
function ssh(vps: VPS, cmd: string, maxLines = 20): string {
  try {
    return execSync(`ssh -o ConnectTimeout=8 ${vps.host} '${cmd.replace(/'/g, `'"'"'`)}'`, {
      timeout: 15000, encoding: "utf-8", shell: "/bin/bash",
    }).trim().split("\n").slice(-maxLines).join("\n") || "(no output)";
  } catch (e) {
    const err = e as { stdout?: string; message?: string };
    return err.stdout?.trim() || `SSH Error: ${err.message?.slice(0, 200) ?? "unknown"}`;
  }
}

// ─── Telegram API ─────────────────────────────────────────────────────────────
async function send(chatId: string | number, text: string, keyboard?: InlineKeyboard) {
  const body: Record<string, unknown> = { chat_id: chatId, text, parse_mode: "HTML", disable_web_page_preview: true };
  if (keyboard) body.reply_markup = keyboard;
  const res = await fetch(`${BASE}/sendMessage`, {
    method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
  });
  if (!res.ok) console.error(`Send failed ${res.status}: ${(await res.text()).slice(0, 200)}`);
}

async function editMessage(chatId: string | number, messageId: number, text: string, keyboard?: InlineKeyboard) {
  const body: Record<string, unknown> = { chat_id: chatId, message_id: messageId, text, parse_mode: "HTML", disable_web_page_preview: true };
  if (keyboard) body.reply_markup = keyboard;
  const res = await fetch(`${BASE}/editMessageText`, {
    method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({})) as { description?: string };
    if (!err.description?.includes("message is not modified")) await send(chatId, text, keyboard);
  }
}

async function answerCallback(id: string) {
  await fetch(`${BASE}/answerCallbackQuery`, {
    method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ callback_query_id: id }),
  });
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
function esc(s: string) { return s.replace(/[<>&]/g, c => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;" }[c] ?? c)); }
function divider() { return "\n━━━━━━━━━━━━━━━━━━━━━━\n"; }
function section(icon: string, title: string) { return `\n${icon} <b>${title}</b>\n`; }
function row(label: string, value: string) { return `  ${label}: ${value}\n`; }
function ts() { return new Date().toLocaleString("en-GB", { timeZone: "Asia/Yangon", hour12: false }); }

type Reply = (text: string, kb?: InlineKeyboard) => Promise<void>;
const replySend = (chatId: number | string): Reply => (t, kb) => send(chatId, t, kb);
const replyEdit = (chatId: number, msgId: number): Reply => (t, kb) => editMessage(chatId, msgId, t, kb);

// ─── Menus ───────────────────────────────────────────────────────────────────
function vpsMenu(): InlineKeyboard {
  return {
    inline_keyboard: [
      VPS_LIST.map(v => ({ text: v.label, callback_data: `select_${v.id}` })),
      [{ text: "🔙 Back", callback_data: "menu" }],
    ],
  };
}

const MAIN_MENU: InlineKeyboard = {
  inline_keyboard: [
    [{ text: "📊 Status", callback_data: "status" }, { text: "🔍 Health", callback_data: "health" }],
    [{ text: "🗄️ Database", callback_data: "db_menu" }, { text: "🤖 AI", callback_data: "ai_test" }],
    [{ text: "📋 Logs", callback_data: "logs" }, { text: "❌ Errors", callback_data: "errors" }],
    [{ text: "🔄 Restart", callback_data: "restart" }, { text: "🚫 Blocked IPs", callback_data: "blocked" }],
    [{ text: "🖥️ Switch VPS", callback_data: "switch_vps" }, { text: "❓ Help", callback_data: "help" }],
  ],
};

const DB_MENU: InlineKeyboard = {
  inline_keyboard: [
    [{ text: "📊 Stats", callback_data: "db_stats" }, { text: "📖 Vocab", callback_data: "db_vocab" }],
    [{ text: "📜 Bible", callback_data: "db_bible" }, { text: "📝 Wiki", callback_data: "db_wiki" }],
    [{ text: "🔙 Back", callback_data: "menu" }],
  ],
};

// ─── Handlers ────────────────────────────────────────────────────────────────
async function handleStatus(chatId: string, vps: VPS, reply: Reply) {
  await reply(`⏳ Checking <b>${vps.label}</b>...`, MAIN_MENU);
  await new Promise(r => setImmediate(r));

  const uptime = ssh(vps, "uptime -p");
  const mem = ssh(vps, "free -h | awk 'NR==2{print $3\"/\"$2}'");
  const disk = ssh(vps, "df -h / | awk 'NR==2{print $3\"/\"$2\" (\"$5\")\"}'");

  let services = "";
  for (const svc of vps.services) {
    const s = ssh(vps, `systemctl is-active ${svc} 2>/dev/null || echo inactive`);
    services += row(svc, s === "active" ? "✅ active" : `⚠️ ${s}`);
  }

  let http = "⏳";
  try {
    const res = await fetch(`http://${vps.host === "zolai" ? "13.115.84.100" : vps.host}:3000/`, { signal: AbortSignal.timeout(5000) });
    http = res.ok ? `✅ ${res.status}` : `⚠️ ${res.status}`;
  } catch { http = "❌ DOWN"; }

  await send(chatId,
    section("📊", `Status — ${vps.label}`) +
    row("🌐 Site", http) + services +
    row("⏱ Uptime", uptime) + row("💾 Memory", mem) + row("💿 Disk", disk) +
    divider() + `<i>${ts()}</i>`,
    MAIN_MENU
  );
}

async function handleLogs(chatId: string, vps: VPS, reply: Reply) {
  await reply("📋 Fetching logs...", MAIN_MENU);
  await new Promise(r => setImmediate(r));
  const logs = ssh(vps, "journalctl -u zolai-next -n 30 --no-pager -o short 2>/dev/null");
  await send(chatId, section("📋", `Logs — ${vps.label}`) + `<pre>${esc(logs.slice(0, 3500))}</pre>` + divider() + `<i>${ts()}</i>`, MAIN_MENU);
}

async function handleErrors(chatId: string, vps: VPS, reply: Reply) {
  await reply("❌ Fetching errors...", MAIN_MENU);
  await new Promise(r => setImmediate(r));
  const errors = ssh(vps, "journalctl -u zolai-next -p err -n 20 --no-pager -o short 2>/dev/null || echo 'No errors'");
  await send(chatId, section("❌", `Errors — ${vps.label}`) + `<pre>${esc(errors.slice(0, 3500))}</pre>` + divider() + `<i>${ts()}</i>`, MAIN_MENU);
}

async function handleRestart(chatId: string, vps: VPS, reply: Reply) {
  await reply(`🔄 Restarting <b>${vps.label}</b>...`, MAIN_MENU);
  await new Promise(r => setImmediate(r));
  let msg = section("🔄", `Restart — ${vps.label}`);
  for (const svc of vps.services) {
    const r = ssh(vps, `sudo systemctl restart ${svc} && sleep 2 && systemctl is-active ${svc}`);
    msg += row(svc, r === "active" ? "✅ active" : `⚠️ ${r}`);
  }
  await send(chatId, msg + divider() + `<i>${ts()}</i>`, MAIN_MENU);
}

async function handleBlocked(chatId: string, vps: VPS) {
  const rules = ssh(vps, "sudo ufw status 2>/dev/null | grep DENY | head -20");
  await send(chatId,
    section("🚫", `Blocked IPs — ${vps.label}`) +
    `<pre>${esc(rules.trim() || "No blocked IPs")}</pre>` +
    divider() + `<i>Use /unblock &lt;ip&gt;</i>`,
    MAIN_MENU
  );
}

async function handleDbStats(chatId: string, vps: VPS, reply: Reply) {
  await reply("🗄️ Querying...", DB_MENU);
  const [dictRaw, statsRaw] = await Promise.all([
    fetch(`http://13.115.84.100:3000/api/dictionary/stats`, { signal: AbortSignal.timeout(8000) })
      .then(r => r.json()).catch(() => null),
    fetch(`http://13.115.84.100:3000/api/zolai/stats`, { signal: AbortSignal.timeout(8000) })
      .then(r => r.json()).catch(() => null),
  ]);
  let msg = section("🗄️", `DB Stats — ${vps.label}`);
  if (dictRaw?.success) {
    msg += row("📖 Vocab", `${dictRaw.data.total.toLocaleString()} (${dictRaw.data.confirmed.toLocaleString()} confirmed)`);
  }
  if (statsRaw?.success) {
    for (const s of statsRaw.data) msg += row(`  ${s.label}`, `${Number(s.value).toLocaleString()} ${s.unit}`);
  }
  await send(chatId, msg + divider() + `<i>${ts()}</i>`, DB_MENU);
}

// ─── Command Router ───────────────────────────────────────────────────────────
async function handleCommand(chatId: string, text: string) {
  if (chatId !== ALLOWED_CHAT) { await send(chatId, "⛔ Unauthorized"); return; }
  const vps = getVPS(chatId);
  const [cmd, arg] = text.trim().split(" ");

  switch (cmd.toLowerCase()) {
    case "/start":
    case "/menu":
      return send(chatId,
        `🖥️ <b>Multi-VPS Bot</b>\n\nActive: <b>${vps.label}</b>\n\nManaging ${VPS_LIST.length} server(s)`,
        MAIN_MENU
      );
    case "/status": return handleStatus(chatId, vps, replySend(chatId));
    case "/logs": return handleLogs(chatId, vps, replySend(chatId));
    case "/errors": return handleErrors(chatId, vps, replySend(chatId));
    case "/restart": return handleRestart(chatId, vps, replySend(chatId));
    case "/blocked": return handleBlocked(chatId, vps);
    case "/unblock":
      if (!arg) return send(chatId, "Usage: /unblock &lt;ip&gt;");
      const r = ssh(vps, `sudo ufw delete deny from ${arg} 2>&1`);
      return send(chatId, `🔓 Unblocked ${arg} on ${vps.label}\n<pre>${esc(r)}</pre>`);
    case "/vps":
      return send(chatId, `🖥️ <b>Select VPS</b>\n\nActive: <b>${vps.label}</b>`, vpsMenu());
    case "/help":
      return send(chatId,
        section("❓", "Commands") +
        `/menu — Main menu\n/status — Server status\n/logs — Recent logs\n/errors — Error logs\n` +
        `/restart — Restart services\n/blocked — Blocked IPs\n/unblock &lt;ip&gt; — Unblock IP\n` +
        `/vps — Switch active VPS\n\n` +
        `<b>Active VPS:</b> ${vps.label}\n` +
        `<b>All VPS:</b> ${VPS_LIST.map(v => v.label).join(", ")}`,
        MAIN_MENU
      );
    default:
      return send(chatId, `❓ Unknown: ${esc(cmd)}\nUse /help`);
  }
}

async function handleCallback(chatId: number, messageId: number, data: string, callbackId: string) {
  await answerCallback(callbackId);
  if (String(chatId) !== ALLOWED_CHAT) return;

  const id = String(chatId);
  const vps = getVPS(id);
  const reply = replyEdit(chatId, messageId);

  // VPS selection
  if (data.startsWith("select_")) {
    const newId = data.replace("select_", "");
    const newVps = VPS_LIST.find(v => v.id === newId);
    if (newVps) {
      selected[id] = newId;
      return reply(`✅ Switched to <b>${newVps.label}</b>`, MAIN_MENU);
    }
  }

  switch (data) {
    case "menu": return reply(`🖥️ <b>Multi-VPS Bot</b>\n\nActive: <b>${vps.label}</b>`, MAIN_MENU);
    case "switch_vps": return reply(`🖥️ <b>Select VPS</b>\n\nActive: <b>${vps.label}</b>`, vpsMenu());
    case "status": return handleStatus(id, vps, reply);
    case "health": return handleStatus(id, vps, reply);
    case "logs": return handleLogs(id, vps, reply);
    case "errors": return handleErrors(id, vps, reply);
    case "restart": return handleRestart(id, vps, reply);
    case "blocked": return handleBlocked(id, vps);
    case "db_menu": return reply(`🗄️ <b>Database — ${vps.label}</b>`, DB_MENU);
    case "db_stats": return handleDbStats(id, vps, reply);
    case "db_vocab":
    case "db_bible":
    case "db_wiki": return handleDbStats(id, vps, reply);
    case "ai_test": return reply(`🤖 AI: ${process.env.ZOLAI_API_URL ?? "not configured"}`, MAIN_MENU);
    case "help": return reply(
      section("❓", "Commands") +
      `/status /logs /errors /restart /blocked /vps\n` +
      `Active: <b>${vps.label}</b>`,
      MAIN_MENU
    );
  }
}

// ─── Background Monitor ───────────────────────────────────────────────────────
const prevState: Record<string, boolean> = {};
const blockedIPs = new Set<string>();

async function monitor() {
  for (const vps of VPS_LIST) {
    const alerts: string[] = [];

    for (const svc of vps.services) {
      const key = `${vps.id}:${svc}`;
      const active = ssh(vps, `systemctl is-active ${svc} 2>/dev/null`) === "active";
      if (prevState[key] === true && !active) alerts.push(`🔴 [${vps.label}] <b>${svc}</b> DOWN`);
      else if (prevState[key] === false && active) alerts.push(`🟢 [${vps.label}] <b>${svc}</b> recovered`);
      prevState[key] = active;
    }

    // Brute-force detection
    const topIPs = ssh(vps, "tail -1000 /var/log/nginx/access.log 2>/dev/null | awk '{print $1}' | sort | uniq -c | sort -rn | head -5");
    for (const line of topIPs.split("\n").filter(Boolean)) {
      const m = line.trim().match(/^\s*(\d+)\s+(\S+)$/);
      if (!m) continue;
      const [, count, ip] = m;
      if (parseInt(count) > 100 && !blockedIPs.has(`${vps.id}:${ip}`) && !ip.startsWith("172.") && !ip.startsWith("127.")) {
        ssh(vps, `sudo ufw deny from ${ip} 2>&1`);
        blockedIPs.add(`${vps.id}:${ip}`);
        alerts.push(`🚫 [${vps.label}] Blocked <b>${ip}</b> (${count} req/min)`);
      }
    }

    if (alerts.length > 0) {
      await send(ALLOWED_CHAT, `🚨 <b>Alert — ${ts()}</b>\n\n` + alerts.join("\n"));
    }
  }
}

setTimeout(async () => {
  for (const vps of VPS_LIST) {
    for (const svc of vps.services) {
      prevState[`${vps.id}:${svc}`] = ssh(vps, `systemctl is-active ${svc} 2>/dev/null`) === "active";
    }
  }
  console.log(`🔍 Monitor started for ${VPS_LIST.length} VPS`);
  setInterval(() => monitor().catch(console.error), 60_000);
}, 30_000);

// ─── Main Loop ────────────────────────────────────────────────────────────────
let offset = 0;
console.log(`🤖 Multi-VPS Bot started (${VPS_LIST.length} servers)`);
console.log(`📡 Servers: ${VPS_LIST.map(v => v.label).join(", ")}`);

while (true) {
  try {
    const res = await fetch(`${BASE}/getUpdates?offset=${offset}&timeout=30&allowed_updates=["message","callback_query"]`);
    const data = await res.json() as { ok: boolean; result: TgUpdate[] };
    if (data.ok) {
      for (const update of data.result) {
        offset = update.update_id + 1;
        if (update.message?.text) {
          await handleCommand(String(update.message.chat.id), update.message.text).catch(console.error);
        }
        if (update.callback_query?.data && update.callback_query.message) {
          await handleCallback(
            update.callback_query.message.chat.id,
            update.callback_query.message.message_id,
            update.callback_query.data,
            update.callback_query.id
          ).catch(console.error);
        }
      }
    }
  } catch (e) {
    console.error("Polling error:", e);
    await new Promise(r => setTimeout(r, 5000));
  }
}
