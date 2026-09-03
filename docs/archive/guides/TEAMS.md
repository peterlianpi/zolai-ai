# Zolai AI Agents — Team Configuration

> Multi-agent system for Zolai language data pipeline.
> Each agent has a specific role, tools, and communication protocol.

---

## Team Hierarchy

```
Junior Peter (Project Orchestrator)
├── Data Operations (Dept 3)
│   ├── Zomi Crawler Bot      — Web discovery & data acquisition
│   ├── Zomi Cleaner Bot      — Purification & normalization
│   ├── Zomi Trainer Bot      — Fine-tuning & LLM prep
│   └── Zomi Ops Monitor      — Log monitoring & health checks
│
├── AI Data Engineering (Dept 7)
│   └── Zomi Data Manager     — Dataset lifecycle coordination
│
├── Linguistics (Dept 1)
│   ├── Zolai Learner         — Language teaching & dialect analysis
│   └── Linguistic Specialist — SOV grammar, dialect awareness
│
├── AI Research (Dept 8)
│   └── Zomi Philosopher      — Cultural content & reasoning
│
└── Public Interface
    └── Zolai Tangval/Nungak  — Public persona modes
```

---

## Agents

### 1. Zomi Crawler Bot
- **Role:** Discover and acquire Zolai content from the web
- **Tools:** `zolai crawl`, `zolai ingest`, `zolai status`
- **Input:** Seed URLs, search topics
- **Output:** `data/raw/` (JSONL)
- **Rule:** NEVER mix Zolai with Mizo, Falam, or other dialects
- **Config:** `agents/zomi-crawler-bot/agent.json`

### 2. Zomi Cleaner Bot
- **Role:** Normalize, deduplicate, validate Zolai dataset
- **Tools:** `zolai clean`, `zolai dedup`, `zolai dictionary`, `zolai bible`
- **Input:** `data/raw/`
- **Output:** `data/processed/`
- **Gold Standard:** Tedim Bible vocabulary, LT Tuang + ZCLS
- **Config:** `agents/zomi-cleaner-bot/agent.json`

### 3. Zomi Trainer Bot
- **Role:** Prepare training splits, run fine-tuning loops
- **Tools:** `zolai train`, `zolai stats`, Kaggle API
- **Input:** `data/processed/`
- **Output:** `data/training/` (train/val/test splits, HF DatasetDict)
- **Config:** `agents/zomi-trainer-bot/agent.json`

### 4. Zomi Ops Monitor
- **Role:** Monitor pipeline health, alert on issues
- **Tools:** `zolai status`, log tailing, service control
- **Input:** Pipeline logs, queue status
- **Output:** Alerts, recovery commands
- **Config:** `agents/zomi-ops-monitor/agent.json`

### 5. Zomi Data Manager
- **Role:** Coordinate data lifecycle across all stages
- **Tools:** `zolai unify`, `zolai filter-zolai`, dataset versioning
- **Input:** All data stages
- **Output:** Promoted datasets, integrity reports
- **Config:** `agents/zomi-data/agent.json`

### 6. Zolai Learner
- **Role:** Language teaching, dialect analysis, cultural content
- **Tools:** Dictionary search, grammar reference, translation
- **Input:** User queries, new contributions
- **Output:** Lessons, corrections, cultural explanations
- **Config:** `agents/zolai-learner/agent.json`

### 7. Linguistic Specialist
- **Role:** SOV grammar rules, dialect verification, morphology
- **Tools:** Grammar cheat sheet, vocabulary lists, purity checker
- **Input:** Text to analyze
- **Output:** Grammar corrections, dialect classification
- **Config:** `agents/linguistic-specialist/agent.json`

### 8. Zomi Philosopher
- **Role:** Cultural reasoning, metaphor interpretation, deep analysis
- **Tools:** Gentehna (cultural metaphors), historical texts
- **Input:** Complex queries, cultural questions
- **Output:** Deep explanations with cultural context
- **Config:** `agents/zomi-philosopher/agent.json`

---

## Skills

| Skill | Trigger | Script | Purpose |
|-------|---------|--------|---------|
| `zolai-training-orchestrator` | "run training pipeline" | `skills/zolai-training-orchestrator/run.sh` | 8-stage training pipeline |
| `zolai-language-verifier-gemini` | "verify zolai or not" | `skills/verify-zolai-gemini.py` | Classify text as Zolai |
| `zolai-fetch-verify-autocontinue` | "fetch verify cycle" | `skills/run-fetch-verify.sh` | Web mining pipeline |
| `zolai-corporate-layout-manager` | "restructure folders" | `skills/setup-layout.sh` | Data directory management |
| `zolai-train-candidates-exporter` | "export train candidates" | `skills/export-train-candidates.py` | Filter & export training data |
| `zolai-web-dataset-miner` | "mine web for zolai" | `skills/fetch-web-corpus.py` | Web corpus extraction |

---

## Communication Protocol

1. **Crawler → Cleaner:** Raw JSONL files in `data/raw/`
2. **Cleaner → Trainer:** Cleaned JSONL in `data/processed/`
3. **Trainer → Data Manager:** Training splits in `data/training/`
4. **Ops Monitor → All:** Alerts on failures, queue buildup
5. **Data Manager → Crawler:** New seed URLs from gaps analysis
6. **Learner → Cleaner:** User corrections feed back into pipeline

---

## Standards

- **Language Identity:** Use "Zomi", not "Chin"
- **Pure Zolai Rule:** Never mix with Mizo, Falam, or other dialects
- **Gold Standard:** LT Tuang (2018) + ZCLS + Tedim Bible
- **Target:** 500MB+ Zolai corpus (currently 6.2GB achieved)
- **Output Format:** JSONL with `text`, `source`, `sha256`, `language`
