#!/usr/bin/env python3
"""
CYCLE 2: BIBLE DEEP LEARNING & VOCABULARY ENRICHMENT
Extract all 66 books, learn context, build semantic relationships, improve confidence.
"""

from __future__ import annotations

import json
import sys
import time
from pathlib import Path
from dataclasses import dataclass, field, asdict
from collections import defaultdict
from typing import Generator
from datetime import datetime
import re

PROJECT_ROOT = Path(__file__).resolve().parents[1]
BIBLE_DIR = PROJECT_ROOT / "Cleaned_Bible"
OUTPUT_DIR = PROJECT_ROOT / "data" / "processed" / "rebuild_v1"
MEMORY_FILE = OUTPUT_DIR / "memory.jsonl"
HEARTBEAT_FILE = OUTPUT_DIR / "heartbeat.log"

@dataclass
class BiblicalContext:
    """Context from Bible verses."""
    word: str
    book: str
    chapter: int
    verse: int
    en_context: str
    zo_context: str
    confidence: float = 0.9

def beat(phase: str, msg: str, **kwargs):
    """Log with heartbeat."""
    timestamp = datetime.now().isoformat()
    line = f"[{phase:20s}] {msg}"
    if kwargs:
        line += f" | {json.dumps(kwargs)}"
    print(line)
    sys.stdout.flush()
    with open(HEARTBEAT_FILE, "a", encoding="utf-8") as f:
        f.write(line + "\n")

def extract_bible_books() -> dict[str, list[dict]]:
    """Extract all 66 books from Cleaned_Bible directory."""
    beat("BIBLE_EXTRACT", "Scanning Cleaned_Bible for all books...")
    
    books = defaultdict(list)
    
    # Find all markdown files
    for md_file in BIBLE_DIR.glob("**/*.md"):
        beat("BIBLE_EXTRACT", f"Processing {md_file.name}")
        
        try:
            with open(md_file, "r", encoding="utf-8") as f:
                content = f.read()
            
            # Parse parallel format (EN | ZO)
            lines = content.split("\n")
            for i, line in enumerate(lines):
                if "|" in line and len(line) > 10:
                    parts = line.split("|")
                    if len(parts) >= 2:
                        en_text = parts[0].strip()
                        zo_text = parts[1].strip()
                        
                        if en_text and zo_text and len(en_text) > 3 and len(zo_text) > 3:
                            books[md_file.stem].append({
                                "en": en_text,
                                "zo": zo_text,
                                "line": i,
                                "file": md_file.name
                            })
        except Exception as e:
            beat("BIBLE_EXTRACT", f"Error reading {md_file.name}: {str(e)}")
    
    beat("BIBLE_EXTRACT", "Bible extraction complete", books_found=len(books), total_verses=sum(len(v) for v in books.values()))
    return books

def extract_vocabulary_from_verses(books: dict[str, list[dict]]) -> dict[str, list[BiblicalContext]]:
    """Extract vocabulary with biblical context."""
    beat("VOCAB_EXTRACT", "Extracting vocabulary from verses...")
    
    vocab = defaultdict(list)
    total_words = 0
    
    for book_name, verses in books.items():
        for verse in verses:
            zo_text = verse["zo"]
            en_text = verse["en"]
            
            # Extract words
            zo_words = re.findall(r"\b\w+\b", zo_text.lower())
            
            for word in zo_words:
                if len(word) > 2:
                    ctx = BiblicalContext(
                        word=word,
                        book=book_name,
                        chapter=0,
                        verse=verse["line"],
                        en_context=en_text[:100],
                        zo_context=zo_text[:100],
                        confidence=0.95
                    )
                    vocab[word].append(ctx)
                    total_words += 1
    
    beat("VOCAB_EXTRACT", "Vocabulary extraction complete", unique_words=len(vocab), total_occurrences=total_words)
    return vocab

def build_semantic_relationships(vocab: dict[str, list[BiblicalContext]]) -> dict[str, dict]:
    """Build semantic relationships from context."""
    beat("SEMANTIC", "Building semantic relationships...")
    
    semantic_map = {}
    
    for word, contexts in vocab.items():
        # Aggregate contexts
        en_meanings = defaultdict(int)
        zo_contexts = []
        
        for ctx in contexts:
            en_meanings[ctx.en_context] += 1
            zo_contexts.append(ctx.zo_context)
        
        # Most common meaning
        best_meaning = max(en_meanings.items(), key=lambda x: x[1])[0] if en_meanings else ""
        
        semantic_map[word] = {
            "word": word,
            "primary_meaning": best_meaning,
            "occurrences": len(contexts),
            "books": list(set(ctx.book for ctx in contexts)),
            "confidence": min(0.95, 0.7 + (len(contexts) * 0.05)),
            "contexts": [asdict(ctx) for ctx in contexts[:3]]  # Top 3 contexts
        }
    
    beat("SEMANTIC", "Semantic mapping complete", entries=len(semantic_map))
    return semantic_map

def merge_with_existing_dictionary(semantic_map: dict[str, dict]) -> dict[str, dict]:
    """Merge Bible vocabulary with existing dictionary."""
    beat("MERGE", "Merging Bible vocabulary with existing dictionary...")
    
    existing_file = OUTPUT_DIR / "final_en_zo_dictionary.jsonl"
    existing = {}
    
    if existing_file.exists():
        with open(existing_file, "r", encoding="utf-8") as f:
            for line in f:
                try:
                    entry = json.loads(line)
                    existing[entry["en"].lower()] = entry
                except:
                    pass
    
    beat("MERGE", f"Loaded existing dictionary", entries=len(existing))
    
    # Merge: Bible vocabulary enhances existing
    merged = existing.copy()
    new_entries = 0
    
    for zo_word, sem_data in semantic_map.items():
        en_word = sem_data["primary_meaning"].lower().split()[0] if sem_data["primary_meaning"] else zo_word
        
        if en_word not in merged:
            merged[en_word] = {
                "en": en_word,
                "zo": zo_word,
                "confidence": sem_data["confidence"],
                "source": "bible_extraction",
                "context": sem_data["primary_meaning"],
                "bible_ref": f"{sem_data['books'][0]}" if sem_data["books"] else "",
                "frequency": sem_data["occurrences"]
            }
            new_entries += 1
        else:
            # Enhance existing entry
            merged[en_word]["frequency"] = merged[en_word].get("frequency", 1) + sem_data["occurrences"]
            merged[en_word]["confidence"] = min(1.0, merged[en_word]["confidence"] + 0.05)
    
    beat("MERGE", "Merge complete", new_entries=new_entries, total_entries=len(merged))
    return merged

def write_enriched_dictionary(merged: dict[str, dict]):
    """Write enriched dictionary."""
    beat("WRITE", "Writing enriched dictionary...")
    
    output_file = OUTPUT_DIR / "final_en_zo_dictionary_v2.jsonl"
    
    with open(output_file, "w", encoding="utf-8") as f:
        for en_word, data in sorted(merged.items()):
            f.write(json.dumps(data, ensure_ascii=False) + "\n")
    
    beat("WRITE", "Dictionary written", file=str(output_file), entries=len(merged))

def main() -> int:
    """Execute Bible deep learning cycle."""
    beat("MAIN", "🔄 CYCLE 2: BIBLE DEEP LEARNING STARTING")
    
    try:
        # Extract all 66 books
        books = extract_bible_books()
        
        # Extract vocabulary with context
        vocab = extract_vocabulary_from_verses(books)
        
        # Build semantic relationships
        semantic_map = build_semantic_relationships(vocab)
        
        # Merge with existing
        merged = merge_with_existing_dictionary(semantic_map)
        
        # Write output
        write_enriched_dictionary(merged)
        
        beat("MAIN", "✅ CYCLE 2 COMPLETE")
        return 0
    
    except Exception as e:
        beat("MAIN", f"❌ ERROR: {str(e)}")
        import traceback
        traceback.print_exc()
        return 1

if __name__ == "__main__":
    raise SystemExit(main())
