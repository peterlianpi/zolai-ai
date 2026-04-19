"""Tongsan.org full crawler using legacy SSL + category-based pagination."""
from __future__ import annotations

import json
import re
import ssl
import sys
import time
from pathlib import Path

import requests
import urllib3
from bs4 import BeautifulSoup
from requests.adapters import HTTPAdapter

urllib3.disable_warnings()

class LegacySSL(HTTPAdapter):
    def init_poolmanager(self, *a, **kw):
        ctx = ssl.create_default_context()
        ctx.set_ciphers("DEFAULT@SECLEVEL=1")
        ctx.check_hostname = False
        ctx.verify_mode = ssl.CERT_NONE
        try: ctx.options |= ssl.OP_LEGACY_SERVER_CONNECT
        except: pass
        kw["ssl_context"] = ctx
        super().init_poolmanager(*a, **kw)

S = requests.Session()
S.mount("https://", LegacySSL())
HDR = {"User-Agent": "Mozilla/5.0 (ZolaiToolkit/1.0)"}
BASE = "https://tongsan.org"
OUT  = Path("data/history/crawls/tongsan_live_crawl.jsonl")
OUT.parent.mkdir(parents=True, exist_ok=True)

def get(url: str, timeout: int = 12) -> requests.Response | None:
    try: return S.get(url, timeout=timeout, headers=HDR)
    except Exception as e: print(f"\n  WARN {url[:60]}: {e}"); return None

def clean(html: str) -> str:
    soup = BeautifulSoup(html or "", "html.parser")
    for t in soup(["script","style","figure","img","nav","footer","aside"]): t.decompose()
    return " ".join(soup.get_text(" ", strip=True).split())

def post_links_from_page(html: str) -> list[str]:
    return list(set(re.findall(
        r'href="(https://tongsan\.org/(?!category|tag|author|page|wp-)[a-z0-9\-]+/[a-z0-9\-]+/)"',
        html)))

# Load existing
seen: set[str] = set()
if OUT.exists():
    with OUT.open(encoding="utf-8") as f:
        for line in f:
            try: seen.add(json.loads(line.strip()).get("url",""))
            except: pass
print(f"[Tongsan] Existing: {len(seen)}", flush=True)

# Collect links from: homepage pagination + category pages
all_links: set[str] = set()
SOURCES = (
    [f"{BASE}/page/{p}/" for p in range(1, 120)] +
    [f"{BASE}/category/news/page/{p}/" for p in range(1, 50)] +
    [f"{BASE}/category/articles/page/{p}/" for p in range(1, 50)] +
    [f"{BASE}/category/education/page/{p}/" for p in range(1, 20)] +
    [f"{BASE}/news/page/{p}/" for p in range(1, 50)]
)

print(f"[Tongsan] Scanning {len(SOURCES)} listing pages...", flush=True)
for i, url in enumerate(SOURCES):
    r = get(url)
    if not r or r.status_code == 404: continue
    links = post_links_from_page(r.text)
    new = [l for l in links if l not in all_links]
    all_links.update(links)
    if new:
        sys.stdout.write(f"\r  {i+1}/{len(SOURCES)} | +{len(new)} | total={len(all_links)}   ")
        sys.stdout.flush()
    time.sleep(0.4)

print(f"\n[Tongsan] {len(all_links)} post links found. Scraping...", flush=True)
saved = 0
with OUT.open("a", encoding="utf-8") as fout:
    for i, url in enumerate(sorted(all_links), 1):
        if url in seen: continue
        r = get(url)
        if not r or r.status_code != 200: continue
        soup = BeautifulSoup(r.text, "html.parser")
        title_tag = soup.find("h1") or soup.find("h2")
        title = title_tag.get_text(strip=True) if title_tag else ""
        content_div = (soup.find("div", class_=re.compile(r"entry-content|post-content", re.I))
                       or soup.find("article"))
        if not content_div: continue
        for t in content_div(["script","style","figure","img"]): t.decompose()
        content = " ".join(content_div.get_text(" ", strip=True).split())
        text = f"{title}\n{content}".strip()
        if len(text) < 30: continue
        fout.write(json.dumps({"text": text, "title": title, "url": url,
            "language": "zolai", "dialect": "tedim", "source": "tongsan.org",
            "topic": "news", "category": "sentence"}, ensure_ascii=False) + "\n")
        seen.add(url); saved += 1
        sys.stdout.write(f"\r  {i}/{len(all_links)} | saved={saved}   ")
        sys.stdout.flush()
        time.sleep(0.5)

print(f"\n[Tongsan] Done — {saved} articles → {OUT}", flush=True)
