"""
Scraper for tedim.rvasia.org — Radio Veritas Asia Tedim Chin Service.

Scrapes section by section, page by page, article by article.
Fully resumable: tracks done sections and done article IDs.

Usage:
    python scripts/fetch_rvasia_tedim.py --output data/rvasia_tedim.jsonl [--sleep 1.0] [--section SLUG]
"""
from __future__ import annotations

import argparse
import hashlib
import json
import re
import sys
import time
from pathlib import Path

import requests
from bs4 import BeautifulSoup

BASE_URL = "https://tedim.rvasia.org"
SOURCE = "rvasia_tedim"

SECTIONS = [
    ("nisim-kha",       "Nisim Kha-an"),
    ("thu-thak",        "Thu Thak"),
    ("thuhilhna",       "Thuhilhna"),
    ("innkuan-thu",     "Innkuan Thu"),
    ("mi-siangtho-te",  "Mi Siangtho Te"),
    ("pope-kammal",     "Pope Kammal"),
    ("ngeina-khua-hun", "Ngeina Khua Hun"),
    ("pawlpi-thu",      "Pawlpi Thu"),
]

HEADERS = {"User-Agent": "ZolaiAI-DataBot/1.0 (language preservation; contact@zolai.ai)"}


def get(url: str, sleep: float, retries: int = 3) -> BeautifulSoup | None:
    for attempt in range(retries):
        try:
            r = requests.get(url, headers=HEADERS, timeout=20)
            r.raise_for_status()
            time.sleep(sleep)
            return BeautifulSoup(r.text, "html.parser")
        except Exception as e:
            wait = sleep * (attempt + 2)
            print(f"\n  [WARN] {url}: {e} — retry {attempt+1}/{retries} in {wait:.0f}s", file=sys.stderr)
            time.sleep(wait)
    return None


def get_last_page(soup: BeautifulSoup) -> int:
    nums = [
        int(m.group(1))
        for a in soup.find_all("a", href=re.compile(r"page=\d+"))
        if (m := re.search(r"page=(\d+)", a["href"]))
    ]
    return max(nums) if nums else 0


def get_links_from_page(soup: BeautifulSoup, slug: str) -> list[str]:
    links = []
    seen = set()
    for a in soup.select("h2 a, h3 a, .views-field-title a, .node-title a"):
        href = a.get("href", "")
        if isinstance(href, str) and href.startswith(f"/{slug}/") and href not in seen:
            seen.add(href)
            links.append(BASE_URL + href)
    return links


def scrape_article(url: str, slug: str, section_name: str, sleep: float) -> dict | None:
    soup = get(url, sleep)
    if not soup:
        return None

    h1 = soup.find("h1")
    title = h1.get_text(strip=True) if h1 else ""
    if not title:
        return None

    node = soup.find("div", class_="node-article")
    if not node:
        return None

    subtitle_div = node.find("div", class_="field-name-ds-image-video-block")
    subtitle = subtitle_div.get_text(strip=True) if subtitle_div else ""

    date_div = node.find("div", class_="field-name-post-date")
    date_str = date_div.get_text(strip=True) if date_div else ""

    body_div = node.find("div", class_="field-name-body")
    if body_div:
        paras = [p.get_text(strip=True) for p in body_div.find_all("p") if p.get_text(strip=True)]
        if not paras:
            fi = body_div.find("div", class_="field-item")
            paras = [fi.get_text(strip=True)] if fi else []
        body = "\n\n".join(paras)
    else:
        body = ""

    full_text = "\n".join(filter(None, [title, subtitle, body])).strip()
    if len(full_text) < 15:
        return None

    return {
        "id": hashlib.md5(url.encode()).hexdigest(),
        "url": url,
        "source": SOURCE,
        "section": slug,
        "section_name": section_name,
        "title": title,
        "subtitle": subtitle,
        "date": date_str,
        "body": body,
        "text": full_text,
        "language": "zolai",
        "locale": "tedim",
    }


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--output", default="data/rvasia_tedim.jsonl")
    parser.add_argument("--state",  default="data/rvasia_state.json",
                        help="Tracks done sections and article IDs for resume")
    parser.add_argument("--sleep",  type=float, default=1.0)
    parser.add_argument("--section", help="Only scrape this section slug")
    args = parser.parse_args(argv)

    out_path   = Path(args.output)
    state_path = Path(args.state)
    out_path.parent.mkdir(parents=True, exist_ok=True)

    # Load state
    state: dict = {"done_sections": [], "done_ids": []}
    if state_path.exists():
        state = json.loads(state_path.read_text())
    done_sections: set[str] = set(state.get("done_sections", []))
    done_ids: set[str]      = set(state.get("done_ids", []))

    if done_ids:
        print(f"Resuming: {len(done_ids)} articles done, {len(done_sections)} sections done")

    def save_state() -> None:
        state_path.write_text(json.dumps({
            "done_sections": list(done_sections),
            "done_ids": list(done_ids),
        }, indent=2))

    sections = [s for s in SECTIONS
                if (not args.section or s[0] == args.section)
                and s[0] not in done_sections]

    total = len(done_ids)

    with open(out_path, "a", encoding="utf-8") as out_f:
        for slug, name in sections:
            print(f"\n=== {name} ({slug}) ===", flush=True)

            soup0 = get(f"{BASE_URL}/{slug}", args.sleep)
            if not soup0:
                continue
            last_page = get_last_page(soup0)
            print(f"  {last_page + 1} pages", flush=True)

            section_written = 0
            for page in range(0, last_page + 1):
                url = f"{BASE_URL}/{slug}" + (f"?page={page}" if page > 0 else "")
                soup = soup0 if page == 0 else get(url, args.sleep)
                if not soup:
                    continue

                links = get_links_from_page(soup, slug)
                for art_url in links:
                    aid = hashlib.md5(art_url.encode()).hexdigest()
                    if aid in done_ids:
                        continue
                    record = scrape_article(art_url, slug, name, args.sleep)
                    if record:
                        out_f.write(json.dumps(record, ensure_ascii=False) + "\n")
                        out_f.flush()
                        done_ids.add(aid)
                        total += 1
                        section_written += 1

                sys.stdout.write(f"\r  Page {page+1}/{last_page+1} | section={section_written} | total={total}")
                sys.stdout.flush()
                save_state()  # save after every page

            done_sections.add(slug)
            save_state()
            print(f"\n  Done: {section_written} articles", flush=True)

    print(f"\nFinished. {total} total records → {out_path}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
