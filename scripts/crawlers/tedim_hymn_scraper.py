"""
Tedim Hymn Scraper - Get All Songs and Lyrics from tedimhymn.com

Usage:
    python scripts/tedim_hymn_scraper.py
    python scripts/tedim_hymn_scraper.py --output data/tedim_hymns.jsonl
    python scripts/tedim_hymn_scraper.py --download-resources --output-dir data/tedim_hymns
    python scripts/tedim_hymn_scraper.py --zip --output-dir data/tedim_hymns
"""

from __future__ import annotations

import argparse
import json
import re
import time
import zipfile
from pathlib import Path

import requests
from bs4 import BeautifulSoup

BASE_URL = "http://www.tedimhymn.com/"


def fetch_main_page() -> str:
    """Fetch the main hymn page."""
    print("Fetching main page...")
    response = requests.get(BASE_URL, timeout=60)
    response.encoding = "utf-8"
    print(f"Status: {response.status_code}")
    print(f"Size: {len(response.text):,} bytes")
    return response.text


def clean_lyrics(text: str) -> str:
    """Clean lyrics text by removing extra whitespace and normalizing."""
    if not text:
        return ""
    text = re.sub(r"Key\s*:\s*\w+", "", text).strip()
    text = re.sub(r"\n{3,}", "\n\n", text)
    return text.strip()


def parse_hymns(html: str) -> list[dict]:
    """Parse all hymns from the table."""
    soup = BeautifulSoup(html, "html.parser")
    table = soup.find("table", id="labutable")
    if not table:
        print("ERROR: Could not find hymn table")
        return []

    rows = table.find("tbody").find_all("tr")
    print(f"Total hymns found: {len(rows)}")

    hymns = []
    for i, row in enumerate(rows):
        try:
            cells = row.find_all("td")
            if len(cells) < 9:
                continue

            hymn_no = cells[0].get_text(strip=True)
            title = cells[1].get_text(strip=True)

            modal = cells[2].find("div", class_="modal-body")
            lyrics_raw = ""
            if modal:
                p_tag = modal.find("p")
                if p_tag:
                    lyrics_raw = p_tag.get_text()
            lyrics = clean_lyrics(lyrics_raw)

            def get_link(cell_idx: int) -> str:
                a = cells[cell_idx].find("a")
                if a and a.get("href"):
                    return BASE_URL.rstrip("/") + "/" + a["href"].lstrip("/")
                return ""

            hymns.append(
                {
                    "no": hymn_no,
                    "title": title,
                    "lyrics": lyrics,
                    "composer": cells[7].get_text(strip=True),
                    "key": cells[8].get_text(strip=True),
                    "scripture": cells[6].get_text(strip=True),
                    "pdf_url": get_link(3),
                    "pptx_url": get_link(4),
                    "midi_url": get_link(5),
                }
            )

            if (i + 1) % 50 == 0:
                print(f"Parsed {i + 1}/{len(rows)} hymns...")

        except Exception as e:
            print(f"Error parsing row {i + 1}: {e}")
            continue

    print(f"\nSuccessfully parsed {len(hymns)} hymns")
    return hymns


def save_jsonl(hymns: list[dict], output_path: Path) -> None:
    """Save hymns to JSONL file."""
    output_path.parent.mkdir(parents=True, exist_ok=True)
    with open(output_path, "w", encoding="utf-8") as f:
        for hymn in hymns:
            f.write(json.dumps(hymn, ensure_ascii=False) + "\n")
    print(f"Saved {len(hymns)} hymns to {output_path}")
    print(f"File size: {output_path.stat().st_size:,} bytes")


def download_file(url: str, dest: Path) -> str:
    """Download a single file. Returns 'ok', 'skip', or 'fail'."""
    if not url:
        return "skip"
    if dest.exists():
        return "skip"
    try:
        r = requests.get(url, timeout=30)
        if r.status_code == 200:
            dest.parent.mkdir(parents=True, exist_ok=True)
            with open(dest, "wb") as f:
                f.write(r.content)
            return "ok"
        return "fail"
    except Exception:
        return "fail"


def download_resources(hymns: list[dict], output_dir: Path) -> dict:
    """Download PDF, PPTX, and MIDI files."""
    pdf_dir = output_dir / "pdf"
    pptx_dir = output_dir / "pptx"
    midi_dir = output_dir / "midi"

    stats = {
        "pdf": {"ok": 0, "fail": 0, "skip": 0},
        "pptx": {"ok": 0, "fail": 0, "skip": 0},
        "midi": {"ok": 0, "fail": 0, "skip": 0},
    }

    total = len(hymns)
    for i, hymn in enumerate(hymns):
        for ftype, key, dir_path in [
            ("pdf", "pdf_url", pdf_dir),
            ("pptx", "pptx_url", pptx_dir),
            ("midi", "midi_url", midi_dir),
        ]:
            url = hymn[key]
            if url:
                fname = url.split("/")[-1]
                result = download_file(url, dir_path / fname)
                stats[ftype][result] += 1

        if (i + 1) % 20 == 0:
            print(f"Downloaded {i + 1}/{total}...")
        time.sleep(0.5)

    print("\n=== Download Summary ===")
    for ftype in ["pdf", "pptx", "midi"]:
        s = stats[ftype]
        print(
            f"{ftype.upper()}: {s['ok']} downloaded, {s['skip']} skipped, {s['fail']} failed"
        )

    return stats


def create_zip(
    hymns: list[dict], jsonl_path: Path, output_dir: Path, zip_path: Path
) -> None:
    """Create ZIP archive with JSONL and all resources."""
    print("Creating ZIP archive...")

    with zipfile.ZipFile(zip_path, "w", zipfile.ZIP_DEFLATED) as zf:
        zf.write(jsonl_path, jsonl_path.name)
        print(f"  Added: {jsonl_path.name}")

        for subdir in ["pdf", "pptx", "midi"]:
            dir_path = output_dir / subdir
            if dir_path.exists():
                count = 0
                for f in sorted(dir_path.iterdir()):
                    zf.write(f, f"{subdir}/{f.name}")
                    count += 1
                print(f"  Added: {count} {subdir.upper()}s")

    zip_size_mb = zip_path.stat().st_size / (1024 * 1024)
    print(f"\nZIP created: {zip_path.name}")
    print(f"Size: {zip_size_mb:.1f} MB")


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Scrape Tedim Hymns from tedimhymn.com"
    )
    parser.add_argument(
        "--output",
        "-o",
        type=str,
        default="data/tedim_hymns.jsonl",
        help="Output JSONL file path",
    )
    parser.add_argument(
        "--output-dir",
        "-d",
        type=str,
        default="data/tedim_hymns",
        help="Output directory for resources",
    )
    parser.add_argument(
        "--download-resources",
        action="store_true",
        help="Download PDF, PPTX, and MIDI files",
    )
    parser.add_argument(
        "--zip", action="store_true", help="Create ZIP archive of all files"
    )
    args = parser.parse_args()

    output_path = Path(args.output)
    output_dir = Path(args.output_dir)
    output_dir.mkdir(parents=True, exist_ok=True)

    # Fetch and parse
    html = fetch_main_page()
    hymns = parse_hymns(html)

    if not hymns:
        print("ERROR: No hymns found")
        return 1

    # Save JSONL
    save_jsonl(hymns, output_path)

    # Download resources
    if args.download_resources:
        download_resources(hymns, output_dir)

    # Create ZIP
    if args.zip:
        zip_path = output_dir / "tedim_hymns_complete.zip"
        create_zip(hymns, output_path, output_dir, zip_path)

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
