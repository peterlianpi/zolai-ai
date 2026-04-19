# PROMPT QUICK REFERENCE — Dictionary Rebuild V2

## 📋 THREE CORE DOCUMENTS

### 1. SYSTEM_PROMPT_DICTIONARY_V2.md
**Purpose:** Master system prompt for the entire rebuild pipeline  
**Length:** 592 lines  
**Contains:**
- Role definition (Senior AI System Architect, Linguist, Dataset Engineer)
- Core objective (build high-quality bidirectional dictionary)
- System architecture (10-step pipeline)
- Memory system (short-term + long-term)
- Heartbeat mode (live output)
- Final outputs (6 JSONL/JSON files)
- Execution strategy (3 phases)
- Success criteria

**Use When:** You need the complete system overview or want to understand the full pipeline

---

### 2. AGENT_PROMPTS.md
**Purpose:** Individual prompts for each of the 10 agents  
**Length:** 507 lines  
**Contains:**
- Agent 1: Ingestion Agent (load all data)
- Agent 2: Direction Detection Agent (classify EN/ZO)
- Agent 3: Normalization Agent (clean text)
- Agent 4: Dictionary Builder Agent (create entries)
- Agent 5: Reversal Agent (create bidirectional mappings)
- Agent 6: Deduplication Agent (merge duplicates)
- Agent 7: Context Expansion Agent (add 9 SOP)
- Agent 8: Extraction Agent (extract sentences)
- Agent 9: Audit Agent (validate quality)
- Agent 10: Learning Agent (improve rules)
- Agent coordination (execution order, parallel execution)
- Memory interface (read/write state)

**Use When:** You're implementing individual agents or need specific agent behavior

---

### 3. IMPLEMENTATION_GUIDE.md
**Purpose:** Code examples and deployment instructions  
**Length:** 525 lines  
**Contains:**
- Quick start commands
- Architecture overview (data flow, file structure)
- Implementation steps (code examples for each agent)
- Orchestrator pattern
- Testing procedures
- Deployment steps
- Monitoring commands
- Troubleshooting guide

**Use When:** You're writing code or deploying the system

---

## 🎯 QUICK NAVIGATION

### I need to understand the system
→ Read **SYSTEM_PROMPT_DICTIONARY_V2.md** (start with "CORE OBJECTIVE" section)

### I need to implement an agent
→ Read **AGENT_PROMPTS.md** (find your agent, copy the prompt)

### I need to write code
→ Read **IMPLEMENTATION_GUIDE.md** (find "IMPLEMENTATION STEPS" section)

### I need to deploy
→ Read **IMPLEMENTATION_GUIDE.md** (find "DEPLOYMENT" section)

### I need to monitor progress
→ Read **IMPLEMENTATION_GUIDE.md** (find "MONITORING" section)

### I need to troubleshoot
→ Read **IMPLEMENTATION_GUIDE.md** (find "TROUBLESHOOTING" section)

---

## 📊 SYSTEM OVERVIEW

### Input
- 24,894 EN→ZO entries (existing v7)
- 21,259 ZO→EN entries (existing v7)
- 66 Bible books (all versions)
- External linguistic resources

### Process (10 Steps)
1. **Ingestion** — Load all data
2. **Direction Detection** — Classify EN/ZO
3. **Normalization** — Clean text
4. **Dictionary Builder** — Create entries
5. **Reversal** — Create bidirectional mappings
6. **Deduplication** — Merge duplicates
7. **Context Expansion** — Add 9 SOP (POS, synonyms, examples, etc.)
8. **Extraction** — Extract sentences from Bible
9. **Audit** — Validate quality
10. **Learning** — Improve rules

### Output
- `dictionary_en_zo_v2.jsonl` — 25,000+ EN→ZO entries
- `dictionary_zo_en_v2.jsonl` — 22,000+ ZO→EN entries
- `sentences_v2.jsonl` — 2,000+ parallel pairs
- `instructions_v2.jsonl` — Instruction dataset
- `relationships_v2.json` — Semantic graph
- `search_index_v2.json` — Search index

---

## 🔄 EXECUTION FLOW

```
Cycle 1
├── Ingestion Agent
├── Direction Detection Agent
├── Normalization Agent
├── Dictionary Builder Agent
├── Reversal Agent
├── Deduplication Agent
├── Context Expansion Agent
├── Extraction Agent
├── Audit Agent
└── Learning Agent
    ↓
Cycle 2 (with improved rules)
├── [Repeat all agents]
└── Learning Agent
    ↓
Cycle 3+ (continuous improvement)
```

---

## 💾 MEMORY SYSTEM

### Short-Term Memory
- **File:** `/memory/state.jsonl`
- **Content:** Current cycle state
- **Lifetime:** Single cycle
- **Use:** Resume interrupted cycles

### Long-Term Memory
- **Files:**
  - `/memory/rules.json` — Detection + mapping rules
  - `/memory/dictionary.db` — SQLite FTS5 index
  - `/memory/embeddings/` — Word vectors
  - `/memory/audit.log` — Quality metrics history

---

## 📈 SUCCESS METRICS

### Dictionary Quality
- ✅ 25,000+ EN→ZO entries
- ✅ 22,000+ ZO→EN entries
- ✅ 95%+ bidirectional coverage
- ✅ 0 encoding errors

### Context Richness
- ✅ 90%+ entries have POS
- ✅ 80%+ entries have examples
- ✅ 70%+ entries have related words
- ✅ All entries have source tag

### Sentence Dataset
- ✅ 2,000+ parallel pairs
- ✅ All pairs validated
- ✅ Diverse topics
- ✅ Clean UTF-8 encoding

### Production Ready
- ✅ Search index built
- ✅ API layer functional
- ✅ Prisma integration complete
- ✅ Real-time updates working

---

## 🚀 QUICK START

### Run Full Pipeline
```bash
cd /path/to/zolai
python scripts/rebuild_v2_comprehensive.py
```

### Build Search Layer
```bash
python scripts/rebuild_v2_embeddings.py
```

### Deploy to Next.js
```bash
cd website/zolai-project
bun install
bunx prisma migrate dev
bun dev
```

### Monitor Progress
```bash
tail -f /data/processed/rebuild_v2/heartbeat.log
```

---

## 🧠 9 SOP (CONTEXT EXPANSION)

Each entry gets enriched with:

1. **POS** — Part of Speech (verb, noun, adjective, etc.)
2. **Synonyms** — Words with similar meaning
3. **Antonyms** — Words with opposite meaning
4. **Domains** — religion, daily, education, culture
5. **Register** — formal, informal, archaic, slang
6. **Examples** — 2-3 example sentences
7. **Related Words** — Semantically linked entries
8. **Etymology** — Source or origin
9. **Frequency** — Count in corpus

---

## 📝 ENTRY FORMAT

### EN→ZO Entry
```json
{
  "en": "eat",
  "zo": "ne",
  "pos": "verb",
  "confidence": 1.0,
  "source": ["dictionary", "bible"],
  "topic": "daily",
  "synonyms": ["ei"],
  "examples": ["Ka ne hi.", "I eat."],
  "related": ["khat", "thei"],
  "frequency": 156
}
```

### ZO→EN Entry
```json
{
  "zo": "ne",
  "en": ["eat", "consume"],
  "pos": "verb",
  "confidence": 1.0,
  "source": ["dictionary", "bible"],
  "frequency": 156
}
```

### Parallel Sentence
```json
{
  "text": "Ka ne hi.",
  "translation_en": "I eat.",
  "language": "Zomi",
  "dialect": "Tedim",
  "topic": "daily",
  "data_type": "parallel",
  "source": "bible"
}
```

---

## 🔗 FILE LOCATIONS

### Prompts
- `SYSTEM_PROMPT_DICTIONARY_V2.md` — Master system prompt
- `agents/AGENT_PROMPTS.md` — Individual agent prompts
- `IMPLEMENTATION_GUIDE.md` — Code examples and deployment

### Data
- `/data/processed/rebuild_v1/` — Existing v7 dictionaries
- `/data/processed/rebuild_v2/` — New v2 outputs
- `/Cleaned_Bible/` — Bible corpus (66 books)

### Scripts
- `scripts/rebuild_v2_comprehensive.py` — Full pipeline
- `scripts/rebuild_v2_embeddings.py` — Search layer
- `scripts/agents/` — Individual agent implementations

### Website
- `website/zolai-project/` — Next.js app
- `website/zolai-project/lib/dictionary-api.ts` — API layer

---

## ⚡ COMMON COMMANDS

### Check Progress
```bash
tail -20 /data/processed/rebuild_v2/heartbeat.log
```

### Check Errors
```bash
tail -20 /data/processed/rebuild_v2/memory/errors.log
```

### Check Audit Results
```bash
cat /data/processed/rebuild_v2/audit_v2.json | python -m json.tool
```

### Validate Output
```bash
python -c "import json; [json.loads(l) for l in open('data/processed/rebuild_v2/dictionary_en_zo_v2.jsonl')]"
```

### Count Entries
```bash
wc -l /data/processed/rebuild_v2/dictionary_en_zo_v2.jsonl
```

---

## 📚 LANGUAGE RULES (ZVS STANDARD)

- **Dialect:** Tedim (never Hakha/Falam)
- **Word Order:** SOV (Subject-Object-Verb)
- **Negation:** Use `kei` not `lo` for conditionals
- **Plural:** Never combine `uh` with `i` (we)
- **Phonetics:** `o` is always /oʊ/ (ou)

---

## 🎓 LEARNING RESOURCES

### For Understanding the System
1. Read `SYSTEM_PROMPT_DICTIONARY_V2.md` (full overview)
2. Read `AGENT_PROMPTS.md` (agent details)
3. Read `IMPLEMENTATION_GUIDE.md` (code examples)

### For Implementing Agents
1. Find your agent in `AGENT_PROMPTS.md`
2. Copy the prompt
3. Implement in Python following the pattern
4. Test with sample data
5. Integrate into orchestrator

### For Deploying
1. Run `rebuild_v2_comprehensive.py`
2. Run `rebuild_v2_embeddings.py`
3. Seed Prisma database
4. Start Next.js server
5. Monitor with `tail -f heartbeat.log`

---

## 🆘 NEED HELP?

### System doesn't work?
→ Check `TROUBLESHOOTING` in `IMPLEMENTATION_GUIDE.md`

### Don't understand a step?
→ Find the step in `SYSTEM_PROMPT_DICTIONARY_V2.md`

### Need to implement an agent?
→ Find the agent in `AGENT_PROMPTS.md`

### Need code examples?
→ Check `IMPLEMENTATION_GUIDE.md`

---

**Last Updated:** 2026-04-16T03:10:19Z  
**Status:** ✅ All prompts ready for use  
**Next Step:** Choose your implementation approach (Python agents, Node.js orchestrator, or hybrid)
