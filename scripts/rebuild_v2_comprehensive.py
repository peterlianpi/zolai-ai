from __future__ import annotations
import json
import sys
from pathlib import Path
from collections import defaultdict
from datetime import datetime
import hashlib

# Paths
PROJECT_ROOT = Path(__file__).resolve().parents[1]
DATA_DIR = PROJECT_ROOT / "data" / "processed" / "rebuild_v2"
MEMORY_DIR = DATA_DIR / "memory"
DATA_DIR.mkdir(parents=True, exist_ok=True)
MEMORY_DIR.mkdir(parents=True, exist_ok=True)

# State
heartbeat_file = DATA_DIR / "heartbeat.log"
memory_file = MEMORY_DIR / "state.jsonl"
rules_file = MEMORY_DIR / "rules.json"

def log_heartbeat(msg: str) -> None:
    ts = datetime.now().isoformat()
    line = f"[{ts}] {msg}"
    print(line)
    with open(heartbeat_file, "a", encoding="utf-8") as f:
        f.write(line + "\n")
    sys.stdout.flush()

def load_memory() -> dict:
    if memory_file.exists():
        with open(memory_file, encoding="utf-8") as f:
            lines = f.readlines()
            if lines:
                return json.loads(lines[-1])
    return {"cycle": 0, "entries": 0, "sentences": 0}

def save_memory(data: dict) -> None:
    with open(memory_file, "a", encoding="utf-8") as f:
        f.write(json.dumps(data, ensure_ascii=False) + "\n")

def load_existing_dict() -> dict:
    """Load existing v7 dictionaries"""
    en_zo = {}
    zo_en = defaultdict(list)
    
    v7_en = PROJECT_ROOT / "data" / "processed" / "rebuild_v1" / "final_en_zo_dictionary_v7.jsonl"
    v7_zo = PROJECT_ROOT / "data" / "processed" / "rebuild_v1" / "final_zo_en_dictionary_v7.jsonl"
    
    if v7_en.exists():
        with open(v7_en, encoding="utf-8") as f:
            for line in f:
                entry = json.loads(line)
                en_zo[entry["en"]] = entry
    
    if v7_zo.exists():
        with open(v7_zo, encoding="utf-8") as f:
            for line in f:
                entry = json.loads(line)
                zo = entry["zo"]
                en = entry["en"]
                if en not in zo_en[zo]:
                    zo_en[zo].append(en)
    
    log_heartbeat(f"Loaded {len(en_zo)} EN→ZO entries")
    return en_zo, dict(zo_en)

def expand_context(en_zo: dict, zo_en: dict) -> tuple[dict, dict]:
    """Add synonyms, antonyms, grammar, examples"""
    
    # Grammar patterns
    grammar_rules = {
        "ne": {"pos": "verb", "type": "action", "examples": ["Ka ne hi.", "I eat."]},
        "khat": {"pos": "noun", "type": "object", "examples": ["Khat a si.", "It is an egg."]},
        "ka": {"pos": "marker", "type": "agreement", "examples": ["Ka ne hi.", "I eat."]},
    }
    
    # Expand EN→ZO
    for en_word, entry in en_zo.items():
        zo_word = entry.get("zo", "")
        
        # Add POS if available
        if zo_word in grammar_rules:
            entry["pos"] = grammar_rules[zo_word].get("pos", "")
            entry["examples"] = grammar_rules[zo_word].get("examples", [])
        
        # Add related words
        if zo_word in zo_en:
            entry["related_zo"] = zo_en[zo_word][:3]
    
    log_heartbeat(f"Expanded context for {len(en_zo)} entries")
    return en_zo, zo_en

def extract_bible_phrases() -> list[dict]:
    """Extract multi-word phrases from Bible"""
    phrases = []
    bible_dir = PROJECT_ROOT / "Cleaned_Bible"
    
    if not bible_dir.exists():
        log_heartbeat("Bible directory not found, skipping phrase extraction")
        return phrases
    
    bible_files = list(bible_dir.glob("*.txt"))
    log_heartbeat(f"Processing {len(bible_files)} Bible files for phrases")
    
    for i, bible_file in enumerate(bible_files[:10]):  # Sample first 10
        try:
            with open(bible_file, encoding="utf-8") as f:
                content = f.read()
                # Extract 2-3 word phrases
                words = content.split()
                for j in range(len(words) - 2):
                    phrase = " ".join(words[j:j+3])
                    if len(phrase) > 5 and len(phrase) < 50:
                        phrases.append({
                            "phrase": phrase,
                            "source": "bible",
                            "file": bible_file.name
                        })
        except Exception as e:
            log_heartbeat(f"Error processing {bible_file.name}: {e}")
    
    log_heartbeat(f"Extracted {len(phrases)} Bible phrases")
    return phrases

def build_semantic_relationships(en_zo: dict) -> dict:
    """Build word relationship graph"""
    relationships = {}
    
    for en_word, entry in en_zo.items():
        zo_word = entry.get("zo", "")
        if not zo_word:
            continue
        
        relationships[zo_word] = {
            "english": en_word,
            "confidence": entry.get("confidence", 1.0),
            "source": entry.get("source", "unknown"),
            "related": entry.get("related_zo", [])
        }
    
    log_heartbeat(f"Built semantic graph with {len(relationships)} nodes")
    return relationships

def create_sentence_dataset(en_zo: dict) -> list[dict]:
    """Generate parallel sentence dataset"""
    sentences = []
    
    # Template-based generation
    templates = [
        ("Ka {zo} hi.", "I {en}."),
        ("Nang {zo} hi.", "You {en}."),
        ("A {zo} hi.", "He/She {en}."),
    ]
    
    for en_word, entry in list(en_zo.items())[:100]:
        zo_word = entry.get("zo", "")
        if not zo_word or len(zo_word) < 2:
            continue
        
        for zo_template, en_template in templates:
            try:
                sentences.append({
                    "text": zo_template.format(zo=zo_word),
                    "translation_en": en_template.format(en=en_word),
                    "topic": entry.get("context", "general"),
                    "data_type": "parallel",
                    "source": entry.get("source", "generated")
                })
            except:
                pass
    
    log_heartbeat(f"Generated {len(sentences)} parallel sentences")
    return sentences

def create_instruction_dataset(en_zo: dict, sentences: list[dict]) -> list[dict]:
    """Create instruction-tuning dataset"""
    instructions = []
    
    # Translation tasks
    for en_word, entry in list(en_zo.items())[:50]:
        zo_word = entry.get("zo", "")
        if zo_word:
            instructions.append({
                "instruction": "Translate English to Zolai",
                "input": en_word,
                "output": zo_word,
                "source": "dictionary"
            })
            instructions.append({
                "instruction": "Translate Zolai to English",
                "input": zo_word,
                "output": en_word,
                "source": "dictionary"
            })
    
    # Sentence translation
    for sent in sentences[:50]:
        instructions.append({
            "instruction": "Translate Zolai sentence to English",
            "input": sent["text"],
            "output": sent["translation_en"],
            "source": "generated"
        })
    
    log_heartbeat(f"Created {len(instructions)} instruction examples")
    return instructions

def deduplicate_entries(en_zo: dict) -> dict:
    """Remove duplicates and merge similar entries"""
    seen = {}
    deduplicated = {}
    
    for en_word, entry in en_zo.items():
        zo_word = entry.get("zo", "")
        key = hashlib.md5(f"{en_word}:{zo_word}".encode()).hexdigest()
        
        if key not in seen:
            deduplicated[en_word] = entry
            seen[key] = True
    
    log_heartbeat(f"Deduplicated: {len(en_zo)} → {len(deduplicated)} entries")
    return deduplicated

def audit_quality(en_zo: dict, zo_en: dict) -> dict:
    """Quality audit"""
    stats = {
        "total_en_zo": len(en_zo),
        "total_zo_en": len(zo_en),
        "bidirectional": sum(1 for en, entry in en_zo.items() if entry.get("zo") in zo_en),
        "with_examples": sum(1 for entry in en_zo.values() if entry.get("examples")),
        "with_pos": sum(1 for entry in en_zo.values() if entry.get("pos")),
        "timestamp": datetime.now().isoformat()
    }
    
    log_heartbeat(f"Audit: {stats['total_en_zo']} EN→ZO, {stats['total_zo_en']} ZO→EN, {stats['bidirectional']} bidirectional")
    return stats

def save_outputs(en_zo: dict, zo_en: dict, sentences: list[dict], instructions: list[dict], relationships: dict, stats: dict) -> None:
    """Save all outputs"""
    
    # Dictionary
    with open(DATA_DIR / "dictionary_en_zo_v2.jsonl", "w", encoding="utf-8") as f:
        for en_word, entry in en_zo.items():
            f.write(json.dumps(entry, ensure_ascii=False) + "\n")
    
    with open(DATA_DIR / "dictionary_zo_en_v2.jsonl", "w", encoding="utf-8") as f:
        for zo_word, en_list in zo_en.items():
            f.write(json.dumps({"zo": zo_word, "en": en_list}, ensure_ascii=False) + "\n")
    
    # Sentences
    with open(DATA_DIR / "sentences_v2.jsonl", "w", encoding="utf-8") as f:
        for sent in sentences:
            f.write(json.dumps(sent, ensure_ascii=False) + "\n")
    
    # Instructions
    with open(DATA_DIR / "instructions_v2.jsonl", "w", encoding="utf-8") as f:
        for inst in instructions:
            f.write(json.dumps(inst, ensure_ascii=False) + "\n")
    
    # Relationships
    with open(DATA_DIR / "relationships_v2.json", "w", encoding="utf-8") as f:
        json.dump(relationships, f, ensure_ascii=False, indent=2)
    
    # Stats
    with open(DATA_DIR / "audit_v2.json", "w", encoding="utf-8") as f:
        json.dump(stats, f, ensure_ascii=False, indent=2)
    
    log_heartbeat(f"Saved outputs to {DATA_DIR}")

def main() -> int:
    log_heartbeat("=== REBUILD V2: COMPREHENSIVE EXPANSION ===")
    
    memory = load_memory()
    cycle = memory.get("cycle", 0) + 1
    log_heartbeat(f"Starting Cycle {cycle}")
    
    # Load existing
    en_zo, zo_en = load_existing_dict()
    
    # Expand
    en_zo, zo_en = expand_context(en_zo, zo_en)
    
    # Extract phrases
    phrases = extract_bible_phrases()
    
    # Build relationships
    relationships = build_semantic_relationships(en_zo)
    
    # Generate sentences
    sentences = create_sentence_dataset(en_zo)
    
    # Generate instructions
    instructions = create_instruction_dataset(en_zo, sentences)
    
    # Deduplicate
    en_zo = deduplicate_entries(en_zo)
    
    # Audit
    stats = audit_quality(en_zo, zo_en)
    
    # Save
    save_outputs(en_zo, zo_en, sentences, instructions, relationships, stats)
    
    # Update memory
    save_memory({
        "cycle": cycle,
        "entries": len(en_zo),
        "sentences": len(sentences),
        "instructions": len(instructions),
        "timestamp": datetime.now().isoformat()
    })
    
    log_heartbeat(f"✅ Cycle {cycle} complete")
    return 0

if __name__ == "__main__":
    raise SystemExit(main())
