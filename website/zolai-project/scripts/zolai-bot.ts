#!/usr/bin/env bun
// scripts/zolai-bot.ts — Zolai Platform Telegram Bot
// Multi-agent monitoring, ops, AI, DB, curriculum, language data
// Commands: /start /help /menu /status /ping /test /ai /db /users
//           /logs /errors /restart /deploy /cache /agents
//           /vocab /wiki /bible /curriculum /network

import { execSync } from "child_process";

// ─── Config ──────────────────────────────────────────────────────────────────
const TOKEN = process.env.TELEGRAM_BOT_TOKEN!;
const ALLOWED_CHAT = process.env.TELEGRAM_CHAT_ID!;
const BASE = `https://api.telegram.org/bot${TOKEN}`;
const SITE = "http://localhost:3000";
const VPS_DIR = "/home/ubuntu/zolai";
const SERVICES = ["zolai-next", "zolai-chat", "zolai-bot"];

if (!TOKEN || !ALLOWED_CHAT) {
  console.error("❌ TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID required");
  process.exit(1);
}

// ─── Types ───────────────────────────────────────────────────────────────────
interface TgUpdate {
  update_id: number;
  message?: { 
    chat: { id: number }; 
    text?: string; 
    from?: { first_name?: string };
    message_id: number;
  };
  callback_query?: { 
    id: string; 
    data?: string; 
    message?: { 
      chat: { id: number };
      message_id: number;
    };
  };
}

interface InlineKeyboard {
  inline_keyboard: Array<Array<{ text: string; callback_data: string }>>;
}

// ─── Telegram API ─────────────────────────────────────────────────────────────
async function send(chatId: string | number, text: string, keyboard?: InlineKeyboard) {
  const body: Record<string, unknown> = {
    chat_id: chatId,
    text,
    parse_mode: "HTML",
    disable_web_page_preview: true,
  };
  if (keyboard) body.reply_markup = keyboard;
  const res = await fetch(`${BASE}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.text();
    console.error(`Send failed ${res.status}: ${err.slice(0, 200)}`);
  }
}

async function editMessage(chatId: string | number, messageId: number, text: string, keyboard?: InlineKeyboard) {
  const body: Record<string, unknown> = {
    chat_id: chatId,
    message_id: messageId,
    text,
    parse_mode: "HTML",
    disable_web_page_preview: true,
  };
  if (keyboard) body.reply_markup = keyboard;
  const res = await fetch(`${BASE}/editMessageText`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  // 400 = message not modified (same content) — fall back to new message
  if (!res.ok) {
    const err = await res.json().catch(() => ({})) as { description?: string };
    if (err.description?.includes("message is not modified")) return; // silent — no change needed
    await send(chatId, text, keyboard); // send new message on other errors
  }
}

async function answerCallback(callbackId: string, text?: string) {
  const res = await fetch(`${BASE}/answerCallbackQuery`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ callback_query_id: callbackId, text }),
  });
  if (!res.ok) console.error(`Answer callback failed: ${res.status}`);
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
function run(cmd: string, maxLines = 20): string {
  try {
    return execSync(cmd, { timeout: 8000, encoding: "utf-8", shell: "/bin/bash" })
      .trim().split("\n").slice(-maxLines).join("\n") || "(no output)";
  } catch (e) {
    const err = e as { stdout?: string; message?: string };
    return err.stdout?.trim() || `Error: ${err.message?.slice(0, 200) ?? "unknown"}`;
  }
}

function esc(s: string): string {
  return s.replace(/[<>&]/g, c => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;" }[c] ?? c));
}

function divider() { return "\n━━━━━━━━━━━━━━━━━━━━━━\n"; }
function section(icon: string, title: string) { return `\n${icon} <b>${title}</b>\n`; }
function row(label: string, value: string) { return `  ${label}: ${value}\n`; }
function ts() { return new Date().toLocaleString("en-GB", { timeZone: "Asia/Yangon", hour12: false }); }

// ─── DB via API (Neon is remote — shell DB_CMD doesn't return results) ────────
async function apiGet(path: string): Promise<string> {
  try {
    const res = await fetch(`${SITE}${path}`, { signal: AbortSignal.timeout(8000) });
    if (!res.ok) return `HTTP ${res.status}`;
    const data = await res.json();
    return JSON.stringify(data, null, 2).slice(0, 1000);
  } catch (e) {
    return `Error: ${(e as Error).message}`;
  }
}

// ─── Menus ───────────────────────────────────────────────────────────────────
const MAIN_MENU: InlineKeyboard = {
  inline_keyboard: [
    [{ text: "📊 Status", callback_data: "status" }, { text: "🔍 Health", callback_data: "health" }],
    [{ text: "🗄️ Database", callback_data: "db_menu" }, { text: "🤖 AI Agent", callback_data: "ai_menu" }],
    [{ text: "📚 Content", callback_data: "content_menu" }, { text: "⚙️ System", callback_data: "system_menu" }],
    [{ text: "📈 Analytics", callback_data: "analytics" }, { text: "🔐 Security", callback_data: "security" }],
    [{ text: "🚀 Deploy", callback_data: "deploy" }, { text: "❓ Help", callback_data: "help" }],
  ],
};

const DB_MENU: InlineKeyboard = {
  inline_keyboard: [
    [{ text: "📊 Stats", callback_data: "db_stats" }, { text: "👥 Users", callback_data: "db_users" }],
    [{ text: "📖 Dictionary", callback_data: "db_vocab" }, { text: "📚 Curriculum", callback_data: "db_curriculum" }],
    [{ text: "📜 Bible", callback_data: "db_bible" }, { text: "📝 Wiki", callback_data: "db_wiki" }],
    [{ text: "🔙 Back", callback_data: "menu" }],
  ],
};

const AI_MENU: InlineKeyboard = {
  inline_keyboard: [
    [{ text: "🧠 Test AI", callback_data: "ai_test" }, { text: "📊 AI Stats", callback_data: "ai_stats" }],
    [{ text: "🔑 API Keys", callback_data: "ai_keys" }, { text: "🎯 Models", callback_data: "ai_models" }],
    [{ text: "🔙 Back", callback_data: "menu" }],
  ],
};

const CONTENT_MENU: InlineKeyboard = {
  inline_keyboard: [
    [{ text: "📖 Dictionary", callback_data: "content_vocab" }, { text: "📚 Curriculum", callback_data: "content_curriculum" }],
    [{ text: "📜 Bible", callback_data: "content_bible" }, { text: "📝 Wiki", callback_data: "content_wiki" }],
    [{ text: "🎓 Lessons", callback_data: "content_lessons" }, { text: "🔊 Audio", callback_data: "content_audio" }],
    [{ text: "🔙 Back", callback_data: "menu" }],
  ],
};

const SYSTEM_MENU: InlineKeyboard = {
  inline_keyboard: [
    [{ text: "📋 Logs", callback_data: "logs" }, { text: "❌ Errors", callback_data: "errors" }],
    [{ text: "🔄 Restart", callback_data: "restart" }, { text: "🗑️ Cache", callback_data: "cache" }],
    [{ text: "🌐 Network", callback_data: "network" }, { text: "💾 Disk", callback_data: "disk" }],
    [{ text: "🔙 Back", callback_data: "menu" }],
  ],
};

// ─── Command Handlers ────────────────────────────────────────────────────────
// Commands send new messages; callbacks edit existing ones
type Reply = (text: string, kb?: InlineKeyboard) => Promise<void>;

function replySend(chatId: number | string): Reply {
  return (text, kb) => send(chatId, text, kb);
}
function replyEdit(chatId: number, msgId: number): Reply {
  return (text, kb) => editMessage(chatId, msgId, text, kb);
}

async function handleStart(chatId: number, name?: string) {
  const greeting = name ? `Hi ${esc(name)}! 👋` : "Welcome! 👋";
  await send(chatId,
    `${greeting}\n\n` +
    `🤖 <b>Zolai Platform Bot</b>\n` +
    `Multi-agent monitoring & management system\n\n` +
    `<b>Quick Actions:</b>\n` +
    `• /menu — Main menu\n` +
    `• /status — System status\n` +
    `• /help — All commands\n\n` +
    `<i>Time: ${ts()}</i>`,
    MAIN_MENU
  );
}

async function handleMenu(reply: Reply) {
  await reply(`🎛️ <b>Main Menu</b>\n\nSelect an option below:`, MAIN_MENU);
}

async function handleStatus(chatId: number | string, messageId?: number) {
  const reply = messageId ? replyEdit(chatId as number, messageId) : replySend(chatId);
  const uptime = run("uptime -p");
  const mem = run("free -h | awk 'NR==2{print $3\"/\"$2}'");
  const disk = run("df -h / | awk 'NR==2{print $3\"/\"$2\" (\"$5\")\"}'");

  let services = "";
  for (const svc of SERVICES) {
    const status = run(`systemctl is-active ${svc} 2>/dev/null || echo 'inactive'`);
    services += row(svc, status === "active" ? "✅ active" : `⚠️ ${status}`);
  }

  let http = "⏳";
  try {
    const res = await fetch(SITE, { signal: AbortSignal.timeout(5000) });
    http = res.ok ? `✅ ${res.status}` : `⚠️ ${res.status}`;
  } catch { http = "❌ DOWN"; }

  await reply(
    section("📊", "System Status") +
    row("🌐 Site", http) + services +
    row("⏱ Uptime", uptime) + row("💾 Memory", mem) + row("💿 Disk", disk) +
    divider() + `<i>${ts()}</i>`,
    MAIN_MENU
  );
}

async function handleHealth(chatId: number | string, messageId?: number) {
  const reply = messageId ? replyEdit(chatId as number, messageId) : replySend(chatId);
  const checks = [
    { name: "Next.js", url: `${SITE}/` },
    { name: "API /dictionary/stats", url: `${SITE}/api/dictionary/stats` },
    { name: "API /curriculum/levels", url: `${SITE}/api/curriculum/levels` },
  ];
  let msg = section("🔍", "Health Check");
  for (const c of checks) {
    try {
      const res = await fetch(c.url, { signal: AbortSignal.timeout(5000) });
      msg += row(c.name, res.ok ? `✅ ${res.status}` : `⚠️ ${res.status}`);
    } catch { msg += row(c.name, "❌ Failed"); }
  }
  await reply(msg + divider() + `<i>${ts()}</i>`, MAIN_MENU);
}

async function handleDbStats(chatId: number | string, messageId?: number) {
  const reply = messageId ? replyEdit(chatId as number, messageId) : replySend(chatId);
  const [dictRaw, statsRaw] = await Promise.all([
    apiGet("/api/dictionary/stats"),
    apiGet("/api/zolai/stats"),
  ]);
  let msg = section("🗄️", "Database Stats");
  try {
    const dict = JSON.parse(dictRaw);
    if (dict.success) {
      msg += row("📖 Vocab total", String(dict.data.total));
      msg += row("   Confirmed", String(dict.data.confirmed));
    }
    const stats = JSON.parse(statsRaw);
    if (stats.success) {
      for (const s of stats.data) msg += row(`  ${s.label}`, `${Number(s.value).toLocaleString()} ${s.unit}`);
    }
  } catch { msg += `<pre>${esc(dictRaw.slice(0, 500))}</pre>`; }
  await reply(msg + divider() + `<i>${ts()}</i>`, DB_MENU);
}

async function handleDbUsers(chatId: number | string, messageId?: number) {
  const reply = messageId ? replyEdit(chatId as number, messageId) : replySend(chatId);
  const result = await apiGet("/api/zolai/stats");
  await reply(section("👥", "Platform Stats") + `<pre>${esc(result)}</pre>` + divider() + `<i>${ts()}</i>`, DB_MENU);
}

async function handleAiTest(chatId: number | string, messageId?: number) {
  const reply = messageId ? replyEdit(chatId as number, messageId) : replySend(chatId);
  await reply("🧠 Testing AI (direct LLM)...", AI_MENU);
  const llmUrl = process.env.ZOLAI_API_URL ?? "http://13.115.84.100:18789/chat";
  try {
    const res = await fetch(llmUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: [{ role: "user", content: "Lungdam" }] }),
      signal: AbortSignal.timeout(10000),
    });
    const data = await res.json();
    await reply(
      section("🤖", "AI Test") +
      row("LLM URL", llmUrl) +
      row("Status", res.ok ? `✅ ${res.status}` : `⚠️ ${res.status}`) +
      `\n<pre>${esc(JSON.stringify(data, null, 2).slice(0, 500))}</pre>` +
      divider() + `<i>${ts()}</i>`,
      AI_MENU
    );
  } catch (e) {
    await reply(section("❌", "AI Test Failed") + `<pre>${esc((e as Error).message)}</pre>` + divider() + `<i>${ts()}</i>`, AI_MENU);
  }
}

async function handleLogs(chatId: number | string, messageId?: number) {
  const reply = messageId ? replyEdit(chatId as number, messageId) : replySend(chatId);
  await reply("📋 Fetching logs...", SYSTEM_MENU);
  await new Promise(r => setImmediate(r));
  const logs = run("journalctl -u zolai-next -n 30 --no-pager -o short 2>/dev/null");
  await send(chatId, section("📋", "zolai-next logs") + `<pre>${esc(logs.slice(0, 3500))}</pre>` + divider() + `<i>${ts()}</i>`, SYSTEM_MENU);
}

async function handleErrors(chatId: number | string, messageId?: number) {
  const reply = messageId ? replyEdit(chatId as number, messageId) : replySend(chatId);
  await reply("❌ Fetching errors...", SYSTEM_MENU);
  await new Promise(r => setImmediate(r));
  const errors = run("journalctl -u zolai-next -p err -n 20 --no-pager -o short 2>/dev/null || echo 'No errors'");
  await send(chatId, section("❌", "zolai-next errors") + `<pre>${esc(errors.slice(0, 3500))}</pre>` + divider() + `<i>${ts()}</i>`, SYSTEM_MENU);
}

async function handleRestart(chatId: number | string, messageId?: number) {
  const reply = messageId ? replyEdit(chatId as number, messageId) : replySend(chatId);
  await reply("🔄 Restarting...", SYSTEM_MENU);
  let msg = section("🔄", "Restart Result");
  for (const svc of ["zolai-next", "zolai-chat"]) {
    const result = run(`sudo systemctl restart ${svc} && sleep 2 && systemctl is-active ${svc}`);
    msg += row(svc, result === "active" ? "✅ active" : `⚠️ ${result}`);
  }
  await reply(msg + divider() + `<i>${ts()}</i>`, SYSTEM_MENU);
}

async function handleDeploy(chatId: number | string, messageId?: number) {
  const reply = messageId ? replyEdit(chatId as number, messageId) : replySend(chatId);
  try {
    const res = await fetch(SITE, { signal: AbortSignal.timeout(5000) });
    await reply(
      section("🚀", "Deployment Status") +
      row("Site", SITE) + row("Status", res.ok ? `✅ HTTP ${res.status}` : `⚠️ ${res.status}`) +
      divider() + `<i>${ts()}</i>`,
      MAIN_MENU
    );
  } catch {
    await reply(section("❌", "Site Unreachable") + row("Site", SITE) + divider() + `<i>${ts()}</i>`, MAIN_MENU);
  }
}

async function handleHelp(chatId: number | string, messageId?: number) {
  const reply = messageId ? replyEdit(chatId as number, messageId) : replySend(chatId);
  await reply(
    section("❓", "Commands") +
    `/start /menu /status /health /help\n` +
    `/db /users /vocab /bible /wiki /curriculum\n` +
    `/ai /test\n` +
    `/logs /errors /restart /deploy /cache /network /disk\n` +
    `/analytics /security\n` +
    divider() + `<i>Buttons navigate inline menus</i>`,
    MAIN_MENU
  );
}

async function handleContentVocab(chatId: number | string, messageId?: number) {
  const reply = messageId ? replyEdit(chatId as number, messageId) : replySend(chatId);
  const result = await apiGet("/api/dictionary/stats");
  await reply(section("📖", "Dictionary") + `<pre>${esc(result)}</pre>` + divider() + `<i>${ts()}</i>`, CONTENT_MENU);
}

async function handleContentBible(chatId: number | string, messageId?: number) {
  const reply = messageId ? replyEdit(chatId as number, messageId) : replySend(chatId);
  const result = await apiGet("/api/zolai/bible/Genesis?chapter=1");
  await reply(section("📜", "Bible") + `<pre>${esc(result.slice(0, 600))}</pre>` + divider() + `<i>${ts()}</i>`, CONTENT_MENU);
}

async function handleContentWiki(chatId: number | string, messageId?: number) {
  const reply = messageId ? replyEdit(chatId as number, messageId) : replySend(chatId);
  const result = await apiGet("/api/zolai/wiki");
  await reply(section("📝", "Wiki") + `<pre>${esc(result.slice(0, 600))}</pre>` + divider() + `<i>${ts()}</i>`, CONTENT_MENU);
}

async function handleContentCurriculum(chatId: number | string, messageId?: number) {
  const reply = messageId ? replyEdit(chatId as number, messageId) : replySend(chatId);
  const result = await apiGet("/api/curriculum/levels");
  await reply(section("📚", "Curriculum") + `<pre>${esc(result.slice(0, 600))}</pre>` + divider() + `<i>${ts()}</i>`, CONTENT_MENU);
}

async function handleAnalytics(chatId: number | string, messageId?: number) {
  const reply = messageId ? replyEdit(chatId as number, messageId) : replySend(chatId);
  const result = await apiGet("/api/zolai/stats");
  await reply(section("📈", "Analytics") + `<pre>${esc(result)}</pre>` + divider() + `<i>${ts()}</i>`, MAIN_MENU);
}

async function handleSecurity(chatId: number | string, messageId?: number) {
  const reply = messageId ? replyEdit(chatId as number, messageId) : replySend(chatId);
  await reply("🔐 Checking...", MAIN_MENU);
  await new Promise(r => setImmediate(r));
  const errors = run("journalctl -u zolai-next -p err..warning --since '1 hour ago' --no-pager -o short 2>/dev/null | tail -10");
  const text = errors.trim() || "No errors in the last hour ✅";
  await send(chatId,
    section("🔐", "Security — Last Hour") +
    `<pre>${esc(text).slice(0, 3000)}</pre>` +
    divider() + `<i>${ts()}</i>`,
    MAIN_MENU
  );
}

async function handleNetwork(chatId: number | string, messageId?: number) {
  const reply = messageId ? replyEdit(chatId as number, messageId) : replySend(chatId);
  const netstat = run("ss -tuln | grep LISTEN | head -10");
  await reply(section("🌐", "Network") + `<pre>${esc(netstat)}</pre>` + divider() + `<i>${ts()}</i>`, SYSTEM_MENU);
}

async function handleDisk(chatId: number | string, messageId?: number) {
  const reply = messageId ? replyEdit(chatId as number, messageId) : replySend(chatId);
  const disk = run("df -h");
  await reply(section("💾", "Disk Usage") + `<pre>${esc(disk)}</pre>` + divider() + `<i>${ts()}</i>`, SYSTEM_MENU);
}

async function handleCache(chatId: number | string, messageId?: number) {
  const reply = messageId ? replyEdit(chatId as number, messageId) : replySend(chatId);
  const result = run(`cd ${VPS_DIR} && rm -rf .next/cache && echo 'Cache cleared'`);
  await reply(section("🗑️", "Cache") + `<pre>${esc(result)}</pre>` + divider() + `<i>${ts()}</i>`, SYSTEM_MENU);
}

async function handleBlocked(chatId: number | string) {
  const rules = run("sudo ufw status 2>/dev/null | grep DENY | head -20");
  const text = rules.trim() || "No blocked IPs";
  await send(chatId,
    section("🚫", "Blocked IPs") +
    `<pre>${esc(text)}</pre>` +
    divider() +
    `<i>Use /unblock &lt;ip&gt; to unblock</i>`,
    MAIN_MENU
  );
}

// ─── Router ──────────────────────────────────────────────────────────────────
async function handleCommand(chatId: number, text: string, name?: string) {
  console.log(`📨 Command from ${chatId}: ${text}`);
  
  if (String(chatId) !== ALLOWED_CHAT) {
    console.log(`⛔ Unauthorized: ${chatId} !== ${ALLOWED_CHAT}`);
    await send(chatId, "⛔ Unauthorized");
    return;
  }

  const cmd = text.split(" ")[0].toLowerCase();

  switch (cmd) {
    case "/start": return handleStart(chatId, name);
    case "/menu": return handleMenu(replySend(chatId));
    case "/status": return handleStatus(chatId);
    case "/health": return handleHealth(chatId);
    case "/db": return send(chatId, "🗄️ <b>Database Menu</b>", DB_MENU);
    case "/users": return handleDbUsers(chatId);
    case "/vocab": return handleContentVocab(chatId);
    case "/ai": return send(chatId, "🤖 <b>AI Menu</b>", AI_MENU);
    case "/test": return handleAiTest(chatId);
    case "/logs": return handleLogs(chatId);
    case "/errors": return handleErrors(chatId);
    case "/restart": return handleRestart(chatId);
    case "/deploy": return handleDeploy(chatId);
    case "/help": return handleHelp(chatId);
    case "/content": return send(chatId, "📚 <b>Content Menu</b>", CONTENT_MENU);
    case "/bible": return handleContentBible(chatId);
    case "/wiki": return handleContentWiki(chatId);
    case "/curriculum": return handleContentCurriculum(chatId);
    case "/analytics": return handleAnalytics(chatId);
    case "/security": return handleSecurity(chatId);
    case "/network": return handleNetwork(chatId);
    case "/disk": return handleDisk(chatId);
    case "/cache": return handleCache(chatId);
    case "/blocked": return handleBlocked(chatId);
    case "/unblock":{
      const ip = text.split(" ")[1];
      if (!ip) return send(chatId, "Usage: /unblock &lt;ip&gt;");
      const result = run(`sudo ufw delete deny from ${ip} 2>&1`);
      blockedIPs.delete(ip);
      return send(chatId, `🔓 Unblocked ${ip}\n<pre>${esc(result)}</pre>`);
    }
    default:
      await send(chatId, `❓ Unknown: ${esc(cmd)}\n\nUse /help`);
  }
}

async function handleCallback(chatId: number, messageId: number, data: string, callbackId: string) {
  console.log(`🔘 Callback from ${chatId}: ${data}`);

  // Must answer callback immediately per Telegram API docs
  await answerCallback(callbackId);

  if (String(chatId) !== ALLOWED_CHAT) return;

  // Helper: edit existing message instead of sending new one
  const edit = (text: string, kb?: InlineKeyboard) => editMessage(chatId, messageId, text, kb);

  switch (data) {
    case "menu": return edit(`🎛️ <b>Main Menu</b>\n\nSelect an option below:`, MAIN_MENU);
    case "status": return handleStatus(chatId, messageId);
    case "health": return handleHealth(chatId, messageId);
    case "db_menu": return edit(`🗄️ <b>Database Menu</b>`, DB_MENU);
    case "db_stats": return handleDbStats(chatId, messageId);
    case "db_users": return handleDbUsers(chatId, messageId);
    case "db_vocab": return handleContentVocab(chatId, messageId);
    case "db_bible": return handleContentBible(chatId, messageId);
    case "db_wiki": return handleContentWiki(chatId, messageId);
    case "db_curriculum": return handleContentCurriculum(chatId, messageId);
    case "ai_menu": return edit(`🤖 <b>AI Menu</b>`, AI_MENU);
    case "ai_test": return handleAiTest(chatId, messageId);
    case "ai_stats": return edit(`📊 AI stats coming soon...`, AI_MENU);
    case "ai_keys": return edit(`🔑 API keys: Check .env.production`, AI_MENU);
    case "ai_models": return edit(`🎯 Models: Gemini Flash 2.0`, AI_MENU);
    case "content_menu": return edit(`📚 <b>Content Menu</b>`, CONTENT_MENU);
    case "content_vocab": return handleContentVocab(chatId, messageId);
    case "content_bible": return handleContentBible(chatId, messageId);
    case "content_wiki": return handleContentWiki(chatId, messageId);
    case "content_curriculum": return handleContentCurriculum(chatId, messageId);
    case "content_lessons": return edit(`🎓 Lessons stats coming soon...`, CONTENT_MENU);
    case "content_audio": return edit(`🔊 Audio stats coming soon...`, CONTENT_MENU);
    case "system_menu": return edit(`⚙️ <b>System Menu</b>`, SYSTEM_MENU);
    case "logs": return handleLogs(chatId, messageId);
    case "errors": return handleErrors(chatId, messageId);
    case "restart": return handleRestart(chatId, messageId);
    case "cache": return handleCache(chatId, messageId);
    case "network": return handleNetwork(chatId, messageId);
    case "disk": return handleDisk(chatId, messageId);
    case "deploy": return handleDeploy(chatId, messageId);
    case "analytics": return handleAnalytics(chatId, messageId);
    case "security": return handleSecurity(chatId, messageId);
    case "help": return handleHelp(chatId, messageId);
    default: return edit(`❓ Unknown action: ${esc(data)}`);
  }
}

// ─── Background Monitor ───────────────────────────────────────────────────────
const MONITOR_INTERVAL = 60_000; // check every 60s
const prevState: Record<string, boolean> = {};
const blockedIPs = new Set<string>();

async function monitor() {
  const alerts: string[] = [];

  // Check services
  for (const svc of ["zolai-next", "zolai-chat"]) {
    const active = run(`systemctl is-active ${svc} 2>/dev/null`) === "active";
    if (prevState[svc] === true && !active) {
      alerts.push(`🔴 <b>${svc}</b> went DOWN`);
    } else if (prevState[svc] === false && active) {
      alerts.push(`🟢 <b>${svc}</b> recovered`);
    }
    prevState[svc] = active;
  }

  // Check site HTTP
  try {
    const res = await fetch(SITE, { signal: AbortSignal.timeout(5000) });
    const up = res.ok;
    if (prevState["site"] === true && !up) alerts.push(`🔴 <b>Site</b> returned HTTP ${res.status}`);
    else if (prevState["site"] === false && up) alerts.push(`🟢 <b>Site</b> recovered (HTTP ${res.status})`);
    prevState["site"] = up;
  } catch {
    if (prevState["site"] !== false) alerts.push(`🔴 <b>Site</b> is unreachable`);
    prevState["site"] = false;
  }

  // Check disk > 90%
  const diskPct = parseInt(run("df / | awk 'NR==2{print $5}' | tr -d '%'") || "0");
  if (diskPct >= 90) alerts.push(`⚠️ <b>Disk</b> usage critical: ${diskPct}%`);

  // Check memory > 90%
  const memInfo = run("free | awk 'NR==2{printf \"%d\", $3/$2*100}'");
  const memPct = parseInt(memInfo || "0");
  if (memPct >= 90) alerts.push(`⚠️ <b>Memory</b> usage critical: ${memPct}%`);

  // Check for brute-force IPs (>100 requests/min from single IP)
  const topIPs = run("tail -1000 /var/log/nginx/access.log 2>/dev/null | awk '{print $1}' | sort | uniq -c | sort -rn | head -5");
  const lines = topIPs.split("\n").filter(Boolean);
  for (const line of lines) {
    const match = line.trim().match(/^\s*(\d+)\s+(\S+)$/);
    if (!match) continue;
    const [, count, ip] = match;
    const reqCount = parseInt(count);
    
    // Block if >100 requests in last 1000 log lines (≈1 min) and not already blocked
    if (reqCount > 100 && !blockedIPs.has(ip) && !ip.startsWith("172.") && !ip.startsWith("127.")) {
      const blocked = run(`sudo ufw deny from ${ip} 2>&1`);
      if (!blocked.includes("ERROR")) {
        blockedIPs.add(ip);
        alerts.push(`🚫 <b>Blocked IP</b>: ${ip} (${reqCount} req/min)`);
      }
    }
  }

  // Check for SSH brute-force attempts
  const sshFails = run("grep 'Failed password' /var/log/auth.log 2>/dev/null | tail -50 | awk '{print $(NF-3)}' | sort | uniq -c | sort -rn | head -3");
  const sshLines = sshFails.split("\n").filter(Boolean);
  for (const line of sshLines) {
    const match = line.trim().match(/^\s*(\d+)\s+(\S+)$/);
    if (!match) continue;
    const [, count, ip] = match;
    const failCount = parseInt(count);
    
    if (failCount > 5 && !blockedIPs.has(ip)) {
      const blocked = run(`sudo ufw deny from ${ip} 2>&1`);
      if (!blocked.includes("ERROR")) {
        blockedIPs.add(ip);
        alerts.push(`🚫 <b>Blocked SSH attacker</b>: ${ip} (${failCount} failed logins)`);
      }
    }
  }

  if (alerts.length > 0) {
    await send(ALLOWED_CHAT,
      `🚨 <b>Alert — ${ts()}</b>\n\n` + alerts.join("\n")
    );
  }
}

// Start monitor after 30s (let services settle), then every 60s
setTimeout(async () => {
  // Init state silently on first run
  for (const svc of ["zolai-next", "zolai-chat"]) {
    prevState[svc] = run(`systemctl is-active ${svc} 2>/dev/null`) === "active";
  }
  try {
    const res = await fetch(SITE, { signal: AbortSignal.timeout(5000) });
    prevState["site"] = res.ok;
  } catch { prevState["site"] = false; }

  console.log("🔍 Monitor started");
  setInterval(() => monitor().catch(console.error), MONITOR_INTERVAL);
}, 30_000);


let offset = 0;
console.log("🤖 Zolai Platform Bot started");
console.log(`📡 Polling for updates...`);

while (true) {
  try {
    const res = await fetch(`${BASE}/getUpdates?offset=${offset}&timeout=30&allowed_updates=["message","callback_query"]`);
    const data = await res.json() as { ok: boolean; result: TgUpdate[] };
    
    if (data.ok) {
      if (data.result.length > 0) console.log(`📬 Got ${data.result.length} update(s)`);
      for (const update of data.result) {
        offset = update.update_id + 1;
        
        if (update.message?.text) {
          await handleCommand(
            update.message.chat.id,
            update.message.text,
            update.message.from?.first_name
          ).catch(console.error);
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
