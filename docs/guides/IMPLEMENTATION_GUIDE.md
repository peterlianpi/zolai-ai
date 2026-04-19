# IMPLEMENTATION GUIDE — Dictionary Rebuild V2

This guide shows how to implement the system prompt and agent prompts in code.

---

## QUICK START

### 1. Run Full Pipeline (All Cycles)
```bash
cd /path/to/zolai
python scripts/rebuild_v2_comprehensive.py
```

### 2. Build Search Layer
```bash
python scripts/rebuild_v2_embeddings.py
```

### 3. Integrate with Next.js
```bash
cd website/zolai-project
bun install
bunx prisma migrate dev
bun dev
```

### 4. Monitor Progress
```bash
tail -f /data/processed/rebuild_v2/heartbeat.log
```

---

## ARCHITECTURE OVERVIEW

### Data Flow
```
Ingestion Agent
    ↓
Direction Detection Agent
    ↓
Normalization Agent
    ↓
Dictionary Builder Agent
    ↓
Reversal Agent
    ↓
Deduplication Agent
    ↓
Context Expansion Agent
    ↓
Extraction Agent
    ↓
Audit Agent
    ↓
Learning Agent
    ↓
Output Files
```

### File Structure
```
/data/processed/rebuild_v2/
├── dictionary_en_zo_v2.jsonl      # EN→ZO entries
├── dictionary_zo_en_v2.jsonl      # ZO→EN entries
├── sentences_v2.jsonl             # Parallel sentences
├── instructions_v2.jsonl          # Instruction dataset
├── relationships_v2.json          # Semantic graph
├── search_index_v2.json           # Search index
├── semantic_vectors_v2.json       # Word vectors
├── audit_v2.json                  # Quality metrics
└── memory/
    ├── state.jsonl                # Cycle state
    ├── heartbeat.log              # Progress log
    ├── rules.json                 # Detection rules
    └── errors.log                 # Error log
```

---

## IMPLEMENTATION STEPS

### Step 1: Ingestion Agent

**File:** `scripts/agents/ingestion_agent.py`

```python
from __future__ import annotations
import json
from pathlib import Path
from datetime import datetime

class IngestionAgent:
    def __init__(self, project_root: Path):
        self.project_root = project_root
        self.data_dir = project_root / "data" / "processed" / "rebuild_v2"
        self.data_dir.mkdir(parents=True, exist_ok=True)
    
    def load_existing_dictionaries(self) -> tuple[list[dict], list[dict]]:
        """Load existing v7 dictionaries"""
        en_zo_entries = []
        zo_en_entries = []
        
        v7_en = self.project_root / "data" / "processed" / "rebuild_v1" / "final_en_zo_dictionary_v7.jsonl"
        v7_zo = self.project_root / "data" / "processed" / "rebuild_v1" / "final_zo_en_dictionary_v7.jsonl"
        
        if v7_en.exists():
            with open(v7_en, encoding="utf-8") as f:
                for line in f:
                    en_zo_entries.append(json.loads(line))
        
        if v7_zo.exists():
            with open(v7_zo, encoding="utf-8") as f:
                for line in f:
                    zo_en_entries.append(json.loads(line))
        
        return en_zo_entries, zo_en_entries
    
    def load_bible_corpus(self) -> list[dict]:
        """Load all 66 Bible books"""
        bible_entries = []
        bible_dir = self.project_root / "Cleaned_Bible"
        
        if not bible_dir.exists():
            return bible_entries
        
        for bible_file in bible_dir.glob("*.txt"):
            try:
                with open(bible_file, encoding="utf-8") as f:
                    content = f.read()
                    bible_entries.append({
                        "file": bible_file.name,
                        "content": content,
                        "source": "bible"
                    })
            except Exception as e:
                print(f"Error loading {bible_file}: {e}")
        
        return bible_entries
    
    def validate_encoding(self, entries: list[dict]) -> int:
        """Validate UTF-8 encoding"""
        errors = 0
        for entry in entries:
            try:
                json.dumps(entry, ensure_ascii=False)
            except Exception:
                errors += 1
        return errors
    
    def run(self) -> dict:
        """Execute ingestion"""
        print("[Ingestion] Loading dictionaries...")
        en_zo, zo_en = self.load_existing_dictionaries()
        
        print("[Ingestion] Loading Bible corpus...")
        bible = self.load_bible_corpus()
        
        print("[Ingestion] Validating encoding...")
        errors = self.validate_encoding(en_zo + zo_en)
        
        result = {
            "source": "ingestion",
            "timestamp": datetime.now().isoformat(),
            "loaded": {
                "en_zo_entries": len(en_zo),
                "zo_en_entries": len(zo_en),
                "bible_files": len(bible),
            },
            "encoding_errors": errors,
            "status": "ready"
        }
        
        return result
```

### Step 2: Direction Detection Agent

**File:** `scripts/agents/direction_detection_agent.py`

```python
from __future__ import annotations
import re

class DirectionDetectionAgent:
    def __init__(self):
        self.english_words = set([
            "the", "a", "an", "and", "or", "but", "in", "on", "at",
            "eat", "drink", "sleep", "walk", "run", "jump", "sit",
            # ... add more common English words
        ])
        
        self.zo_phonetics = ["kh", "th", "ng", "ph", "ch", "sh"]
    
    def is_english(self, word: str) -> bool:
        """Detect if word is English"""
        word_lower = word.lower()
        
        # Check if ASCII-only
        if not all(ord(c) < 128 for c in word):
            return False
        
        # Check if known English word
        if word_lower in self.english_words:
            return True
        
        # Check length
        if len(word) < 2:
            return False
        
        return True
    
    def is_zo(self, word: str) -> bool:
        """Detect if word is Zo"""
        word_lower = word.lower()
        
        # Check for Zo phonetics
        for phonetic in self.zo_phonetics:
            if phonetic in word_lower:
                return True
        
        # Check for non-ASCII
        if any(ord(c) > 127 for c in word):
            return True
        
        return False
    
    def detect_direction(self, headword: str) -> dict:
        """Detect direction and confidence"""
        is_en = self.is_english(headword)
        is_zo = self.is_zo(headword)
        
        if is_en and not is_zo:
            return {
                "direction": "en_to_zo",
                "confidence": 0.95,
                "reason": "English characteristics detected"
            }
        elif is_zo and not is_en:
            return {
                "direction": "zo_to_en",
                "confidence": 0.95,
                "reason": "Zo characteristics detected"
            }
        else:
            return {
                "direction": "unknown",
                "confidence": 0.5,
                "reason": "Ambiguous characteristics"
            }
    
    def run(self, entries: list[dict]) -> list[dict]:
        """Execute direction detection"""
        results = []
        for entry in entries:
            headword = entry.get("en") or entry.get("zo", "")
            detection = self.detect_direction(headword)
            
            entry["direction"] = detection["direction"]
            entry["confidence"] = detection["confidence"]
            results.append(entry)
        
        return results
```

### Step 3: Normalization Agent

**File:** `scripts/agents/normalization_agent.py`

```python
from __future__ import annotations
import unicodedata

class NormalizationAgent:
    def normalize_text(self, text: str) -> str:
        """Normalize text"""
        # Remove extra whitespace
        text = " ".join(text.split())
        
        # Normalize Unicode (NFC)
        text = unicodedata.normalize("NFC", text)
        
        # Remove trailing punctuation (except apostrophes)
        text = text.rstrip(".,!?;:")
        
        return text
    
    def run(self, entries: list[dict]) -> list[dict]:
        """Execute normalization"""
        for entry in entries:
            if "en" in entry:
                entry["en"] = self.normalize_text(entry["en"])
            if "zo" in entry:
                entry["zo"] = self.normalize_text(entry["zo"])
        
        return entries
```

### Step 4-10: Other Agents

Similar structure for remaining agents. Each agent:
1. Inherits from `Agent` base class
2. Implements `run()` method
3. Logs to heartbeat
4. Updates state
5. Returns results

---

## ORCHESTRATOR

**File:** `scripts/rebuild_v2_orchestrator.py`

```python
from __future__ import annotations
import json
from pathlib import Path
from datetime import datetime
from agents.ingestion_agent import IngestionAgent
from agents.direction_detection_agent import DirectionDetectionAgent
from agents.normalization_agent import NormalizationAgent
# ... import other agents

class Orchestrator:
    def __init__(self, project_root: Path):
        self.project_root = project_root
        self.data_dir = project_root / "data" / "processed" / "rebuild_v2"
        self.memory_dir = self.data_dir / "memory"
        self.memory_dir.mkdir(parents=True, exist_ok=True)
        
        self.heartbeat_file = self.data_dir / "heartbeat.log"
        self.state_file = self.memory_dir / "state.jsonl"
    
    def log_heartbeat(self, msg: str) -> None:
        """Log heartbeat message"""
        ts = datetime.now().isoformat()
        line = f"[{ts}] {msg}"
        print(line)
        with open(self.heartbeat_file, "a", encoding="utf-8") as f:
            f.write(line + "\n")
    
    def save_state(self, state: dict) -> None:
        """Save state to memory"""
        with open(self.state_file, "a", encoding="utf-8") as f:
            f.write(json.dumps(state, ensure_ascii=False) + "\n")
    
    def run_cycle(self, cycle: int) -> None:
        """Run single cycle"""
        self.log_heartbeat(f"=== CYCLE {cycle} START ===")
        
        # Agent 1: Ingestion
        self.log_heartbeat("Running Ingestion Agent...")
        ingestion = IngestionAgent(self.project_root)
        en_zo, zo_en = ingestion.load_existing_dictionaries()
        self.log_heartbeat(f"Loaded {len(en_zo)} EN→ZO entries")
        
        # Agent 2: Direction Detection
        self.log_heartbeat("Running Direction Detection Agent...")
        detection = DirectionDetectionAgent()
        en_zo = detection.run(en_zo)
        self.log_heartbeat(f"Classified {len(en_zo)} entries")
        
        # Agent 3: Normalization
        self.log_heartbeat("Running Normalization Agent...")
        normalization = NormalizationAgent()
        en_zo = normalization.run(en_zo)
        self.log_heartbeat(f"Normalized {len(en_zo)} entries")
        
        # ... run remaining agents
        
        self.log_heartbeat(f"=== CYCLE {cycle} COMPLETE ===")
    
    def run(self, num_cycles: int = 1) -> None:
        """Run full pipeline"""
        for cycle in range(1, num_cycles + 1):
            self.run_cycle(cycle)

if __name__ == "__main__":
    project_root = Path("/path/to/zolai")
    orchestrator = Orchestrator(project_root)
    orchestrator.run(num_cycles=1)
```

---

## TESTING

### Test Ingestion
```bash
python -c "
from scripts.agents.ingestion_agent import IngestionAgent
from pathlib import Path

agent = IngestionAgent(Path('.'))
result = agent.run()
print(result)
"
```

### Test Direction Detection
```bash
python -c "
from scripts.agents.direction_detection_agent import DirectionDetectionAgent

agent = DirectionDetectionAgent()
result = agent.detect_direction('eat')
print(result)

result = agent.detect_direction('ne')
print(result)
"
```

### Validate Output
```bash
python -c "
import json
with open('data/processed/rebuild_v2/dictionary_en_zo_v2.jsonl') as f:
    for line in f:
        entry = json.loads(line)
        assert 'en' in entry
        assert 'zo' in entry
print('✅ All entries valid')
"
```

---

## DEPLOYMENT

### 1. Run Pipeline
```bash
python scripts/rebuild_v2_orchestrator.py
```

### 2. Build Search Layer
```bash
python scripts/rebuild_v2_embeddings.py
```

### 3. Seed Database
```bash
cd website/zolai-project
bunx prisma migrate dev
bunx tsx scripts/seed-dictionary.ts
```

### 4. Start Server
```bash
bun dev
```

### 5. Monitor
```bash
tail -f /data/processed/rebuild_v2/heartbeat.log
```

---

## MONITORING

### Check Progress
```bash
tail -20 /data/processed/rebuild_v2/heartbeat.log
```

### Check Errors
```bash
tail -20 /data/processed/rebuild_v2/memory/errors.log
```

### Check State
```bash
tail -1 /data/processed/rebuild_v2/memory/state.jsonl | python -m json.tool
```

### Check Audit
```bash
cat /data/processed/rebuild_v2/audit_v2.json | python -m json.tool
```

---

## TROUBLESHOOTING

### Issue: Encoding Errors
**Solution:** Ensure all files are UTF-8 encoded
```bash
file -i /data/processed/rebuild_v1/*.jsonl
```

### Issue: Missing Bible Files
**Solution:** Check Bible directory exists
```bash
ls -la /path/to/zolai/Cleaned_Bible/ | head
```

### Issue: Slow Performance
**Solution:** Use streaming instead of loading entire files
```python
# ❌ Wrong
data = json.load(open("file.jsonl"))

# ✅ Right
with open("file.jsonl") as f:
    for line in f:
        entry = json.loads(line)
```

---

## NEXT STEPS

1. ✅ Run full pipeline (Cycle 1-2)
2. ✅ Build search layer
3. ⏳ Integrate with Next.js API
4. ⏳ Deploy to production
5. ⏳ Monitor user corrections
6. ⏳ Continuous improvement (Cycle 3+)

---

**Status:** Ready for implementation  
**Last Updated:** 2026-04-16T03:10:19Z
