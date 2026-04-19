"""Zolai web crawler — discover, fetch, and extract Zolai text from the web."""
import hashlib
import json
import logging
import os
import re
import sqlite3
import time
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path
from typing import Callable, Dict, List, Optional

import httpx
from bs4 import BeautifulSoup

from ..config import CrawlerConfig, Paths
from ..shared.utils import ZolaiRecord, append_jsonl, is_zolai, zolai_density

log = logging.getLogger(__name__)

# Default Zolai search seeds
DEFAULT_SEEDS = [
    "Zolai language",
    "Tedim Chin",
    "Zomi language",
    "Pau Cin Hau",
    "Zolai dictionary",
    "Tedim Kam",
    "Zomi literature",
    "Zolai grammar",
    "Zolai Bible",
    "Zomi cultural",
]


class CrawlerState:
    """SQLite-backed crawler state for dedup and progress tracking."""

    def __init__(self, db_path: Path):
        self.db_path = db_path
        db_path.parent.mkdir(parents=True, exist_ok=True)
        self.conn = sqlite3.connect(str(db_path))
        self.conn.execute("PRAGMA journal_mode=WAL")
        self._init_tables()

    def _init_tables(self):
        self.conn.executescript("""
            CREATE TABLE IF NOT EXISTS crawled (
                url_hash TEXT PRIMARY KEY,
                url TEXT,
                domain TEXT,
                crawled_at REAL,
                status INTEGER,
                content_hash TEXT,
                size_bytes INTEGER
            );
            CREATE TABLE IF NOT EXISTS seeds (
                keyword TEXT PRIMARY KEY,
                added_at REAL,
                tried INTEGER DEFAULT 0,
                successes INTEGER DEFAULT 0
            );
            CREATE INDEX IF NOT EXISTS idx_crawled_domain ON crawled(domain);
        """)
        self.conn.commit()

    def is_crawled(self, url: str) -> bool:
        h = hashlib.sha256(url.encode()).hexdigest()[:16]
        cur = self.conn.execute("SELECT 1 FROM crawled WHERE url_hash=?", (h,))
        return cur.fetchone() is not None

    def mark_crawled(self, url: str, status: int, content_hash: str = "", size: int = 0):
        h = hashlib.sha256(url.encode()).hexdigest()[:16]
        domain = re.sub(r'https?://', '', url).split('/')[0]
        self.conn.execute(
            "INSERT OR REPLACE INTO crawled VALUES (?,?,?,?,?,?,?)",
            (h, url, domain, time.time(), status, content_hash, size)
        )
        self.conn.commit()

    def add_seed(self, keyword: str):
        self.conn.execute(
            "INSERT OR IGNORE INTO seeds VALUES (?,?,0,0)",
            (keyword, time.time())
        )
        self.conn.commit()

    def get_seeds(self) -> List[str]:
        cur = self.conn.execute("SELECT keyword FROM seeds")
        rows = cur.fetchall()
        return [r[0] for r in rows] if rows else DEFAULT_SEEDS

    def get_stats(self) -> dict:
        cur = self.conn.execute("SELECT COUNT(*), SUM(size_bytes) FROM crawled")
        row = cur.fetchone()
        return {
            "total_crawled": row[0] or 0,
            "total_bytes": row[1] or 0,
            "total_mb": round((row[1] or 0) / 1_048_576, 2),
        }

    def close(self):
        self.conn.close()


class WebFetcher:
    """HTTP fetcher with retry and rate limiting."""

    def __init__(self, config: CrawlerConfig):
        self.config = config
        self.client = httpx.Client(
            timeout=15,
            follow_redirects=True,
            headers={"User-Agent": config.user_agent},
        )

    def fetch(self, url: str) -> Optional[str]:
        try:
            resp = self.client.get(url)
            if resp.status_code == 200:
                return resp.text
            log.warning(f"HTTP {resp.status_code} for {url}")
        except Exception as e:
            log.warning(f"Fetch error for {url}: {e}")
        return None

    def close(self):
        self.client.close()


class ZolaiExtractor:
    """Extract Zolai text content from HTML."""

    def __init__(self, min_zolai_density: float = 0.15):
        self.min_density = min_zolai_density

    def extract(self, html: str, url: str = "") -> List[ZolaiRecord]:
        """Extract paragraphs of Zolai text from HTML."""
        soup = BeautifulSoup(html, 'lxml')

        # Remove noise
        for tag in soup.find_all(['script', 'style', 'nav', 'footer', 'header', 'aside']):
            tag.decompose()

        records = []
        for p in soup.find_all(['p', 'div', 'article', 'section', 'li']):
            text = p.get_text(separator=' ', strip=True)
            if len(text) < 20:
                continue
            if is_zolai(text, self.min_density):
                records.append(ZolaiRecord(
                    text=text,
                    source=url,
                    url=url,
                    lang="zolai",
                    quality=zolai_density(text),
                ))
        return records


class SearchEngine:
    """Discover Zolai content via DuckDuckGo search."""

    def __init__(self):
        self._client = None

    @property
    def client(self):
        if self._client is None:
            try:
                from duckduckgo_search import DDGS
                self._client = DDGS()
            except ImportError:
                log.warning("duckduckgo-search not installed")
                self._client = None
        return self._client

    def search(self, query: str, max_results: int = 10) -> List[str]:
        """Search and return URLs."""
        if not self.client:
            return []
        try:
            results = self.client.text(query, max_results=max_results)
            return [r['href'] for r in results if 'href' in r]
        except Exception as e:
            log.warning(f"Search error for '{query}': {e}")
            return []


class Crawler:
    """Main crawler orchestrator."""

    def __init__(self, paths: Paths, config: CrawlerConfig, log_callback: Optional[Callable] = None):
        self.paths = paths
        self.config = config
        self.log = log_callback or (lambda msg: log.info(msg))
        self.state = CrawlerState(paths.db)
        self.fetcher = WebFetcher(config)
        self.extractor = ZolaiExtractor()
        self.search = SearchEngine()
        self.output_file = paths.data_raw / "crawled.jsonl"

    def crawl_seed(self, seed: str, max_results: int = 10) -> dict:
        """Crawl a single seed keyword."""
        self.log(f"🔍 Searching: {seed}")
        urls = self.search.search(seed, max_results)
        stats = {"found": len(urls), "saved": 0, "skipped": 0, "errors": 0}

        for url in urls:
            if self.state.is_crawled(url):
                stats["skipped"] += 1
                continue

            self.log(f"  📥 {url[:80]}...")
            html = self.fetcher.fetch(url)
            if not html:
                self.state.mark_crawled(url, 0)
                stats["errors"] += 1
                continue

            records = self.extractor.extract(html, url)
            for rec in records:
                append_jsonl(rec, self.output_file)
                stats["saved"] += 1

            self.state.mark_crawled(url, 200, size=len(html))
            time.sleep(self.config.delay_seconds)

        self.log(f"  ✅ {seed}: {stats['saved']} records saved")
        return stats

    def run(self, seeds: Optional[List[str]] = None, max_loops: int = 1):
        """Run the crawler loop."""
        seeds = seeds or self.state.get_seeds()
        self.paths.ensure_dirs()
        total = {"saved": 0, "skipped": 0, "errors": 0}

        for loop in range(max_loops):
            self.log(f"🔄 Loop {loop+1}/{max_loops}")
            for seed in seeds:
                stats = self.crawl_seed(seed)
                total["saved"] += stats["saved"]
                total["skipped"] += stats["skipped"]
                total["errors"] += stats["errors"]

        self.log(f"🏁 Done: {total['saved']} saved, {total['skipped']} skipped, {total['errors']} errors")
        return total

    def close(self):
        self.fetcher.close()
        self.state.close()
