"""Shared Zolai language utilities — consolidated from zolai-smart-crawler, zomi-ai, zolai-linguist."""
import json
import logging
import re
import unicodedata
from dataclasses import asdict, dataclass
from pathlib import Path
from typing import Dict, List, Optional, Set

logger = logging.getLogger(__name__)

# ── Paths ─────────────────────────────────────────────────────────────────────
ROOT_DIR = Path.home() / "Documents" / "Projects" / "zolai-toolkit"
DATA_DIR = Path.home() / "Documents" / "Projects" / "data"
RAW_DIR = DATA_DIR / "raw"
CLEANED_DIR = DATA_DIR / "cleaned"
TRAINING_DIR = DATA_DIR / "training"
KNOWLEDGE_DIR = DATA_DIR / "knowledge"
ARCHIVE_DIR = DATA_DIR / "archive"
DB_PATH = DATA_DIR / "crawler.db"

# Ensure directories exist
for d in [RAW_DIR, CLEANED_DIR, TRAINING_DIR, KNOWLEDGE_DIR, ARCHIVE_DIR]:
    d.mkdir(parents=True, exist_ok=True)

# ── Config constants ──────────────────────────────────────────────────────────
MIN_SENTENCE_LENGTH = 10
MAX_SENTENCE_LENGTH = 5000
DUP_SIMILARITY_THRESHOLD = 0.85
MIN_ZOLAI_DENSITY = 0.3
USER_AGENT = "ZolaiToolkit/1.0 (Language Research)"


# ══════════════════════════════════════════════════════════════════════════════
# Data types
# ══════════════════════════════════════════════════════════════════════════════

@dataclass
class ZolaiRecord:
    """A single Zolai text record."""
    text: str
    source: str = ""
    url: str = ""
    lang: str = "zolai"
    quality: float = 0.0
    meta: dict = None

    def to_json(self) -> str:
        d = asdict(self)
        if d["meta"] is None:
            d["meta"] = {}
        return json.dumps(d, ensure_ascii=False)

    @classmethod
    def from_json(cls, line: str) -> "ZolaiRecord":
        d = json.loads(line)
        return cls(**d)


# ══════════════════════════════════════════════════════════════════════════════
# Normalizer (LT Tuang / ZCLS standard)
# ══════════════════════════════════════════════════════════════════════════════

class ZolaiNormalizer:
    """Normalizes raw Zolai text according to Standard Zolai Format (LT Tuang)."""

    SPELLING_CORRECTIONS = {
        r'\btautak\b': 'tawk nawi',
        r'\bsamtu\b': 'samtual',
        r'\bkumzawl\b': 'kumzaul',
        r'\bzawl\b': 'zaul',
        r'\bnauntak\b': 'nawn tawk',
    }

    PUNCTUATION_RULES = {
        r'([.!?])\s*([A-Z])': r'\1 \2',
        r'\s+': ' ',
    }

    def __init__(self):
        self.correction_patterns = [
            (re.compile(k, re.IGNORECASE), v) for k, v in self.SPELLING_CORRECTIONS.items()
        ]
        self.punct_patterns = [
            (re.compile(k), v) for k, v in self.PUNCTUATION_RULES.items()
        ]

    def normalize(self, text: str) -> str:
        """Full normalization pipeline."""
        text = unicodedata.normalize('NFC', text)
        for pattern, replacement in self.correction_patterns:
            text = pattern.sub(replacement, text)
        for pattern, replacement in self.punct_patterns:
            text = pattern.sub(replacement, text)
        return text.strip()


# ══════════════════════════════════════════════════════════════════════════════
# Text normalization (legacy-compatible API)
# ══════════════════════════════════════════════════════════════════════════════

_NORMALIZER = ZolaiNormalizer()

def normalize_text(text: str) -> str:
    """Normalize Zolai text (convenience function)."""
    return _NORMALIZER.normalize(text)


def clean_content(content: str) -> str:
    """Basic cleaning for Zolai text."""
    content = content.replace("Back to top", "")
    content = " ".join(content.split())
    lines = [line.strip() for line in content.split('\n') if len(line.strip()) > 10]
    return '\n'.join(lines).strip()


# ══════════════════════════════════════════════════════════════════════════════
# Zolai language detection
# ══════════════════════════════════════════════════════════════════════════════

# Myanmar/Burmese script rejection
_MYANMAR_RE = re.compile(r"[\u1000-\u109F]")

# Strong Zolai tokens (weight 3)
STRONG_TOKENS: Set[str] = {
    "mahmah", "pasian", "ahih", "uhhi", "cih", "ding", "nading",
    "khang", "zia", "ngeina", "thupha", "topa", "zomi", "zolai",
    "tedim", "gelhmaan", "khanggui", "thutang", "leitung", "khangthak",
    "biakinn", "nungta", "suak", "kipat", "khempeuh", "tawh", "khua", "piakna",
}

# Medium tokens (weight 2)
MEDIUM_TOKENS: Set[str] = {
    "leh", "hih", "nuai", "tung", "zong", "mi", "vua", "thei",
    "khat", "pan", "thu", "pua", "tua", "sia", "inn", "suang",
    "gam", "cil", "om", "ngah", "lam", "hen", "tate", "kam", "pu", "nu", "pa",
}

# Weak tokens (weight 1)
WEAK_TOKENS: Set[str] = {
    "hi", "in", "na", "ah", "te", "teh", "pi", "a",
}

# Full set for fast lookup
ALL_ZOLAI_LOWER: Set[str] = {t.lower() for t in (STRONG_TOKENS | MEDIUM_TOKENS | WEAK_TOKENS)}
ZOLAI_CORE: Set[str] = STRONG_TOKENS | MEDIUM_TOKENS

# Zolai density function words (top-50 from zolai_density.py)
ZOLAI_FUNCTION_WORDS: List[str] = [
    "ding", "hong", "ciangin", "tawh", "sinna", "khat", "zolai", "zong",
    "thei", "nuai", "bang", "gelh", "pasian", "zomi", "kammal", "mahmah",
    "zomite", "inla", "khua", "gentehna",
    "hi", "uh", "ka", "na", "ah", "lo", "leh", "kei", "le", "ci",
    "om", "ni", "tua", "lai", "te", "pen", "ki", "tui", "thu", "hih",
    "nei", "pai", "kum", "pau", "cih", "gam", "sim", "sa", "aw", "ta",
]
_ZOLAI_FUNCTION_SET: Set[str] = {w.lower() for w in ZOLAI_FUNCTION_WORDS}

_WORD_RE = re.compile(r"[a-zA-Z]+")

# Danish/Zola blacklist
_DANISH_BLACKLIST: Set[str] = {
    "jeg", "det", "ikke", "er", "en", "et", "han", "hun", "vi", "de",
    "og", "at", "var", "for", "med", "som", "men", "fra", "til", "om",
    "fashion", "boutique", "dress", "gown", "bridal", "wedding",
}


def zolai_density(text: str) -> float:
    """Estimate Zolai content density (0.0–1.0)."""
    if not text or not text.strip():
        return 0.0
    tokens = _WORD_RE.findall(text.lower())
    if not tokens:
        return 0.0
    kw_hits = sum(1 for t in tokens if t in _ZOLAI_FUNCTION_SET)
    strong = sum(1 for t in tokens if any(pat in t for pat in STRONG_TOKENS))
    medium = sum(1 for t in tokens if t in MEDIUM_TOKENS)
    weak = sum(1 for t in tokens if t in WEAK_TOKENS)
    weighted = strong * 3 + medium * 2 + weak
    return round(weighted / len(tokens), 5)


def is_zolai(text: str, threshold: float = 0.012) -> bool:
    """Check if text is likely Zolai/Zomi/Tedim."""
    if not text or not text.strip():
        return False
    if _MYANMAR_RE.search(text):
        return False
    tokens = _WORD_RE.findall(text.lower())
    if not tokens:
        return False
    bl_count = sum(1 for t in tokens if t in _DANISH_BLACKLIST)
    if bl_count >= 3:
        return False
    strong_count = sum(1 for t in tokens if any(pat in t for pat in STRONG_TOKENS))
    distinct_strong = set()
    for t in tokens:
        for pat in STRONG_TOKENS:
            if pat in t:
                distinct_strong.add(pat)
                break
    if len(distinct_strong) < 2:
        return False
    strong_count_val = sum(1 for t in tokens if any(pat in t for pat in STRONG_TOKENS))
    if strong_count_val < 2:
        weighted = sum(
            1 for t in tokens if any(pat in t for pat in STRONG_TOKENS)
        ) * 3 + sum(1 for t in tokens if t in MEDIUM_TOKENS) * 2 + sum(1 for t in tokens if t in WEAK_TOKENS)
        if weighted < 5:
            return False
    density = zolai_density(text)
    min_density = 0.009 if len(text) > 300 else 0.012
    return density >= min_density


# Legacy alias
is_zolai_text = is_zolai


# ══════════════════════════════════════════════════════════════════════════════
# URL filtering
# ══════════════════════════════════════════════════════════════════════════════

_ZOLAI_URL_PATTERNS = [
    "zolai", "zomi", "tedim", "chin", "khamt", "paucin", "mizo",
    "burma", "myanmar", "tiddim", "gelh", "khanggui", "thutang",
]
_BLOCKED_URL_PATTERNS = [
    "facebook.com", "twitter.com", "instagram.com", "tiktok.com",
    "youtube.com/watch", "amazon.com", "ebay.com", "pinterest.com",
]


def is_zolai_url(url: str) -> bool:
    """Check if URL is likely to contain Zolai content."""
    url_lower = url.lower()
    if any(b in url_lower for b in _BLOCKED_URL_PATTERNS):
        return False
    return any(p in url_lower for p in _ZOLAI_URL_PATTERNS)


# ══════════════════════════════════════════════════════════════════════════════
# I/O helpers
# ══════════════════════════════════════════════════════════════════════════════

def read_jsonl(path: Path) -> List[ZolaiRecord]:
    """Read a JSONL file into records."""
    records = []
    if not path.exists():
        return records
    with open(path, 'r', encoding='utf-8') as f:
        for line in f:
            line = line.strip()
            if line:
                try:
                    records.append(ZolaiRecord.from_json(line))
                except (json.JSONDecodeError, TypeError):
                    pass
    return records


def write_jsonl(records: List[ZolaiRecord], path: Path):
    """Write records to a JSONL file."""
    path.parent.mkdir(parents=True, exist_ok=True)
    with open(path, 'w', encoding='utf-8') as f:
        for r in records:
            f.write(r.to_json() + '\n')


def append_jsonl(record: ZolaiRecord, path: Path):
    """Append a single record to a JSONL file."""
    path.parent.mkdir(parents=True, exist_ok=True)
    with open(path, 'a', encoding='utf-8') as f:
        f.write(record.to_json() + '\n')


def load_jsonl(path: Path) -> List[Dict]:
    """Load raw JSONL as list of dicts."""
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


def save_jsonl(records: List[Dict], path: Path):
    """Save list of dicts to JSONL."""
    path.parent.mkdir(parents=True, exist_ok=True)
    with open(path, 'w', encoding='utf-8') as f:
        for r in records:
            f.write(json.dumps(r, ensure_ascii=False) + '\n')


def save_json(data, path: Path):
    """Save data as JSON."""
    path.parent.mkdir(parents=True, exist_ok=True)
    with open(path, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)


def load_json(path: Path) -> Optional[dict]:
    """Load JSON file."""
    if not path.exists():
        return None
    with open(path, 'r', encoding='utf-8') as f:
        return json.load(f)


def file_size_human(size_bytes: int) -> str:
    """Format file size in human-readable units."""
    for unit in ["B", "KB", "MB", "GB"]:
        if size_bytes < 1024:
            return f"{size_bytes:.1f}{unit}"
        size_bytes /= 1024
    return f"{size_bytes:.1f}TB"
