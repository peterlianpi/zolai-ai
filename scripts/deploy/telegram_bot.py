#!/usr/bin/env python3
"""Zolai Telegram Bot — server control, health reports, and dataset stats.

Commands:
  /health    — service status + memory
  /restart   — restart nginx + openclaw
  /logs      — last 20 lines of all logs
  /stats     — dataset record counts
  /deploy    — git pull + restart
  /run <cmd> — run whitelisted shell command
  /help      — list commands

Setup on server:
  pip install python-telegram-bot==20.*
  export TELEGRAM_BOT_TOKEN=your_token
  export TELEGRAM_CHAT_ID=your_chat_id
  python scripts/deploy/telegram_bot.py
"""
from __future__ import annotations

import os
import subprocess
import sys
from pathlib import Path

try:
    from telegram import Update
    from telegram.ext import Application, CommandHandler, ContextTypes
except ImportError:
    print("Run: pip install 'python-telegram-bot>=20'")
    sys.exit(1)

TOKEN   = os.environ["TELEGRAM_BOT_TOKEN"]
CHAT_ID = int(os.environ["TELEGRAM_CHAT_ID"])
ROOT    = Path(__file__).parent.parent.parent  # project root on server

# Commands allowed via /run
WHITELIST = {
    "free -h", "df -h /", "uptime", "ps aux --sort=-%mem | head -10",
    "wc -l data/master/combined/*.jsonl",
    "sudo systemctl status nginx", "sudo systemctl status openclaw",
    "python scripts/doublecheck_master.py",
}


def sh(cmd: str, timeout: int = 30) -> str:
    try:
        r = subprocess.run(cmd, shell=True, capture_output=True, text=True,
                           timeout=timeout, cwd=ROOT)
        out = (r.stdout + r.stderr).strip()
        return out[:3800] or "(no output)"
    except subprocess.TimeoutExpired:
        return "⏱ Timed out"
    except Exception as e:
        return f"Error: {e}"


def guard(update: Update) -> bool:
    """Only respond to the configured chat."""
    return update.effective_chat.id == CHAT_ID


async def cmd_health(update: Update, ctx: ContextTypes.DEFAULT_TYPE) -> None:
    if not guard(update): return
    out = sh(
        "echo '=== Services ===' && "
        "echo -n 'nginx: ' && sudo systemctl is-active nginx && "
        "echo -n 'openclaw: ' && sudo systemctl is-active openclaw && "
        "echo -n 'cloudflared: ' && (ps aux | grep -c '[c]loudflared' && echo 'running' || echo 'stopped') && "
        "echo -n 'openclaw API: ' && (curl -sf http://127.0.0.1:18789/health && echo 'ok' || echo 'unreachable') && "
        "echo '=== Memory ===' && free -h | grep Mem && "
        "echo '=== Disk ===' && df -h / | tail -1"
    )
    await update.message.reply_text(f"```\n{out}\n```", parse_mode="Markdown")


async def cmd_restart(update: Update, ctx: ContextTypes.DEFAULT_TYPE) -> None:
    if not guard(update): return
    await update.message.reply_text("⏳ Restarting services...")
    out = sh("sudo systemctl restart nginx && sudo systemctl restart openclaw && "
             "echo 'nginx: '$(sudo systemctl is-active nginx) && "
             "echo 'openclaw: '$(sudo systemctl is-active openclaw)")
    await update.message.reply_text(f"✅ Done\n```\n{out}\n```", parse_mode="Markdown")


async def cmd_logs(update: Update, ctx: ContextTypes.DEFAULT_TYPE) -> None:
    if not guard(update): return
    out = sh(
        "echo '=== openclaw ===' && tail -10 /home/$USER/.openclaw/openclaw.log 2>/dev/null && "
        "echo '=== nginx ===' && sudo tail -10 /var/log/nginx/error.log 2>/dev/null && "
        "echo '=== cloudflared ===' && tail -10 /tmp/cloudflared.log 2>/dev/null"
    )
    await update.message.reply_text(f"```\n{out}\n```", parse_mode="Markdown")


async def cmd_stats(update: Update, ctx: ContextTypes.DEFAULT_TYPE) -> None:
    if not guard(update): return
    out = sh("wc -l data/master/combined/*.jsonl 2>/dev/null && "
             "echo '---' && du -sh data/master/ 2>/dev/null")
    await update.message.reply_text(f"📊 Dataset Stats\n```\n{out}\n```", parse_mode="Markdown")


async def cmd_deploy(update: Update, ctx: ContextTypes.DEFAULT_TYPE) -> None:
    if not guard(update): return
    await update.message.reply_text("⏳ Deploying...")
    out = sh("git pull 2>&1 && sudo systemctl restart nginx && sudo systemctl restart openclaw", timeout=60)
    await update.message.reply_text(f"🚀 Deploy done\n```\n{out}\n```", parse_mode="Markdown")


async def cmd_run(update: Update, ctx: ContextTypes.DEFAULT_TYPE) -> None:
    if not guard(update): return
    raw = " ".join(ctx.args or []).strip()
    if not raw:
        await update.message.reply_text("Usage: /run <command>"); return
    if raw not in WHITELIST:
        await update.message.reply_text(f"⛔ Not whitelisted: `{raw}`\n\nAllowed:\n" +
                                        "\n".join(f"• `{c}`" for c in sorted(WHITELIST)),
                                        parse_mode="Markdown")
        return
    out = sh(raw)
    await update.message.reply_text(f"```\n{out}\n```", parse_mode="Markdown")


async def cmd_help(update: Update, ctx: ContextTypes.DEFAULT_TYPE) -> None:
    if not guard(update): return
    await update.message.reply_text(
        "*Zolai Server Bot*\n\n"
        "/health — service status + memory\n"
        "/restart — restart nginx + openclaw\n"
        "/logs — last 10 lines of all logs\n"
        "/stats — dataset record counts\n"
        "/deploy — git pull + restart\n"
        "/run `<cmd>` — whitelisted shell command\n"
        "/help — this message",
        parse_mode="Markdown"
    )


def main() -> None:
    app = Application.builder().token(TOKEN).build()
    for name, fn in [("health", cmd_health), ("restart", cmd_restart),
                     ("logs", cmd_logs), ("stats", cmd_stats),
                     ("deploy", cmd_deploy), ("run", cmd_run), ("help", cmd_help)]:
        app.add_handler(CommandHandler(name, fn))
    print("Bot running...")
    app.run_polling(drop_pending_updates=True)


if __name__ == "__main__":
    main()
