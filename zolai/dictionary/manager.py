"""Dictionary management — ingest, search, export Zolai dictionary data."""
import json
import logging
import os
import re
from pathlib import Path
from typing import Any, Dict, List, Optional

from ..shared.utils import KNOWLEDGE_DIR, load_jsonl, save_json

logger = logging.getLogger(__name__)


class DictionaryManager:
    """
    Manage Zolai-English dictionary entries.

    Supports:
      - Ingesting from ZomiDictionary TSV files
      - Search by Zolai or English word
      - Export to JSON/JSONL formats

    Usage:
        dm = DictionaryManager()
        dm.ingest_tsv("/path/to/train.tsv")
        results = dm.search("pasian")
    """

    def __init__(self, dict_path: Optional[Path] = None):
        self.dict_path = dict_path or KNOWLEDGE_DIR / "dictionaries" / "zolai_dict.json"
        self.dict_path.parent.mkdir(parents=True, exist_ok=True)
        self.entries: List[Dict[str, Any]] = []
        self._index: Dict[str, List[int]] = {}  # word → [entry indices]
        self._load()

    def _load(self):
        """Load dictionary from file."""
        if self.dict_path.exists():
            try:
                if self.dict_path.suffix == '.jsonl':
                    self.entries = load_jsonl(self.dict_path)
                else:
                    data = json.loads(self.dict_path.read_text(encoding='utf-8'))
                    if isinstance(data, list):
                        self.entries = data
                    elif isinstance(data, dict):
                        # Convert dict format {en: zo} to entries
                        self.entries = [
                            {"zolai": v, "english": k, "pos": "", "source": "dict"}
                            for k, v in data.items()
                        ]
                self._rebuild_index()
                logger.info(f"Loaded {len(self.entries)} dictionary entries")
            except Exception as e:
                logger.warning(f"Error loading dictionary: {e}")

    def _rebuild_index(self):
        """Rebuild search index."""
        self._index = {}
        for i, entry in enumerate(self.entries):
            for field in ['zolai', 'english']:
                word = entry.get(field, '').lower().strip()
                if word:
                    if word not in self._index:
                        self._index[word] = []
                    self._index[word].append(i)

    def _save(self):
        """Save dictionary to file."""
        save_json(self.entries, self.dict_path)

    def add_entry(self, zolai: str, english: str, pos: str = "",
                  example: str = "", source: str = "") -> Dict[str, Any]:
        """Add a dictionary entry."""
        entry = {
            "zolai": zolai.strip(),
            "english": english.strip(),
            "pos": pos,
            "example": example,
            "source": source,
        }
        self.entries.append(entry)
        self._rebuild_index()
        self._save()
        return entry

    def search(self, query: str) -> List[Dict[str, Any]]:
        """
        Search dictionary by Zolai or English word.

        Args:
            query: Search term (exact match or word-boundary).

        Returns:
            List of matching entries.
        """
        query = query.lower().strip()
        if not query:
            return []

        # Exact index lookup first
        if query in self._index:
            return [self.entries[i] for i in self._index[query]]

        # Partial match fallback (word-boundary focus)
        import re
        pattern = re.compile(rf"\b{re.escape(query)}\b", re.IGNORECASE)
        results = []
        for entry in self.entries:
            zolai = entry.get("zolai", "")
            english = entry.get("english", "")
            if pattern.search(zolai) or pattern.search(english):
                results.append(entry)

        # Fuzzy fallback if nothing found
        if not results:
            for entry in self.entries:
                if query in entry.get("zolai", "").lower() or query in entry.get("english", "").lower():
                    results.append(entry)

        # Enrich results with metadata (usage, related words)
        for entry in results:
            zolai = entry.get("zolai", "").strip()
            english = entry.get("english", "").strip().lower()
            if not english:
                continue
            # find usage (short sentence)
            usage = entry.get("example", "")
            if not usage:
                for e in self.entries:
                    if zolai in e.get("example", ""):
                        usage = e["example"]
                        break
            entry["usage_hint"] = usage[:120] if usage else ""

            # find same/opposite (gloss matches)
            syns = []
            for e in self.entries:
                if e.get("english", "").lower() == english and e.get("zolai", "").strip() != zolai:
                    syns.append(e.get("zolai", "").strip())
            entry["synonyms"] = list(set(syns))[:5]
        return results

    def ingest_tsv(self, tsv_path: str, source_name: str = "") -> int:
        """
        Ingest entries from a TSV file (space-delimited pairs).

        Supports ZomiDictionary format: English  Zolai pairs separated by 2+ spaces.

        Args:
            tsv_path: Path to TSV file.
            source_name: Source identifier.

        Returns:
            Number of entries ingested.
        """
        if not os.path.exists(tsv_path):
            logger.warning(f"TSV file not found: {tsv_path}")
            return 0

        count = 0
        existing_pairs = {(e.get("english", "").lower(), e.get("zolai", "").lower())
                          for e in self.entries}

        with open(tsv_path, 'r', encoding='utf-8') as f:
            header = f.readline()
            if not ("english" in header.lower() or "zomi" in header.lower()):
                f.seek(0)

            for line in f:
                line = line.strip()
                if not line:
                    continue

                # Split by 2+ spaces
                parts = re.split(r'\s{2,}', line)
                if len(parts) >= 2:
                    en = parts[0].strip().strip('"').strip("'")
                    zo = parts[1].strip().strip('"').strip("'")
                    if en and zo:
                        pair_key = (en.lower(), zo.lower())
                        if pair_key not in existing_pairs:
                            self.entries.append({
                                "zolai": zo, "english": en,
                                "pos": "", "source": source_name or os.path.basename(tsv_path),
                            })
                            existing_pairs.add(pair_key)
                            count += 1

        self._rebuild_index()
        self._save()
        logger.info(f"Ingested {count} new entries from {tsv_path}")
        return count

    def ingest_json(self, json_path: str) -> int:
        """
        Ingest entries from a JSON dictionary file.

        Supports:
          - List of {zolai, english, pos} dicts
          - Dict of {english: zolai} mappings

        Args:
            json_path: Path to JSON file.

        Returns:
            Number of entries ingested.
        """
        if not os.path.exists(json_path):
            return 0

        try:
            data = json.loads(Path(json_path).read_text(encoding='utf-8'))
        except Exception as e:
            logger.warning(f"Error reading {json_path}: {e}")
            return 0

        count = 0
        existing = {(e.get("english", "").lower(), e.get("zolai", "").lower())
                    for e in self.entries}

        if isinstance(data, dict):
            for en, zo in data.items():
                if isinstance(zo, str):
                    pair = (en.lower(), zo.lower())
                    if pair not in existing:
                        self.entries.append({
                            "zolai": zo, "english": en,
                            "pos": "", "source": os.path.basename(json_path),
                        })
                        existing.add(pair)
                        count += 1
        elif isinstance(data, list):
            for item in data:
                if isinstance(item, dict) and "zolai" in item and "english" in item:
                    pair = (item["english"].lower(), item["zolai"].lower())
                    if pair not in existing:
                        self.entries.append(item)
                        existing.add(pair)
                        count += 1

        self._rebuild_index()
        self._save()
        return count

    def export_json(self, output_path: Optional[Path] = None) -> Path:
        """Export dictionary to JSON."""
        output_path = output_path or self.dict_path
        save_json(self.entries, output_path)
        return output_path

    def export_jsonl(self, output_path: Optional[Path] = None) -> Path:
        """Export dictionary to JSONL."""
        output_path = output_path or self.dict_path.with_suffix('.jsonl')
        output_path.parent.mkdir(parents=True, exist_ok=True)
        with open(output_path, 'w', encoding='utf-8') as f:
            for entry in self.entries:
                f.write(json.dumps(entry, ensure_ascii=False) + '\n')
        return output_path

    @property
    def count(self) -> int:
        return len(self.entries)

    def get_stats(self) -> Dict[str, Any]:
        """Get dictionary statistics."""
        return {
            "total_entries": len(self.entries),
            "unique_zolai_words": len(set(e.get("zolai", "").lower() for e in self.entries)),
            "unique_english_words": len(set(e.get("english", "").lower() for e in self.entries)),
            "with_pos": sum(1 for e in self.entries if e.get("pos")),
            "with_examples": sum(1 for e in self.entries if e.get("example")),
            "sources": list(set(e.get("source", "") for e in self.entries if e.get("source"))),
        }
