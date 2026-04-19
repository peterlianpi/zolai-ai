from __future__ import annotations
import json
import sys
from pathlib import Path
from datetime import datetime
import hashlib

PROJECT_ROOT = Path(__file__).resolve().parents[1]
DATA_DIR = PROJECT_ROOT / "data" / "processed" / "rebuild_v2"

def log_msg(msg: str) -> None:
    ts = datetime.now().isoformat()
    print(f"[{ts}] {msg}")
    sys.stdout.flush()

def build_search_index() -> dict:
    """Build fast lookup index"""
    index = {
        "en_to_zo": {},
        "zo_to_en": {},
        "prefix_en": {},
        "prefix_zo": {}
    }
    
    # Load dictionaries
    en_zo_file = DATA_DIR / "dictionary_en_zo_v2.jsonl"
    if en_zo_file.exists():
        with open(en_zo_file, encoding="utf-8") as f:
            for line in f:
                entry = json.loads(line)
                en = entry.get("en", "").lower()
                zo = entry.get("zo", "").lower()
                
                index["en_to_zo"][en] = entry
                
                # Prefix index
                for i in range(1, len(en) + 1):
                    prefix = en[:i]
                    if prefix not in index["prefix_en"]:
                        index["prefix_en"][prefix] = []
                    index["prefix_en"][prefix].append(en)
    
    zo_en_file = DATA_DIR / "dictionary_zo_en_v2.jsonl"
    if zo_en_file.exists():
        with open(zo_en_file, encoding="utf-8") as f:
            for line in f:
                entry = json.loads(line)
                zo = entry.get("zo", "").lower()
                en_list = entry.get("en", [])
                
                index["zo_to_en"][zo] = en_list
                
                # Prefix index
                for i in range(1, len(zo) + 1):
                    prefix = zo[:i]
                    if prefix not in index["prefix_zo"]:
                        index["prefix_zo"][prefix] = []
                    index["prefix_zo"][prefix].append(zo)
    
    log_msg(f"Built search index: {len(index['en_to_zo'])} EN, {len(index['zo_to_en'])} ZO")
    return index

def build_semantic_vectors() -> dict:
    """Build simple semantic vectors (word frequency + context)"""
    vectors = {}
    
    sentences_file = DATA_DIR / "sentences_v2.jsonl"
    if sentences_file.exists():
        word_freq = {}
        with open(sentences_file, encoding="utf-8") as f:
            for line in f:
                sent = json.loads(line)
                text = sent.get("text", "").split()
                for word in text:
                    word_freq[word] = word_freq.get(word, 0) + 1
        
        # Create simple vectors
        for word, freq in word_freq.items():
            vectors[word] = {
                "frequency": freq,
                "length": len(word),
                "hash": hashlib.md5(word.encode()).hexdigest()[:8]
            }
    
    log_msg(f"Built semantic vectors for {len(vectors)} words")
    return vectors

def build_relationship_graph() -> dict:
    """Build word relationship graph"""
    graph = {}
    
    rel_file = DATA_DIR / "relationships_v2.json"
    if rel_file.exists():
        with open(rel_file, encoding="utf-8") as f:
            graph = json.load(f)
    
    log_msg(f"Loaded relationship graph with {len(graph)} nodes")
    return graph

def save_search_layer(index: dict, vectors: dict, graph: dict) -> None:
    """Save search layer"""
    
    # Index
    with open(DATA_DIR / "search_index_v2.json", "w", encoding="utf-8") as f:
        json.dump(index, f, ensure_ascii=False)
    
    # Vectors
    with open(DATA_DIR / "semantic_vectors_v2.json", "w", encoding="utf-8") as f:
        json.dump(vectors, f, ensure_ascii=False)
    
    # Graph
    with open(DATA_DIR / "relationship_graph_v2.json", "w", encoding="utf-8") as f:
        json.dump(graph, f, ensure_ascii=False)
    
    log_msg(f"Saved search layer to {DATA_DIR}")

def main() -> int:
    log_msg("=== REBUILD V2: EMBEDDINGS & SEARCH LAYER ===")
    
    index = build_search_index()
    vectors = build_semantic_vectors()
    graph = build_relationship_graph()
    
    save_search_layer(index, vectors, graph)
    
    log_msg("✅ Search layer complete")
    return 0

if __name__ == "__main__":
    raise SystemExit(main())
