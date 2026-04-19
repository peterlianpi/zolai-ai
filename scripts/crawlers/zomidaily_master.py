"""
ZomiDaily Article Crawler — fetches real Zolai news articles.
Output: data/history/crawls/zomidaily_live_crawl.jsonl
Usage: python scripts/crawlers/zomidaily_master.py [--pages N] [--sleep S]
"""
from __future__ import annotations

import argparse
import hashlib
import json
import time
from pathlib import Path

try:
    import requests
    from bs4 import BeautifulSoup
except ImportError:
    print("pip install requests beautifulsoup4"); raise SystemExit(1)

BASE   = "https://zomidaily.com"
WPAPI  = f"{BASE}/wp-json/wp/v2/posts"
OUT    = Path("data/history/crawls/zomidaily_live_crawl.jsonl")
HEADERS = {"User-Agent": "Mozilla/5.0 (ZolaiToolkit/1.0; Language Research)"}

def md5(s: str) -> str:
    return hashlib.md5(s.encode()).hexdigest()

def clean(html: str) -> str:
    soup = BeautifulSoup(html or "", "html.parser")
    for tag in soup(["script","style","figure","img","a"]): tag.decompose()
    return " ".join(soup.get_text(" ", strip=True).split())

def fetch_page(page: int, per_page: int = 20, sleep: float = 1.5) -> list[dict]:
    try:
        r = requests.get(WPAPI, params={"page": page, "per_page": per_page,
                         "_fields": "id,date,title,content,categories,tags,link"},
                         timeout=15, headers=HEADERS, verify=False)
        r.raise_for_status()
        return r.json()
    except Exception as e:
        print(f"  [WARN] page {page}: {e}", flush=True)
        return []

def main(argv: list[str] | None = None) -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--pages",  type=int, default=10, help="Number of pages to fetch (20 articles/page)")
    ap.add_argument("--sleep",  type=float, default=1.5, help="Delay between requests (seconds)")
    ap.add_argument("--output", default=str(OUT))
    args = ap.parse_args(argv)

    out = Path(args.output)
    out.parent.mkdir(parents=True, exist_ok=True)

    # Load existing IDs to resume
    seen: set[str] = set()
    if out.exists():
        with out.open(encoding="utf-8") as f:
            for line in f:
                try: seen.add(json.loads(line.strip()).get("id",""))
                except: pass
    print(f"[ZomiDaily Crawler] Resuming — {len(seen)} existing records", flush=True)

    total = 0
    with out.open("a", encoding="utf-8") as fout:
        for page in range(1, args.pages + 1):
            posts = fetch_page(page, sleep=args.sleep)
            if not posts:
                print(f"  Page {page}: empty — stopping.", flush=True)
                break

            for post in posts:
                pid = str(post.get("id",""))
                if pid in seen: continue
                seen.add(pid)

                title   = clean(post.get("title",{}).get("rendered",""))
                content = clean(post.get("content",{}).get("rendered",""))
                text    = f"{title}\n{content}".strip() if title else content

                if not text or len(text) < 20: continue

                rec = {
                    "text":       text,
                    "title":      title,
                    "language":   "zolai",
                    "dialect":    "tedim",
                    "source":     "zomidaily.com",
                    "url":        post.get("link",""),
                    "date":       post.get("date",""),
                    "topic":      "news",
                    "category":   "sentence",
                }
                fout.write(json.dumps(rec, ensure_ascii=False) + "\n")
                total += 1

            print(f"  Page {page:>3}: +{len(posts)} posts | total saved={total:,}", flush=True)
            time.sleep(args.sleep)

    print(f"\n[Done] Saved {total:,} new articles → {out}", flush=True)
    return 0

if __name__ == "__main__":
    raise SystemExit(main())
