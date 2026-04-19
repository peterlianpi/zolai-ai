"""Zolai Toolkit — Corpus analysis, grammar validation, and purity checking (consolidated from zolai-linguist)."""
import json
import logging
import re
from collections import Counter
from pathlib import Path
from typing import Any, Dict, List, Optional

from ..config import config
from ..shared.utils import (
    KNOWLEDGE_DIR,
    ZOLAI_FUNCTION_WORDS,
    is_zolai_text,
    save_json,
)

logger = logging.getLogger(__name__)


# ══════════════════════════════════════════════════════════════════════════════
# CorpusAnalyzer — comprehensive corpus statistics
# ══════════════════════════════════════════════════════════════════════════════

class CorpusAnalyzer:
    """
    Analyze corpus statistics, purity, grammar patterns, and vocabulary diversity.

    Usage:
        analyzer = CorpusAnalyzer()
        analyzer.load(corpus_path)
        stats = analyzer.compute_stats()
    """

    def __init__(self, data_path: Optional[Path] = None):
        self.data_path = data_path
        self.records: List[Dict[str, Any]] = []
        self.stats: Dict[str, Any] = {}

    def load(self, path: Path):
        """Load data for analysis from JSONL or plain text."""
        self.data_path = path
        if path.suffix == ".jsonl":
            self.records = load_jsonl(path)
        else:
            text = path.read_text(encoding="utf-8")
            self.records = [{"text": line} for line in text.split("\n") if line.strip()]
        logger.info(f"Loaded {len(self.records)} records from {path}")

    def load_from_dir(self, dir_path: Path, pattern: str = "*.jsonl"):
        """Load all matching files from a directory."""
        self.records = []
        for fpath in sorted(dir_path.glob(pattern)):
            records = load_jsonl(fpath)
            self.records.extend(records)
        logger.info(f"Loaded {len(self.records)} total records from {dir_path}")

    def compute_stats(self) -> Dict[str, Any]:
        """Compute comprehensive corpus statistics."""
        if not self.records:
            return {"error": "No data loaded"}

        all_text = " ".join(r.get("text", "") for r in self.records)
        words = re.findall(r'\b\w+\b', all_text.lower())
        sentences = [r.get("text", "") for r in self.records]

        # Word frequency
        word_freq = Counter(words)
        top_words = word_freq.most_common(50)

        # Sentence lengths
        sent_lengths = [len(s.split()) for s in sentences if s]

        # Character stats
        chars = len(all_text)
        unique_chars = len(set(all_text))

        # Zolai density
        zolai_count = sum(1 for s in sentences if is_zolai_text(s))

        # Vocabulary diversity (Type-Token Ratio)
        ttr = len(word_freq) / max(len(words), 1)

        # Top Zolai function words
        func_word_hits = {w: word_freq.get(w, 0) for w in ZOLAI_FUNCTION_WORDS if word_freq.get(w, 0) > 0}
        top_func = sorted(func_word_hits.items(), key=lambda x: x[1], reverse=True)[:20]

        self.stats = {
            "corpus_size": {
                "total_records": len(self.records),
                "total_characters": chars,
                "total_words": len(words),
                "unique_words": len(word_freq),
                "unique_characters": unique_chars,
                "dataset_mb": round(chars / 1_048_576, 3),
            },
            "sentence_stats": {
                "count": len(sentences),
                "avg_length": round(sum(sent_lengths) / max(len(sent_lengths), 1), 1),
                "min_length": min(sent_lengths) if sent_lengths else 0,
                "max_length": max(sent_lengths) if sent_lengths else 0,
                "median_length": sorted(sent_lengths)[len(sent_lengths) // 2] if sent_lengths else 0,
            },
            "zolai_density": {
                "zolai_sentences": zolai_count,
                "total_sentences": len(sentences),
                "density_pct": round(zolai_count / max(len(sentences), 1) * 100, 1),
            },
            "top_words": [{"word": w, "count": c} for w, c in top_words],
            "top_function_words": [{"word": w, "count": c} for w, c in top_func],
            "vocabulary_diversity": round(ttr, 4),
            "estimated_tokens": round(len(words) * 1.3),
        }

        return self.stats

    def purity_check(self, text: Optional[str] = None) -> Dict[str, Any]:
        """
        Check Zolai purity of a text or the loaded corpus.

        Returns dict with:
            purity_score: 0-100
            verdict: PURE|MOSTLY_PURE|MIXED|CONTAMINATED
            dialect_markers: list of detected non-Zolai markers
        """
        if text:
            texts = [text]
        elif self.records:
            texts = [r.get("text", "") for r in self.records[:500]]  # Sample
        else:
            return {"error": "No text or records to check"}

        # Mizo/Falam markers from zolai-linguist
        MIZO_MARKERS = {"chu", "rawh", "bawk", "reng", "ngei", "tlang", "tuipui"}
        FALAM_MARKERS = {"rak", "ziang", "cu", "nain", "pakhat", "zeitin"}
        INVALID_CHARS = set("ṭḍṇřčšžñ")

        total_words = 0
        total_issues = 0
        dialect_findings = []
        char_findings = []

        for t in texts:
            words = t.split()
            total_words += len(words)

            # Check dialect markers
            for w in words:
                wl = w.lower().strip(".,!?;:'\"")
                if wl in MIZO_MARKERS:
                    dialect_findings.append({"word": w, "dialect": "Mizo"})
                    total_issues += 1
                elif wl in FALAM_MARKERS:
                    dialect_findings.append({"word": w, "dialect": "Falam"})
                    total_issues += 1

            # Check invalid chars
            for ch in t:
                if ch in INVALID_CHARS:
                    char_findings.append({"char": ch})
                    total_issues += 1

        purity_score = round(max(0, (1 - total_issues / max(total_words, 1))) * 100, 1)

        if purity_score >= 95:
            verdict = "PURE"
        elif purity_score >= 85:
            verdict = "MOSTLY_PURE"
        elif purity_score >= 70:
            verdict = "MIXED"
        else:
            verdict = "CONTAMINATED"

        return {
            "purity_score": purity_score,
            "verdict": verdict,
            "total_words_checked": total_words,
            "dialect_markers": dialect_findings[:20],
            "invalid_chars": char_findings[:10],
            "total_issues": total_issues,
        }

    def grammar_analysis(self, text: Optional[str] = None) -> Dict[str, Any]:
        """
        Basic grammar analysis: affixes, particles, sentence structure.
        """
        if text:
            texts = [text]
        elif self.records:
            texts = [r.get("text", "") for r in self.records[:1000]]
        else:
            return {"error": "No text or records to analyze"}

        PREFIXES = ['tuan', 'kum', 'pa', 'nuam']
        SUFFIXES = ['te', 'lam', 'pi', 'tuan', 'loh', 'mah', 'na']
        PARTICLES = ['in', 'a', 'le', 'leh', 'na', 'tak', 'hna', 'ciang']

        pattern_counts = Counter()
        structures = Counter()
        total_prefixes = 0
        total_suffixes = 0

        for sentence in texts:
            words = sentence.lower().split()
            for w in words:
                for p in PREFIXES:
                    if w.startswith(p) and len(w) > len(p):
                        pattern_counts[f"prefix:{p}"] += 1
                        total_prefixes += 1
                for s in SUFFIXES:
                    if w.endswith(s) and len(w) > len(s):
                        pattern_counts[f"suffix:{s}"] += 1
                        total_suffixes += 1
                for p in PARTICLES:
                    if w == p:
                        pattern_counts[f"particle:{p}"] += 1

            # Structure detection
            if words:
                if words[-1] in ['ci', 'hi', 'ngei', 'dang']:
                    structures["DECLARATIVE"] += 1
                elif words[-1] in ['ma', 'na'] or sentence.strip().endswith('?'):
                    structures["INTERROGATIVE"] += 1
                elif words[0] in ['hang', 'kei']:
                    structures["IMPERATIVE"] += 1
                else:
                    structures["UNKNOWN"] += 1

        return {
            "sampled_sentences": len(texts),
            "structures": dict(structures.most_common(10)),
            "morphology_patterns": dict(pattern_counts.most_common(20)),
            "avg_prefixes_per_sentence": round(total_prefixes / max(len(texts), 1), 2),
            "avg_suffixes_per_sentence": round(total_suffixes / max(len(texts), 1), 2),
        }

    def get_ngrams(self, n: int = 2, top_k: int = 20) -> List[Dict[str, Any]]:
        """Get top n-grams from corpus."""
        all_text = " ".join(r.get("text", "") for r in self.records)
        words = re.findall(r'\b\w+\b', all_text.lower())
        ngrams = [tuple(words[i:i + n]) for i in range(len(words) - n + 1)]
        freq = Counter(ngrams)
        return [{"ngram": " ".join(ng), "count": c} for ng, c in freq.most_common(top_k)]

    def full_stats(self) -> Dict[str, Any]:
        """Auto-discover data and compute stats if not already loaded."""
        if not self.records:
            # Auto-discover data from toolkit directories
            # Primary: centralized project master data
            # Secondary: internal data folders
            search_paths = [
                config.paths.data_cleaned,
                config.paths.data_raw / "zolai_corpus",
                Path.home() / "Documents/Projects/data/master"
            ]
            for d in search_paths:
                if d.exists():
                    self.load_from_dir(d)
                    if self.records:
                        break
        return self.compute_stats()

    def full_report(self) -> Dict[str, Any]:
        """Generate full report with stats + purity + grammar."""
        stats = self.compute_stats()
        purity = self.purity_check()
        grammar = self.grammar_analysis()

        report = {
            "timestamp": __import__("datetime").datetime.now().isoformat(),
            "source": str(self.data_path),
            "statistics": stats,
            "purity": purity,
            "grammar": grammar,
            "bigrams": self.get_ngrams(2, 20),
            "trigrams": self.get_ngrams(3, 15),
        }
        return report

    def save_report(self, output_path: Optional[Path] = None) -> Path:
        """Save analysis report to JSON."""
        if not output_path:
            output_path = KNOWLEDGE_DIR / "corpus_report.json"
        report = self.full_report()
        save_json(report, output_path)
        return output_path


# ══════════════════════════════════════════════════════════════════════════════
# Compatibility helper
# ══════════════════════════════════════════════════════════════════════════════

def load_jsonl(path: Path) -> List[Dict]:
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
