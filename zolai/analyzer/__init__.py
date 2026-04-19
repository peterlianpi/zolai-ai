"""Zolai language analyzer — corpus stats, grammar, dictionary, Bible tools."""
import json
import logging
import re
from collections import Counter
from pathlib import Path
from typing import Dict, List, Optional, Tuple

from ..config import Paths
from ..shared.utils import ZolaiRecord, read_jsonl, zolai_density

log = logging.getLogger(__name__)


class CorpusStats:
    """Analyze corpus statistics."""

    def __init__(self, paths: Paths):
        self.paths = paths

    def analyze_file(self, path: Path) -> dict:
        """Get stats for a single JSONL file."""
        records = read_jsonl(path)
        if not records:
            return {"file": str(path), "records": 0}

        texts = [r.text for r in records]
        word_counts = [len(t.split()) for t in texts]
        char_counts = [len(t) for t in texts]

        # Word frequency
        all_words = []
        for t in texts:
            all_words.extend(t.lower().split())
        word_freq = Counter(all_words)

        # Source distribution
        sources = Counter(r.source for r in records if r.source)

        return {
            "file": str(path),
            "records": len(records),
            "total_chars": sum(char_counts),
            "total_words": sum(word_counts),
            "avg_chars": round(sum(char_counts) / len(records), 1),
            "avg_words": round(sum(word_counts) / len(records), 1),
            "min_chars": min(char_counts),
            "max_chars": max(char_counts),
            "unique_words": len(word_freq),
            "top_words": word_freq.most_common(20),
            "top_sources": sources.most_common(10),
            "avg_quality": round(sum(r.quality for r in records) / len(records), 3) if records[0].quality else 0,
            "dataset_mb": round(path.stat().st_size / 1_048_576, 2),
        }

    def full_report(self) -> dict:
        """Generate full corpus report."""
        report = {"files": [], "totals": {}}
        total_records = 0
        total_chars = 0
        total_words = 0

        for fpath in sorted(self.paths.data_cleaned.glob("*.jsonl")):
            stats = self.analyze_file(fpath)
            report["files"].append(stats)
            total_records += stats.get("records", 0)
            total_chars += stats.get("total_chars", 0)
            total_words += stats.get("total_words", 0)

        report["totals"] = {
            "records": total_records,
            "total_chars": total_chars,
            "total_words": total_words,
            "estimated_tokens": round(total_words * 1.3),  # Rough token estimate
        }
        return report


class GrammarEngine:
    """Basic Zolai grammar analysis."""

    # Zolai common affixes and particles
    PREFIXES = ['tuan', 'kum', 'pa', 'nuam']
    SUFFIXES = ['te', 'lam', 'pi', 'tuan', 'loh', 'mah', 'na']
    PARTICLES = ['in', 'a', 'le', 'leh', 'na', 'tak', 'hna', 'ciang']

    def analyze_sentence(self, sentence: str) -> dict:
        """Analyze a sentence for grammar patterns."""
        words = sentence.lower().split()
        found_prefixes = []
        found_suffixes = []
        found_particles = []

        for w in words:
            for p in self.PREFIXES:
                if w.startswith(p) and len(w) > len(p):
                    found_prefixes.append((w, p))
            for s in self.SUFFIXES:
                if w.endswith(s) and len(w) > len(s):
                    found_suffixes.append((w, s))
            for p in self.PARTICLES:
                if w == p:
                    found_particles.append(w)

        return {
            "sentence": sentence,
            "word_count": len(words),
            "prefixes": found_prefixes,
            "suffixes": found_suffixes,
            "particles": found_particles,
            "structure": self._identify_structure(words),
        }

    def _identify_structure(self, words: List[str]) -> str:
        """Identify basic sentence structure."""
        if not words:
            return "EMPTY"
        if words[-1] in ['ci', 'hi', 'ngei', 'dang']:
            return "DECLARATIVE"
        if words[-1] in ['ma', 'na']:
            return "INTERROGATIVE"
        if words[0] in ['hang', 'kei']:
            return "IMPERATIVE"
        return "UNKNOWN"

    def analyze_corpus(self, path: Path) -> dict:
        """Analyze grammar patterns across corpus."""
        records = read_jsonl(path)
        patterns = Counter()
        structures = Counter()
        total_prefixes = 0
        total_suffixes = 0

        for rec in records[:1000]:  # Sample first 1000
            analysis = self.analyze_sentence(rec.text)
            structures[analysis["structure"]] += 1
            total_prefixes += len(analysis["prefixes"])
            total_suffixes += len(analysis["suffixes"])
            for _, p in analysis["prefixes"]:
                patterns[f"prefix:{p}"] += 1
            for _, s in analysis["suffixes"]:
                patterns[f"suffix:{s}"] += 1
            for p in analysis["particles"]:
                patterns[f"particle:{p}"] += 1

        return {
            "sampled": min(len(records), 1000),
            "structures": dict(structures.most_common(10)),
            "morphology_patterns": dict(patterns.most_common(20)),
            "avg_prefixes_per_sentence": round(total_prefixes / max(len(records), 1), 2),
            "avg_suffixes_per_sentence": round(total_suffixes / max(len(records), 1), 2),
        }


class Dictionary:
    """Simple Zolai dictionary manager."""

    def __init__(self, paths: Paths):
        self.dict_path = paths.data_knowledge / "dictionary.jsonl"
        self.entries: Dict[str, dict] = {}
        self._load()

    def _load(self):
        if self.dict_path.exists():
            for line in open(self.dict_path, 'r', encoding='utf-8'):
                try:
                    entry = json.loads(line.strip())
                    self.entries[entry["zolai"].lower()] = entry
                except (json.JSONDecodeError, KeyError):
                    pass

    def add_entry(self, zolai: str, english: str, pos: str = "", example: str = ""):
        self.entries[zolai.lower()] = {
            "zolai": zolai,
            "english": english,
            "pos": pos,
            "example": example,
        }
        self._save()

    def search(self, query: str) -> List[dict]:
        query = query.lower()
        results = []
        for key, entry in self.entries.items():
            if query in key or query in entry.get("english", "").lower():
                results.append(entry)
        return results

    def _save(self):
        self.dict_path.parent.mkdir(parents=True, exist_ok=True)
        with open(self.dict_path, 'w', encoding='utf-8') as f:
            for entry in self.entries.values():
                f.write(json.dumps(entry, ensure_ascii=False) + '\n')

    @property
    def count(self) -> int:
        return len(self.entries)
