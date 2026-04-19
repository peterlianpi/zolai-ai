from __future__ import annotations
import json
import sqlite3
from pathlib import Path
from datetime import datetime
import hashlib
import sys
import re

PROJECT_ROOT = Path(__file__).resolve().parents[1]
WIKI_DIR = PROJECT_ROOT / "wiki"
DATA_DIR = PROJECT_ROOT / "data" / "processed" / "rebuild_v9"
DB_PATH = DATA_DIR / "wiki_ai_structure.db"
EXPORT_DIR = DATA_DIR / "wiki_exports"
LOG_FILE = DATA_DIR / "wiki_learning_log.txt"
EXPORT_DIR.mkdir(parents=True, exist_ok=True)

def log_msg(msg: str) -> None:
    ts = datetime.now().isoformat()
    line = f"[{ts}] {msg}"
    print(line)
    with open(LOG_FILE, "a", encoding="utf-8") as f:
        f.write(line + "\n")
    sys.stdout.flush()

def init_db() -> sqlite3.Connection:
    conn = sqlite3.connect(DB_PATH)
    conn.execute("""
        CREATE TABLE IF NOT EXISTS wiki_concepts (
            id TEXT PRIMARY KEY,
            concept TEXT,
            category TEXT,
            definition TEXT,
            examples TEXT,
            related_concepts TEXT,
            confidence REAL,
            source_file TEXT,
            created_at TEXT
        )
    """)
    conn.execute("""
        CREATE TABLE IF NOT EXISTS grammar_rules (
            id TEXT PRIMARY KEY,
            rule_name TEXT,
            pattern TEXT,
            explanation TEXT,
            examples TEXT,
            category TEXT,
            confidence REAL,
            source_file TEXT,
            created_at TEXT
        )
    """)
    conn.execute("""
        CREATE TABLE IF NOT EXISTS vocabulary_entries (
            id TEXT PRIMARY KEY,
            word TEXT,
            pos TEXT,
            definition TEXT,
            examples TEXT,
            domain TEXT,
            confidence REAL,
            source_file TEXT,
            created_at TEXT
        )
    """)
    conn.commit()
    return conn

def extract_wiki_concepts() -> dict:
    """Extract concepts from wiki files"""
    concepts = {}
    
    for md_file in WIKI_DIR.glob("**/*.md"):
        try:
            with open(md_file, encoding="utf-8") as f:
                content = f.read()
                
                # Extract headers as concepts
                headers = re.findall(r'^#+\s+(.+)$', content, re.MULTILINE)
                for header in headers:
                    concept_id = hashlib.md5(header.encode()).hexdigest()
                    concepts[concept_id] = {
                        "concept": header.strip(),
                        "category": md_file.parent.name,
                        "source_file": str(md_file.relative_to(PROJECT_ROOT)),
                        "confidence": 0.85
                    }
                
                # Extract definition patterns
                definitions = re.findall(r'(?:^|\n)(?:Definition|Concept|Meaning):\s*(.+?)(?:\n|$)', content, re.IGNORECASE)
                for defn in definitions:
                    defn_id = hashlib.md5(defn.encode()).hexdigest()
                    concepts[defn_id] = {
                        "concept": defn.strip()[:100],
                        "definition": defn.strip(),
                        "category": md_file.parent.name,
                        "source_file": str(md_file.relative_to(PROJECT_ROOT)),
                        "confidence": 0.80
                    }
        except:
            pass
    
    return concepts

def extract_grammar_rules() -> dict:
    """Extract grammar rules from wiki"""
    rules = {}
    
    for md_file in WIKI_DIR.glob("**/linguistics/**/*.md"):
        try:
            with open(md_file, encoding="utf-8") as f:
                content = f.read()
                
                # Extract rule patterns
                rule_patterns = re.findall(r'(?:Rule|Pattern|Structure):\s*(.+?)(?:\n|$)', content, re.IGNORECASE)
                for pattern in rule_patterns:
                    rule_id = hashlib.md5(pattern.encode()).hexdigest()
                    rules[rule_id] = {
                        "rule_name": pattern.strip()[:100],
                        "pattern": pattern.strip(),
                        "category": "grammar",
                        "source_file": str(md_file.relative_to(PROJECT_ROOT)),
                        "confidence": 0.85
                    }
        except:
            pass
    
    return rules

def extract_vocabulary() -> dict:
    """Extract vocabulary from wiki"""
    vocab = {}
    
    for md_file in WIKI_DIR.glob("**/vocabulary/**/*.md"):
        try:
            with open(md_file, encoding="utf-8") as f:
                content = f.read()
                
                # Extract word entries
                word_entries = re.findall(r'(?:^|\n)\*\*(.+?)\*\*:\s*(.+?)(?:\n|$)', content)
                for word, definition in word_entries:
                    word_id = hashlib.md5(f"{word}:{definition}".encode()).hexdigest()
                    vocab[word_id] = {
                        "word": word.strip(),
                        "definition": definition.strip(),
                        "domain": md_file.stem,
                        "source_file": str(md_file.relative_to(PROJECT_ROOT)),
                        "confidence": 0.80
                    }
        except:
            pass
    
    return vocab

def merge_wiki_learning(conn: sqlite3.Connection, concepts: dict, rules: dict, vocab: dict) -> tuple[int, int, int]:
    """Merge wiki learning into database"""
    cursor = conn.cursor()
    now = datetime.now().isoformat()
    
    concepts_added = 0
    rules_added = 0
    vocab_added = 0
    
    # Add concepts
    for concept_id, data in concepts.items():
        try:
            cursor.execute("""
                INSERT OR IGNORE INTO wiki_concepts 
                (id, concept, category, definition, confidence, source_file, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            """, (concept_id, data.get("concept", ""), data.get("category", ""), 
                  data.get("definition", ""), data.get("confidence", 0.75),
                  data.get("source_file", ""), now))
            concepts_added += 1
        except:
            pass
    
    # Add grammar rules
    for rule_id, data in rules.items():
        try:
            cursor.execute("""
                INSERT OR IGNORE INTO grammar_rules
                (id, rule_name, pattern, category, confidence, source_file, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            """, (rule_id, data.get("rule_name", ""), data.get("pattern", ""),
                  data.get("category", ""), data.get("confidence", 0.75),
                  data.get("source_file", ""), now))
            rules_added += 1
        except:
            pass
    
    # Add vocabulary
    for vocab_id, data in vocab.items():
        try:
            cursor.execute("""
                INSERT OR IGNORE INTO vocabulary_entries
                (id, word, definition, domain, confidence, source_file, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            """, (vocab_id, data.get("word", ""), data.get("definition", ""),
                  data.get("domain", ""), data.get("confidence", 0.75),
                  data.get("source_file", ""), now))
            vocab_added += 1
        except:
            pass
    
    conn.commit()
    return concepts_added, rules_added, vocab_added

def export_wiki_structure(conn: sqlite3.Connection) -> None:
    """Export wiki structure as AI-readable format"""
    cursor = conn.cursor()
    
    # Export concepts
    with open(EXPORT_DIR / "wiki_concepts.jsonl", "w", encoding="utf-8") as f:
        cursor.execute("SELECT concept, category, definition, confidence FROM wiki_concepts ORDER BY confidence DESC")
        for concept, category, definition, confidence in cursor.fetchall():
            f.write(json.dumps({
                "concept": concept,
                "category": category,
                "definition": definition,
                "confidence": confidence
            }, ensure_ascii=False) + "\n")
    
    # Export grammar rules
    with open(EXPORT_DIR / "grammar_rules.jsonl", "w", encoding="utf-8") as f:
        cursor.execute("SELECT rule_name, pattern, category, confidence FROM grammar_rules ORDER BY confidence DESC")
        for rule_name, pattern, category, confidence in cursor.fetchall():
            f.write(json.dumps({
                "rule": rule_name,
                "pattern": pattern,
                "category": category,
                "confidence": confidence
            }, ensure_ascii=False) + "\n")
    
    # Export vocabulary
    with open(EXPORT_DIR / "wiki_vocabulary.jsonl", "w", encoding="utf-8") as f:
        cursor.execute("SELECT word, definition, domain, confidence FROM vocabulary_entries ORDER BY confidence DESC")
        for word, definition, domain, confidence in cursor.fetchall():
            f.write(json.dumps({
                "word": word,
                "definition": definition,
                "domain": domain,
                "confidence": confidence
            }, ensure_ascii=False) + "\n")

def get_stats(conn: sqlite3.Connection) -> dict:
    """Get wiki learning stats"""
    cursor = conn.cursor()
    cursor.execute("SELECT COUNT(*) FROM wiki_concepts")
    concepts = cursor.fetchone()[0]
    cursor.execute("SELECT COUNT(*) FROM grammar_rules")
    rules = cursor.fetchone()[0]
    cursor.execute("SELECT COUNT(*) FROM vocabulary_entries")
    vocab = cursor.fetchone()[0]
    return {"concepts": concepts, "rules": rules, "vocabulary": vocab}

def main() -> int:
    log_msg("=== WIKI AI LEARNING SYSTEM ===\n")
    
    conn = init_db()
    
    log_msg("=== EXTRACTING WIKI KNOWLEDGE ===")
    concepts = extract_wiki_concepts()
    rules = extract_grammar_rules()
    vocab = extract_vocabulary()
    
    log_msg(f"  Concepts found: {len(concepts)}")
    log_msg(f"  Grammar rules found: {len(rules)}")
    log_msg(f"  Vocabulary entries found: {len(vocab)}")
    
    log_msg("\n=== LEARNING WIKI STRUCTURE ===")
    concepts_added, rules_added, vocab_added = merge_wiki_learning(conn, concepts, rules, vocab)
    
    log_msg(f"  Concepts learned: {concepts_added}")
    log_msg(f"  Grammar rules learned: {rules_added}")
    log_msg(f"  Vocabulary learned: {vocab_added}")
    
    stats = get_stats(conn)
    log_msg(f"\n=== WIKI LEARNING STATS ===")
    log_msg(f"  Total concepts: {stats['concepts']}")
    log_msg(f"  Total grammar rules: {stats['rules']}")
    log_msg(f"  Total vocabulary: {stats['vocabulary']}")
    
    log_msg("\n=== EXPORTING WIKI STRUCTURE ===")
    export_wiki_structure(conn)
    log_msg(f"  Exported to {EXPORT_DIR}")
    
    conn.close()
    
    log_msg("\n✅ Wiki AI learning complete")
    return 0

if __name__ == "__main__":
    raise SystemExit(main())
