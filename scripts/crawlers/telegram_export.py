#!/usr/bin/env python3
from __future__ import annotations

import argparse
import json
from datetime import datetime
from pathlib import Path


def main() -> int:
    p = argparse.ArgumentParser(description="Export public Telegram channel messages to JSONL for the Zolai pipeline.")
    p.add_argument("--channel", required=True, help="Channel username or invite link (public only recommended)")
    p.add_argument("--out", default="data/raw/telegram", help="Output directory")
    p.add_argument("--limit", type=int, default=5000, help="Max messages to export")
    p.add_argument("--since", default=None, help="ISO date (YYYY-MM-DD) to stop at (older than this is skipped)")
    args = p.parse_args()

    try:
        from telethon import TelegramClient  # type: ignore
    except Exception as e:
        raise SystemExit(
            "Missing dependency `telethon`.\n"
            "Install with: pip install telethon\n"
            f"Error: {e}"
        )

    import os

    api_id_raw = os.environ.get("TELEGRAM_API_ID")
    api_hash = os.environ.get("TELEGRAM_API_HASH")

    if api_id_raw and api_hash:
        api_id = int(api_id_raw)
    else:
        api_id = int(Path("config/env/telegram_api_id.txt").read_text().strip()) if Path("config/env/telegram_api_id.txt").exists() else None
        api_hash = Path("config/env/telegram_api_hash.txt").read_text().strip() if Path("config/env/telegram_api_hash.txt").exists() else None

    if not api_id or not api_hash:
        raise SystemExit(
            "Telegram API credentials not found.\n"
            "Create files:\n"
            "  config/env/telegram_api_id.txt\n"
            "  config/env/telegram_api_hash.txt\n"
            "Or set env vars TELEGRAM_API_ID and TELEGRAM_API_HASH."
        )

    out_dir = Path(args.out)
    out_dir.mkdir(parents=True, exist_ok=True)
    out_path = out_dir / f"telegram_{args.channel.replace('/', '_')}_{datetime.utcnow().date().isoformat()}.jsonl"

    since_dt = None
    if args.since:
        since_dt = datetime.fromisoformat(args.since)

    client = TelegramClient("zolai-telegram-export", api_id, api_hash)

    async def run():
        await client.start()
        entity = await client.get_entity(args.channel)

        count = 0
        async for msg in client.iter_messages(entity, limit=args.limit):
            if since_dt and msg.date and msg.date.replace(tzinfo=None) < since_dt:
                continue
            if not msg.message:
                continue

            row = {
                "source": "telegram",
                "channel": args.channel,
                "id": msg.id,
                "date": msg.date.isoformat() if msg.date else None,
                "text": msg.message,
                "views": getattr(msg, "views", None),
                "forwards": getattr(msg, "forwards", None),
            }
            with out_path.open("a", encoding="utf-8") as f:
                f.write(json.dumps(row, ensure_ascii=False) + "\n")
            count += 1

        print(f"Wrote {count} messages -> {out_path}")

    import asyncio

    asyncio.run(run())
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

