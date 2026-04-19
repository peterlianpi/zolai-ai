"""
Full crawler for ZomiDaily + Tongsan — resumes from last saved ID.
Usage: python scripts/crawlers/crawl_all_news.py
"""
from __future__ import annotations

import json
import sys
import time
from pathlib import Path

import requests
import urllib3
from bs4 import BeautifulSoup

urllib3.disable_warnings()

SITES = [
    {"name": "zomidaily", "base": "https://zomidaily.com", "out": "data/history/crawls/zomidaily_live_crawl.jsonl"},
    {"name": "tongsan",   "base": "https://tongsan.org",   "out": "data/history/crawls/tongsan_live_crawl.jsonl"},
]
HDR   = {"User-Agent": "Mozilla/5.0 (ZolaiToolkit/1.0; Language Research)"}
PER   = 20
SLEEP = 0.8

def clean(html: str) -> str:
    soup = BeautifulSoup(html or "", "html.parser")
    for t in soup(["script","style","figure","img","nav","footer"]): t.decompose()
    return " ".join(soup.get_text(" ", strip=True).split())

def crawl_site(name: str, base: str, out_path: str) -> int:
    out = Path(out_path)
    out.parent.mkdir(parents=True, exist_ok=True)
    api = f"{base}/wp-json/wp/v2/posts"

    # Load existing IDs for resume
    seen_ids: set[str] = set()
    if out.exists():
        with out.open(encoding="utf-8") as f:
            for line in f:
                try: seen_ids.add(str(json.loads(line.strip()).get("wp_id","")))
                except: pass

    # Get total pages
    try:
        r = requests.get(api, params={"per_page": PER, "page": 1}, timeout=15, verify=False, headers=HDR)
        total_pages = int(r.headers.get("X-WP-TotalPages", 9999))
        total_posts = int(r.headers.get("X-WP-Total", 0))
    except Exception as e:
        print(f"  [{name}] Cannot reach API: {e}"); return 0

    print(f"\n[{name}] {total_posts:,} posts across {total_pages:,} pages | already have {len(seen_ids):,}", flush=True)

    saved = 0
    with out.open("a", encoding="utf-8") as fout:
        for page in range(1, total_pages + 1):
            try:
                r = requests.get(api, params={"page": page, "per_page": PER,
                    "_fields": "id,date,title,content,link"},
                    timeout=15, verify=False, headers=HDR)
                r.raise_for_status()
                posts = r.json()
            except Exception as e:
                print(f"\r  [{name}] page {page} error: {e} — retrying...", flush=True)
                time.sleep(3)
                try:
                    r = requests.get(api, params={"page": page, "per_page": PER,
                        "_fields": "id,date,title,content,link"},
                        timeout=20, verify=False, headers=HDR)
                    posts = r.json()
                except:
                    print(f"  [{name}] page {page} failed — skipping.", flush=True)
                    continue

            if not posts: break

            new_this_page = 0
            for post in posts:
                pid = str(post.get("id",""))
                if pid in seen_ids: continue
                seen_ids.add(pid)
                title   = clean(post.get("title",{}).get("rendered",""))
                content = clean(post.get("content",{}).get("rendered",""))
                text    = f"{title}\n{content}".strip()
                if len(text) < 20: continue
                fout.write(json.dumps({
                    "text": text, "title": title,
                    "language": "zolai", "dialect": "tedim",
                    "source": name, "url": post.get("link",""),
                    "date": post.get("date",""), "wp_id": pid,
                    "topic": "news", "category": "sentence"
                }, ensure_ascii=False) + "\n")
                saved += 1
                new_this_page += 1

            sys.stdout.write(f"\r  [{name}] page {page:>4}/{total_pages} | +{new_this_page} | total={saved:,}   ")
            sys.stdout.flush()
            time.sleep(SLEEP)

    print(f"\n  [{name}] Done — {saved:,} new articles saved", flush=True)
    return saved

if __name__ == "__main__":
    total = 0
    for site in SITES:
        total += crawl_site(site["name"], site["base"], site["out"])
    print(f"\n=== TOTAL NEW ARTICLES: {total:,} ===")
