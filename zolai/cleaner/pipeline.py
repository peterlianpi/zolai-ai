"""Zolai Toolkit — Data cleaner, normalizer, and deduplicator (consolidated from zomi-ai & zolai-smart-crawler)."""
import hashlib
import json
import logging
import re
import unicodedata
from datetime import datetime
from pathlib import Path
from typing import Any, Dict, List, Optional, Set, Tuple

from ..config import CleanerConfig, config
from ..shared.utils import (
    CLEANED_DIR,
    MIN_ZOLAI_DENSITY,
    ZolaiNormalizer,
    is_zolai,
    read_jsonl,
    save_json,
    zolai_density,
)

logger = logging.getLogger(__name__)

# ══════════════════════════════════════════════════════════════════════════════
# OCR Correction Rules (from zolai-smart-crawler cleaner.py)
# ══════════════════════════════════════════════════════════════════════════════

_OCR_RULES = [
    # Glottal stop normalization
    (re.compile(r'[\u2018\u2019\u02BC\u2032\u0060]'), "'"),
    # Zolai digraph repair (only before vowels)
    (re.compile(r'\b(k) (h)(?=[aeiouAEIOU])', re.IGNORECASE), r'\1\2'),
    (re.compile(r'\b(n) (g)(?=[aeiouAEIOU])', re.IGNORECASE), r'\1\2'),
    (re.compile(r'\b(t) (h)(?=[aeiouAEIOU])', re.IGNORECASE), r'\1\2'),
    (re.compile(r'\b(h) (l)(?=[aeiouAEIOU])', re.IGNORECASE), r'\1\2'),
    (re.compile(r'\b(p) (h)(?=[aeiouAEIOU])', re.IGNORECASE), r'\1\2'),
    # h1 → hi
    (re.compile(r'(?<!\w)h1(?!\w)'), 'hi'),
    # Common OCR confusions
    (re.compile(r'\bZ0mi\b'), 'Zomi'),
    (re.compile(r'\bZ0lai\b'), 'Zolai'),
    (re.compile(r'\bPas1an\b'), 'Pasian'),
    (re.compile(r'\bTed1m\b'), 'Tedim'),
    # Smart-quote / HTML entity artefacts
    (re.compile(r'\u2019|\u2018'), "'"),
    (re.compile(r'â€™'), "'"),
    (re.compile(r'â€œ'), '"'),
    (re.compile(r'â€\x9d'), '"'),
    (re.compile(r'&amp;'), '&'),
    (re.compile(r'&lt;'), '<'),
    (re.compile(r'&gt;'), '>'),
    (re.compile(r'&nbsp;'), ' '),
]

# Boilerplate patterns
_BOILERPLATE_PHRASES = [
    r'share\s+this', r'leave\s+a\s+comment', r'related\s+post',
    r'you\s+may\s+also\s+like', r'click\s+here\s+to', r'subscribe\s+to',
    r'follow\s+us\s+on', r'copyright\s+\d{4}', r'all\s+rights\s+reserved',
    r'terms\s+of\s+(use|service)', r'privacy\s+policy', r'cookie\s+policy',
    r'read\s+more', r'powered\s+by\s+wordpress', r'skip\s+to\s+(main\s+)?content',
    r'load\s+more', r'view\s+all\s+comments', r'home\s*\|\s*about',
]
_BOILERPLATE_RE = re.compile('(' + '|'.join(_BOILERPLATE_PHRASES) + ')', re.IGNORECASE)

# Sentence-ending regex
_SENT_END = re.compile(r'([.!?|\u104a])\s{2,}')


# ══════════════════════════════════════════════════════════════════════════════
# Dialect filters (from zomi-ai normalizer.py)
# ══════════════════════════════════════════════════════════════════════════════

_MIZO_PATTERNS = [re.compile(p, re.IGNORECASE) for p in [
    r'\bhmeichhia\b', r'\bmipa\b', r'\bchuan\b', r'\bnghei\b',
    r'\bhnam\b', r'\bzawh\b', r'\bengtik\b', r'\bnia\b',
    r'\bnih\b', r'\bchu\b', r'\bhian\b', r'\btih\b', r'\bpawh\b',
]]
_FALAM_PATTERNS = [re.compile(p, re.IGNORECASE) for p in [
    r'\bsuall\b', r'\brilru\b', r'\bttha\b', r'\bngaih\b',
]]


# ══════════════════════════════════════════════════════════════════════════════
# TextCleaner — normalize, OCR correct, boilerplate remove
# ══════════════════════════════════════════════════════════════════════════════

class TextCleaner:
    """Clean and normalize raw text data."""

    def __init__(self):
        self.normalizer = ZolaiNormalizer()
        self.stats = {
            "input": 0, "output": 0, "filtered_short": 0,
            "filtered_non_zolai": 0, "deduped": 0, "ocr_corrected": 0,
        }

    def _apply_ocr_corrections(self, text: str) -> str:
        """Apply OCR correction rules."""
        for pattern, repl in _OCR_RULES:
            text = pattern.sub(repl, text)
        return text

    def _remove_boilerplate(self, text: str) -> str:
        """Remove boilerplate lines."""
        lines = text.splitlines()
        return '\n'.join(ln for ln in lines if not _BOILERPLATE_RE.search(ln))

    def _remove_noisy_lines(self, text: str, threshold: float = 0.30) -> str:
        """Strip lines with too many non-letter symbols."""
        lines = text.splitlines()
        clean = []
        for ln in lines:
            if not ln.strip():
                clean.append(ln)
                continue
            if len(ln.strip()) < 5:
                continue
            letters = sum(c.isalpha() for c in ln)
            if (1.0 - letters / len(ln.strip())) <= threshold:
                clean.append(ln)
        return '\n'.join(clean)

    def clean_text(self, text: str) -> str:
        """Full cleaning pipeline for a single text block."""
        # Unicode normalize
        text = unicodedata.normalize("NFKC", text)
        # OCR corrections
        text = self._apply_ocr_corrections(text)
        # Remove noisy lines
        text = self._remove_noisy_lines(text)
        # Remove boilerplate
        text = self._remove_boilerplate(text)
        # URL removal
        text = re.sub(r'https?://\S+', '', text)
        # Email removal
        text = re.sub(r'\S+@\S+\.\S+', '', text)
        # Excessive punctuation
        text = re.sub(r'[!]{3,}', '!', text)
        text = re.sub(r'[?]{3,}', '?', text)
        text = re.sub(r'[.]{4,}', '...', text)
        # Standard normalize
        text = self.normalizer.normalize(text)
        return text.strip()

    def sentence_split(self, text: str) -> List[str]:
        """Split text into sentences."""
        sentences = re.split(r'(?<=[.!?])\s+', text)
        return [s.strip() for s in sentences if s.strip()]

    def extract_sentences(self, text: str, min_len: int = 10, max_len: int = 5000) -> List[str]:
        """Extract clean sentences from text."""
        cleaned = self.clean_text(text)
        sentences = self.sentence_split(cleaned)
        return [s for s in sentences if min_len <= len(s.split()) <= max_len]

    def check_purity(self, text: str) -> Tuple[bool, Dict]:
        """Check dialect purity (Mizo/Falam contamination)."""
        text_lower = text.lower()
        mizo_hits = sum(1 for p in _MIZO_PATTERNS if p.search(text_lower))
        falam_hits = sum(1 for p in _FALAM_PATTERNS if p.search(text_lower))
        pure = falam_hits == 0 and mizo_hits <= 1
        return pure, {"mizo_hits": mizo_hits, "falam_hits": falam_hits}


# ══════════════════════════════════════════════════════════════════════════════
# ZolaiFilter — content quality scoring
# ══════════════════════════════════════════════════════════════════════════════

class ZolaiFilter:
    """Filter content to keep only Zolai text with quality scoring."""

    def __init__(self, min_density: float = MIN_ZOLAI_DENSITY):
        self.min_density = min_density

    def score(self, text: str) -> float:
        """Calculate Zolai density score (0-1)."""
        return zolai_density(text)

    def is_zolai(self, text: str) -> bool:
        """Check if text passes Zolai threshold."""
        return is_zolai(text, self.min_density)

    def filter_records(self, records: List[Dict], text_field: str = "text") -> List[Dict]:
        """Filter records keeping only Zolai content."""
        return [r for r in records if self.is_zolai(r.get(text_field, ""))]


# ══════════════════════════════════════════════════════════════════════════════
# Deduplicator — exact + fuzzy dedup
# ══════════════════════════════════════════════════════════════════════════════

class Deduplicator:
    """Remove duplicate content using hashing and n-gram similarity."""

    def __init__(self, similarity_threshold: float = 0.85):
        self.threshold = similarity_threshold
        self.seen_hashes: Set[str] = set()
        self.seen_texts: List[str] = []

    def _hash(self, text: str) -> str:
        normalized = re.sub(r'\s+', ' ', text.lower().strip())
        return hashlib.md5(normalized.encode()).hexdigest()

    @staticmethod
    def _get_ngrams(text: str, n: int = 3) -> Set[str]:
        text = text.lower().strip()
        return set(text[i:i + n] for i in range(len(text) - n + 1))

    def is_duplicate(self, text: str) -> bool:
        """Check if text is a duplicate (exact hash)."""
        h = self._hash(text)
        if h in self.seen_hashes:
            return True
        self.seen_hashes.add(h)
        return False

    def exact_dedup(self, records: List[Dict], text_field: str = "text") -> List[Dict]:
        """Exact deduplication by content hash."""
        unique = []
        for record in records:
            text = record.get(text_field, "")
            if not self.is_duplicate(text):
                unique.append(record)
        return unique

    def near_dedup(self, records: List[Dict], text_field: str = "text") -> List[Dict]:
        """Near-duplicate removal using n-gram overlap."""
        unique = []
        for record in records:
            text = record.get(text_field, "")
            text_ngrams = self._get_ngrams(text, 3)
            is_dup = False
            for existing in self.seen_texts:
                existing_ngrams = self._get_ngrams(existing, 3)
                if text_ngrams and existing_ngrams:
                    overlap = len(text_ngrams & existing_ngrams) / max(len(text_ngrams), len(existing_ngrams), 1)
                    if overlap >= self.threshold:
                        is_dup = True
                        break
            if not is_dup:
                self.seen_texts.append(text)
                unique.append(record)
        return unique

    def load_existing(self, path: Path):
        """Pre-load hashes from existing file."""
        if not path.exists():
            return
        try:
            with open(path, 'r', encoding='utf-8') as f:
                for line in f:
                    try:
                        rec = json.loads(line)
                        text = rec.get("text", "")
                        self.seen_hashes.add(self._hash(text))
                    except (json.JSONDecodeError, KeyError):
                        pass
        except Exception:
            pass


# ══════════════════════════════════════════════════════════════════════════════
# CleanPipeline — full cleaning pipeline
# ══════════════════════════════════════════════════════════════════════════════

class CleanPipeline:
    """
    Full cleaning pipeline: normalize → clean → filter → dedup.

    Usage:
        pipe = CleanPipeline()
        output_path = pipe.run(input_path)
    """

    def __init__(self, output_dir: Optional[Path] = None, config: Optional[CleanerConfig] = None,
                 log_callback: Optional = None):
        self.paths_config = config
        self.output_dir = output_dir or CLEANED_DIR
        self.output_dir.mkdir(parents=True, exist_ok=True)
        self.cleaner = TextCleaner()
        self.filter = ZolaiFilter()
        self.deduper = Deduplicator()
        self.log = log_callback or (lambda msg: logger.info(msg))
        self.stats: Dict[str, Any] = {
            "input_records": 0, "cleaned": 0, "zolai_filtered": 0,
            "deduped": 0, "final": 0, "rejected_short": 0,
            "rejected_not_zolai": 0, "rejected_duplicate": 0,
            "rejected_dialect": 0, "errors": 0,
        }

    def run(self, input_path: Path, output_filename: Optional[str] = None) -> Path:
        """
        Run the full pipeline on an input file.

        Args:
            input_path: Path to JSONL, JSON, or plain text file.
            output_filename: Output filename (auto-generated if None).

        Returns:
            Path to output file.
        """
        self.log(f"📂 Loading data from {input_path}")

        # Load data
        if input_path.suffix == ".jsonl":
            records = load_jsonl_compat(input_path)
        elif input_path.suffix == ".json":
            data = json.loads(input_path.read_text())
            records = data if isinstance(data, list) else [data]
        else:
            text = input_path.read_text(encoding="utf-8")
            sentences = self.cleaner.extract_sentences(text)
            records = [{"text": s} for s in sentences]

        self.stats["input_records"] = len(records)
        self.log(f"Loaded {len(records)} records")

        # Clean
        cleaned = []
        for r in records:
            text = r.get("text", r.get("content", ""))
            if not text or len(text.strip()) < 10:
                self.stats["rejected_short"] += 1
                continue
            clean = self.cleaner.clean_text(text)
            if clean:
                r["text"] = clean
                cleaned.append(r)
            else:
                self.stats["errors"] += 1
        self.stats["cleaned"] = len(cleaned)

        # Dialect purity filter
        pure = []
        for r in cleaned:
            is_pure, _ = self.cleaner.check_purity(r["text"])
            if is_pure:
                pure.append(r)
            else:
                self.stats["rejected_dialect"] += 1
        cleaned = pure

        # Zolai filter
        zolai_only = self.filter.filter_records(cleaned)
        self.stats["zolai_filtered"] = len(zolai_only)
        self.stats["rejected_not_zolai"] = len(cleaned) - len(zolai_only)
        self.log(f"Zolai filter: {len(cleaned)} → {len(zolai_only)}")

        # Dedup
        deduped = self.deduper.exact_dedup(zolai_only)
        self.stats["deduped"] = len(deduped)
        self.stats["rejected_duplicate"] = len(zolai_only) - len(deduped)

        # Save
        if not output_filename:
            output_filename = f"cleaned_{datetime.now().strftime('%Y%m%d_%H%M%S')}.jsonl"
        output_path = self.output_dir / output_filename
        save_jsonl_compat(deduped, output_path)
        self.stats["final"] = len(deduped)

        # Save stats
        stats_path = self.output_dir / "clean_stats.json"
        save_json(self.stats, stats_path)
        self.log(f"✅ Pipeline complete: {self.stats['final']} records → {output_path.name}")
        return output_path

    def run_full_pipeline(self) -> Dict[str, Any]:
        """Run pipeline on all raw data files."""
        raw_dir = config.paths.data_raw
        output_path = self.output_dir / "cleaned_corpus.jsonl"

        self.deduper.load_existing(output_path)
        existing = read_jsonl(output_path)
        self.log(f"📂 Loaded {len(existing)} existing cleaned records")

        for fpath in sorted(raw_dir.glob("*.jsonl")):
            self.log(f"🧹 Cleaning: {fpath.name}")
            try:
                self.run(fpath, output_filename=None)
            except Exception as e:
                self.log(f"⚠️ Error cleaning {fpath.name}: {e}")
                self.stats["errors"] += 1

        return self.stats

    def get_stats(self) -> Dict[str, Any]:
        return self.stats.copy()


# ══════════════════════════════════════════════════════════════════════════════
# Compatibility helpers
# ══════════════════════════════════════════════════════════════════════════════

def load_jsonl_compat(path: Path) -> List[Dict]:
    """Load JSONL as list of dicts."""
    records = []
    if not path.exists():
        return records
    with open(path, 'r', encoding='utf-8') as f:
        for line in f:
            line = line.strip()
            if line:
                try:
                    records.append(json.loads(line))
                except json.JSONDecodeError:
                    pass
    return records


def save_jsonl_compat(records: List[Dict], path: Path):
    """Save list of dicts to JSONL."""
    path.parent.mkdir(parents=True, exist_ok=True)
    with open(path, 'w', encoding='utf-8') as f:
        for r in records:
            f.write(json.dumps(r, ensure_ascii=False) + '\n')
