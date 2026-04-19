import json
from pathlib import Path

from .zo_utils import stream_jsonl

"""
Zolai Dataset Manager
Consolidates all dataset merging, deduplication, and cleaning logic.
Replaces: merge_v*, combine_*, deduplicate_*, cleanup_*
"""

class DatasetManager:
    def __init__(self, root_dir="data"):
        self.root = Path(root_dir)

    def merge_zomidaily(self, version_list):
        """Merges multiple ZomiDaily crawl versions."""
        print(f"Merging ZomiDaily versions: {version_list}")
        master = []
        for v in version_list:
            path = self.root / f"zomidaily_{v}.jsonl"
            if path.exists():
                master.extend(list(stream_jsonl(path)))
        return self.deduplicate(master)

    def deduplicate(self, data, key="text"):
        """Removes duplicates based on a specific field."""
        seen = set()
        clean = []
        for item in data:
            val = item.get(key)
            if val not in seen:
                seen.add(val)
                clean.append(item)
        print(f"Deduplicated: {len(data)} -> {len(clean)}")
        return clean

    def export_unified(self, data, filename="unified_corpus.jsonl"):
        output = self.root / filename
        with open(output, "w", encoding="utf-8") as f:
            for item in data:
                f.write(json.dumps(item, ensure_ascii=False) + "\n")
        print(f"Exported to {output}")

if __name__ == "__main__":
    # Example usage for CLI
    pass
