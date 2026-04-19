"""Zolai Toolkit — Web crawler engine (consolidated from zolai-smart-crawler)."""
import hashlib
import json
import logging
import re
import sqlite3
import time
from pathlib import Path
from typing import Any, Callable, Dict, List, Optional

import httpx
from bs4 import BeautifulSoup

from ..config import CrawlerConfig, Paths, config
from ..shared.utils import RAW_DIR, USER_AGENT, ZolaiRecord, append_jsonl, is_zolai, zolai_density

log = logging.getLogger(__name__)

# ── Default Zolai search seeds ────────────────────────────────────────────────
DEFAULT_SEEDS = [
    "Zolai language", "Tedim Chin", "Zomi language", "Pau Cin Hau",
    "Zolai dictionary", "Tedim Kam", "Zomi literature", "Zolai grammar",
    "Zolai Bible", "Zomi cultural", "Tedim Thutang", "Zomi Khanggui",
    "Chin State history", "Zogam culture", "Zomi Daily news",
]

# ── Zolai URL keywords ───────────────────────────────────────────────────────
ZOLAI_URL_KEYWORDS = [
    "zomi", "zolai", "tedim", "chin", "khanggui", "gelhmaan", "thutang",
    "laisiangtho", "zomipost", "zomidaily", "zobbc", "zogam", "zopau",
    "siangtho", "biakinn", "khodo", "leitung", "pasian",
]


# ══════════════════════════════════════════════════════════════════════════════
# CrawlerState — SQLite-backed URL tracking & dedup
# ══════════════════════════════════════════════════════════════════════════════

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
            CREATE TABLE IF NOT EXISTS saved_texts (
                hash TEXT PRIMARY KEY
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

    def has_saved_text(self, text: str) -> bool:
        h = hashlib.sha256(text.encode()).hexdigest()
        cur = self.conn.execute("SELECT 1 FROM saved_texts WHERE hash=?", (h,))
        return cur.fetchone() is not None

    def mark_saved_text(self, text: str):
        h = hashlib.sha256(text.encode()).hexdigest()
        self.conn.execute("INSERT OR IGNORE INTO saved_texts VALUES (?)", (h,))
        self.conn.commit()

    def add_seed(self, keyword: str):
        self.conn.execute("INSERT OR IGNORE INTO seeds VALUES (?,?,0,0)", (keyword, time.time()))
        self.conn.commit()

    def get_seeds(self) -> List[str]:
        cur = self.conn.execute("SELECT keyword FROM seeds")
        rows = cur.fetchall()
        return [r[0] for r in rows] if rows else DEFAULT_SEEDS

    def get_stats(self) -> dict:
        cur = self.conn.execute("SELECT COUNT(*), SUM(size_bytes) FROM crawled")
        row = cur.fetchone()
        saved = self.conn.execute("SELECT COUNT(*) FROM saved_texts").fetchone()[0]
        return {
            "total_crawled": row[0] or 0,
            "total_bytes": row[1] or 0,
            "total_mb": round((row[1] or 0) / 1_048_576, 2),
            "unique_texts_saved": saved,
        }

    def close(self):
        self.conn.close()


# ══════════════════════════════════════════════════════════════════════════════
# WebFetcher — async HTTP with httpx
# ══════════════════════════════════════════════════════════════════════════════

class WebFetcher:
    """HTTP fetcher with retry and rate limiting."""

    def __init__(self, crawler_config: Optional[CrawlerConfig] = None):
        self.config = crawler_config or config.crawler
        self.client = httpx.Client(
            timeout=15,
            follow_redirects=True,
            headers={"User-Agent": self.config.user_agent or USER_AGENT},
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

    async def fetch_async(self, url: str) -> Optional[str]:
        try:
            async with httpx.AsyncClient(
                timeout=15, follow_redirects=True,
                headers={"User-Agent": self.config.user_agent or USER_AGENT}
            ) as client:
                resp = await client.get(url)
                if resp.status_code == 200:
                    return resp.text
        except Exception as e:
            log.warning(f"Async fetch error for {url}: {e}")
        return None

    def close(self):
        self.client.close()


# ══════════════════════════════════════════════════════════════════════════════
# ZolaiExtractor — HTML → Zolai text
# ══════════════════════════════════════════════════════════════════════════════

class ZolaiExtractor:
    """Extract Zolai text content from HTML."""

    def __init__(self, min_zolai_density: float = 0.15):
        self.min_density = min_zolai_density

    def extract(self, html: str, url: str = "") -> List[ZolaiRecord]:
        """Extract paragraphs of Zolai text from HTML."""
        soup = BeautifulSoup(html, 'lxml')
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


# ══════════════════════════════════════════════════════════════════════════════
# SearchEngine — DuckDuckGo-based discovery
# ══════════════════════════════════════════════════════════════════════════════

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


# ══════════════════════════════════════════════════════════════════════════════
# SeedManager — dynamic seed management
# ══════════════════════════════════════════════════════════════════════════════

class SeedManager:
    """Dynamic seed store for crawler."""

    def __init__(self, paths: Paths):
        self.seeds_file = paths.root / "config" / "seeds.json"
        self.seeds_file.parent.mkdir(parents=True, exist_ok=True)

    def _load(self) -> Dict:
        if self.seeds_file.exists():
            try:
                return json.loads(self.seeds_file.read_text())
            except Exception:
                pass
        return {"user_seeds": [], "rich_seeds": []}

    def _save(self, data: Dict):
        self.seeds_file.write_text(json.dumps(data, indent=2, ensure_ascii=False))

    def get_seeds(self, include_defaults: bool = True) -> List[str]:
        data = self._load()
        user = data.get("user_seeds", [])
        if not user and include_defaults:
            return list(DEFAULT_SEEDS)
        seen = {s.lower() for s in user}
        result = list(user)
        if include_defaults:
            for d in DEFAULT_SEEDS:
                if d.lower() not in seen:
                    result.append(d)
                    seen.add(d.lower())
        return result

    def add_seed(self, seed: str) -> bool:
        seed = seed.strip()
        if not seed:
            return False
        data = self._load()
        user = data.get("user_seeds", [])
        if any(s.lower() == seed.lower() for s in user):
            return False
        user.append(seed)
        data["user_seeds"] = user
        self._save(data)
        return True

    def extract_seeds_from_text(self, text: str, max_results: int = 10) -> List[str]:
        """Extract potential seed keywords from text."""
        candidates = []
        seen = set()
        # Multi-word proper nouns
        for m in re.finditer(r'\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,2})\b', text):
            key = m.group(1).lower()
            if key not in seen and len(key) > 5:
                candidates.append(m.group(1))
                seen.add(key)
        # Zolai-specific terms
        for m in re.finditer(r'\b((?:Zolai|Zomi|Tedim|Chin|Zogam)\s+[A-Za-z][a-z]+)\b', text, re.IGNORECASE):
            key = m.group(1).lower()
            if key not in seen:
                candidates.append(m.group(1))
                seen.add(key)
        return candidates[:max_results]


# ══════════════════════════════════════════════════════════════════════════════
# CrawlEngine — main crawler orchestrator
# ══════════════════════════════════════════════════════════════════════════════

class CrawlEngine:
    """
    Main web crawler engine.

    Provides:
      - crawl_url: Fetch and extract Zolai text from a single URL
      - crawl_seeds: Search + crawl for a list of seed keywords
      - infinite_loop: Continuous discovery loop with seed management
    """

    def __init__(self, output_dir: Optional[Path] = None, crawler_config: Optional[CrawlerConfig] = None,
                 log_callback: Optional[Callable] = None):
        self.paths = config.paths
        self.config = crawler_config or config.crawler
        self.output_dir = output_dir or RAW_DIR
        self.output_dir.mkdir(parents=True, exist_ok=True)
        self.log = log_callback or (lambda msg: log.info(msg))

        self.state = CrawlerState(self.paths.db)
        self.fetcher = WebFetcher(self.config)
        self.extractor = ZolaiExtractor()
        self.search = SearchEngine()
        self.seed_manager = SeedManager(self.paths)
        self.output_file = self.output_dir / "crawled.jsonl"

    def crawl_url(self, url: str) -> Optional[List[ZolaiRecord]]:
        """
        Crawl a single URL and return extracted Zolai records.

        Args:
            url: The URL to fetch.

        Returns:
            List of ZolaiRecord objects, or None on fetch failure.
        """
        if self.state.is_crawled(url):
            self.log(f"  ⏭️ Already crawled: {url[:80]}")
            return None

        self.log(f"  📥 Fetching: {url[:80]}...")
        html = self.fetcher.fetch(url)
        if not html:
            self.state.mark_crawled(url, 0)
            return None

        records = self.extractor.extract(html, url)
        saved = []
        for rec in records:
            if not self.state.has_saved_text(rec.text):
                append_jsonl(rec, self.output_file)
                self.state.mark_saved_text(rec.text)
                saved.append(rec)

        content_hash = hashlib.md5(html.encode()).hexdigest()[:16]
        self.state.mark_crawled(url, 200, content_hash, len(html))
        self.log(f"  ✅ {len(saved)} Zolai records saved from {url[:60]}")
        return saved

    def crawl_seed(self, seed: str, max_results: int = 10) -> Dict[str, int]:
        """
        Search for a seed keyword and crawl the resulting URLs.

        Args:
            seed: Search keyword/query.
            max_results: Maximum search results to crawl.

        Returns:
            Dict with found/saved/skipped/errors counts.
        """
        self.log(f"🔍 Searching: {seed}")
        urls = self.search.search(seed, max_results=max_results)
        stats = {"found": len(urls), "saved": 0, "skipped": 0, "errors": 0}

        for url in urls:
            records = self.crawl_url(url)
            if records is None:
                if self.state.is_crawled(url):
                    stats["skipped"] += 1
                else:
                    stats["errors"] += 1
            else:
                stats["saved"] += len(records)
            time.sleep(self.config.delay_seconds)

        self.log(f"  ✅ {seed}: {stats['saved']} records saved")
        return stats

    def crawl_seeds(self, seeds: Optional[List[str]] = None, max_loops: int = 1) -> Dict[str, int]:
        """
        Crawl multiple seed keywords.

        Args:
            seeds: List of search keywords. Uses defaults if None.
            max_loops: Number of passes through the seed list.

        Returns:
            Aggregate stats dict.
        """
        seeds = seeds or self.seed_manager.get_seeds()
        self.paths.ensure_dirs()
        total = {"saved": 0, "skipped": 0, "errors": 0}

        for loop in range(max_loops):
            self.log(f"🔄 Loop {loop + 1}/{max_loops}")
            for seed in seeds:
                stats = self.crawl_seed(seed)
                total["saved"] += stats["saved"]
                total["skipped"] += stats["skipped"]
                total["errors"] += stats["errors"]

        self.log(f"🏁 Done: {total['saved']} saved, {total['skipped']} skipped, {total['errors']} errors")
        return total

    def infinite_loop(self, stop_event=None, extra_seeds: Optional[List[str]] = None):
        """
        Continuous discovery loop. Runs until stop_event is set.

        Args:
            stop_event: threading.Event to signal stop.
            extra_seeds: Additional seeds from GUI or caller.
        """
        import threading
        if stop_event is None:
            stop_event = threading.Event()

        current_seeds = list(dict.fromkeys(
            list(extra_seeds or []) + self.seed_manager.get_seeds()
        ))
        self.log(f"🚀 INFINITE DISCOVERY STARTING ({len(current_seeds)} seeds)")

        wave = 0
        while not stop_event.is_set():
            wave += 1
            self.log(f"\n🌊 WAVE {wave}: {len(current_seeds)} seeds")
            self.crawl_seeds(current_seeds[:5])

            if stop_event.is_set():
                break

            # Re-seed from seed manager
            current_seeds = self.seed_manager.get_seeds()
            for _ in range(5):
                if stop_event.is_set():
                    break
                time.sleep(1)

        self.log("🛑 Infinite run stopped.")

    def get_stats(self) -> Dict[str, Any]:
        """Get crawler statistics."""
        state_stats = self.state.get_stats()
        return {
            **state_stats,
            "output_file": str(self.output_file),
            "output_dir": str(self.output_dir),
        }

    def close(self):
        """Clean up resources."""
        self.fetcher.close()
        self.state.close()


# ══════════════════════════════════════════════════════════════════════════════
# Convenience function
# ══════════════════════════════════════════════════════════════════════════════

def crawl_from_sources(seeds: Optional[List[str]] = None, limit: int = 50) -> Path:
    """Run crawl from seeds. Returns output path."""
    engine = CrawlEngine()
    try:
        results = engine.crawl_seeds(seeds or DEFAULT_SEEDS[:limit])
        print(f"Crawl complete: {results['saved']} Zolai records saved")
        return engine.output_file
    finally:
        engine.close()
