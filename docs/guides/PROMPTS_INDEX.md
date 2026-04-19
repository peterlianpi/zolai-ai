# PROMPTS INDEX — Dictionary Rebuild V2

## 📚 COMPLETE PROMPT DOCUMENTATION

This index guides you to the right prompt document for your needs.

---

## 🎯 FOUR CORE DOCUMENTS

### 1. **SYSTEM_PROMPT_DICTIONARY_V2.md** (14 KB, 592 lines)
**Master system prompt for the entire rebuild pipeline**

**Contains:**
- Role definition (Senior AI System Architect, Linguist, Dataset Engineer)
- Core objective (build high-quality bidirectional dictionary)
- System architecture (10-step pipeline with 10 agents)
- Memory system (short-term + long-term)
- Heartbeat mode (live progress output)
- Final outputs (6 JSONL/JSON files)
- Execution strategy (3 phases)
- Success criteria (detailed metrics)

**Use when:**
- You need the complete system overview
- You want to understand the full pipeline
- You're designing the architecture
- You need to explain the system to others

**Key sections:**
- CORE OBJECTIVE (start here)
- SYSTEM ARCHITECTURE
- CORE PROCESS PIPELINE (10 STEPS)
- FINAL OUTPUTS
- EXECUTION STRATEGY

---

### 2. **AGENT_PROMPTS.md** (9 KB, 507 lines)
**Individual prompts for each of the 10 agents**

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
- Success metrics (detailed)

**Use when:**
- You're implementing individual agents
- You need specific agent behavior
- You want to understand agent responsibilities
- You're debugging a specific agent

**Key sections:**
- AGENT 1-10 (find your agent)
- AGENT COORDINATION
- MEMORY INTERFACE
- SUCCESS METRICS

---

### 3. **IMPLEMENTATION_GUIDE.md** (14 KB, 525 lines)
**Code examples and deployment instructions**

**Contains:**
- Quick start commands (3 commands to get started)
- Architecture overview (data flow, file structure)
- Implementation steps (code examples for each agent)
- Orchestrator pattern (full pipeline)
- Testing procedures (validation)
- Deployment steps (5 phases)
- Monitoring commands (progress tracking)
- Troubleshooting guide (common issues)

**Use when:**
- You're writing code
- You need code examples
- You're deploying the system
- You need to monitor progress
- You're troubleshooting issues

**Key sections:**
- QUICK START
- IMPLEMENTATION STEPS
- ORCHESTRATOR
- TESTING
- DEPLOYMENT
- MONITORING
- TROUBLESHOOTING

---

### 4. **PROMPT_QUICK_REFERENCE.md** (9 KB, 400+ lines)
**Quick reference card and navigation guide**

**Contains:**
- Navigation guide (where to find what)
- System overview (input → process → output)
- Execution flow (cycle diagram)
- Memory system (short-term + long-term)
- Success metrics (all criteria)
- Quick start (3 commands)
- 9 SOP explanation (context expansion)
- Entry format (JSON examples)
- File locations (all paths)
- Common commands (useful scripts)
- Language rules (ZVS standard)
- Learning resources (how to use)
- Help guide (troubleshooting)

**Use when:**
- You're lost and need guidance
- You need a quick overview
- You want to find something specific
- You need common commands
- You're new to the system

**Key sections:**
- QUICK NAVIGATION
- SYSTEM OVERVIEW
- QUICK START
- SUCCESS METRICS
- FILE LOCATIONS
- COMMON COMMANDS

---

## 🗺️ NAVIGATION GUIDE

### I need to understand the system
1. Read **PROMPT_QUICK_REFERENCE.md** (2 min overview)
2. Read **SYSTEM_PROMPT_DICTIONARY_V2.md** (full details)

### I need to implement an agent
1. Find your agent in **AGENT_PROMPTS.md**
2. Copy the prompt
3. Check **IMPLEMENTATION_GUIDE.md** for code examples

### I need to write code
1. Read **IMPLEMENTATION_GUIDE.md** (IMPLEMENTATION STEPS section)
2. Find your agent in **AGENT_PROMPTS.md**
3. Copy code examples and adapt

### I need to deploy
1. Read **IMPLEMENTATION_GUIDE.md** (DEPLOYMENT section)
2. Follow the 5 deployment steps
3. Use MONITORING section to track progress

### I need to monitor progress
1. Read **IMPLEMENTATION_GUIDE.md** (MONITORING section)
2. Use the provided commands
3. Check heartbeat log: `tail -f /data/processed/rebuild_v2/heartbeat.log`

### I need to troubleshoot
1. Read **IMPLEMENTATION_GUIDE.md** (TROUBLESHOOTING section)
2. Check common issues
3. Follow suggested solutions

### I'm lost
1. Read **PROMPT_QUICK_REFERENCE.md** (start here)
2. Use the navigation guide
3. Find the right document for your task

---

## 📊 DOCUMENT COMPARISON

| Document | Size | Lines | Purpose | Best For |
|----------|------|-------|---------|----------|
| SYSTEM_PROMPT_DICTIONARY_V2.md | 14 KB | 592 | Master system prompt | Understanding the full system |
| AGENT_PROMPTS.md | 9 KB | 507 | Individual agent prompts | Implementing agents |
| IMPLEMENTATION_GUIDE.md | 14 KB | 525 | Code examples & deployment | Writing code & deploying |
| PROMPT_QUICK_REFERENCE.md | 9 KB | 400+ | Quick reference & navigation | Quick lookups & getting started |

---

## 🎓 LEARNING PATH

### For Beginners
1. Start with **PROMPT_QUICK_REFERENCE.md** (5 min)
2. Read **SYSTEM_PROMPT_DICTIONARY_V2.md** (20 min)
3. Skim **AGENT_PROMPTS.md** (10 min)
4. Check **IMPLEMENTATION_GUIDE.md** for code examples (15 min)

### For Implementers
1. Read **SYSTEM_PROMPT_DICTIONARY_V2.md** (full system)
2. Find your agent in **AGENT_PROMPTS.md**
3. Copy code examples from **IMPLEMENTATION_GUIDE.md**
4. Implement and test

### For Deployers
1. Read **IMPLEMENTATION_GUIDE.md** (DEPLOYMENT section)
2. Follow the 5 deployment steps
3. Use MONITORING section to track progress
4. Use TROUBLESHOOTING section if issues arise

### For Maintainers
1. Read **SYSTEM_PROMPT_DICTIONARY_V2.md** (full system)
2. Read **AGENT_PROMPTS.md** (all agents)
3. Read **IMPLEMENTATION_GUIDE.md** (full guide)
4. Use MONITORING and TROUBLESHOOTING sections

---

## 🔍 QUICK LOOKUP

### I need to find...

**System architecture**
→ SYSTEM_PROMPT_DICTIONARY_V2.md → SYSTEM ARCHITECTURE

**10-step pipeline**
→ SYSTEM_PROMPT_DICTIONARY_V2.md → CORE PROCESS PIPELINE

**Agent responsibilities**
→ AGENT_PROMPTS.md → Find your agent

**Code examples**
→ IMPLEMENTATION_GUIDE.md → IMPLEMENTATION STEPS

**Deployment instructions**
→ IMPLEMENTATION_GUIDE.md → DEPLOYMENT

**Monitoring commands**
→ IMPLEMENTATION_GUIDE.md → MONITORING

**Troubleshooting**
→ IMPLEMENTATION_GUIDE.md → TROUBLESHOOTING

**Quick overview**
→ PROMPT_QUICK_REFERENCE.md → SYSTEM OVERVIEW

**File locations**
→ PROMPT_QUICK_REFERENCE.md → FILE LOCATIONS

**Common commands**
→ PROMPT_QUICK_REFERENCE.md → COMMON COMMANDS

**Success criteria**
→ PROMPT_QUICK_REFERENCE.md → SUCCESS METRICS

**9 SOP explanation**
→ PROMPT_QUICK_REFERENCE.md → 9 SOP

**Entry format**
→ PROMPT_QUICK_REFERENCE.md → ENTRY FORMAT

---

## 📋 DOCUMENT STRUCTURE

### SYSTEM_PROMPT_DICTIONARY_V2.md
```
1. ROLE & CONTEXT
2. CORE OBJECTIVE
3. SYSTEM ARCHITECTURE
4. CORE PROCESS PIPELINE (10 STEPS)
5. MEMORY SYSTEM
6. HEARTBEAT MODE
7. FINAL OUTPUTS
8. EXECUTION STRATEGY
9. OPTIONAL ENHANCEMENTS
10. SUCCESS CRITERIA
11. NOTES FOR IMPLEMENTATION
12. QUICK START
```

### AGENT_PROMPTS.md
```
1. AGENT 1: INGESTION AGENT
2. AGENT 2: DIRECTION DETECTION AGENT
3. AGENT 3: NORMALIZATION AGENT
4. AGENT 4: DICTIONARY BUILDER AGENT
5. AGENT 5: REVERSAL AGENT
6. AGENT 6: DEDUPLICATION AGENT
7. AGENT 7: CONTEXT EXPANSION AGENT
8. AGENT 8: EXTRACTION AGENT
9. AGENT 9: AUDIT AGENT
10. AGENT 10: LEARNING AGENT
11. AGENT COORDINATION
12. MEMORY INTERFACE
13. SUCCESS METRICS
```

### IMPLEMENTATION_GUIDE.md
```
1. QUICK START
2. ARCHITECTURE OVERVIEW
3. IMPLEMENTATION STEPS
4. ORCHESTRATOR
5. TESTING
6. DEPLOYMENT
7. MONITORING
8. TROUBLESHOOTING
```

### PROMPT_QUICK_REFERENCE.md
```
1. THREE CORE DOCUMENTS
2. QUICK NAVIGATION
3. SYSTEM OVERVIEW
4. EXECUTION FLOW
5. MEMORY SYSTEM
6. SUCCESS METRICS
7. QUICK START
8. 9 SOP
9. ENTRY FORMAT
10. FILE LOCATIONS
11. COMMON COMMANDS
12. LANGUAGE RULES
13. LEARNING RESOURCES
14. HELP GUIDE
```

---

## ✅ CHECKLIST

Before you start, make sure you have:

- [ ] Read **PROMPT_QUICK_REFERENCE.md** (quick overview)
- [ ] Read **SYSTEM_PROMPT_DICTIONARY_V2.md** (full system)
- [ ] Identified your role (architect, implementer, deployer, maintainer)
- [ ] Found the right document for your task
- [ ] Bookmarked the key sections
- [ ] Understood the 10-step pipeline
- [ ] Understood the 10 agents
- [ ] Understood the success criteria

---

## 🚀 QUICK START

### 1. Understand the System (5 min)
```bash
# Read quick reference
cat PROMPT_QUICK_REFERENCE.md | head -100
```

### 2. Read Full System (20 min)
```bash
# Read system prompt
cat SYSTEM_PROMPT_DICTIONARY_V2.md | head -200
```

### 3. Find Your Agent (5 min)
```bash
# Find your agent in agent prompts
grep -n "AGENT 7:" agents/AGENT_PROMPTS.md
```

### 4. Get Code Examples (10 min)
```bash
# Find implementation examples
grep -n "class.*Agent" IMPLEMENTATION_GUIDE.md
```

### 5. Deploy (30 min)
```bash
# Follow deployment steps
python scripts/rebuild_v2_comprehensive.py
```

---

## 📞 SUPPORT

### I'm confused about the system
→ Read **PROMPT_QUICK_REFERENCE.md** → QUICK NAVIGATION

### I don't know where to start
→ Read **PROMPT_QUICK_REFERENCE.md** → LEARNING RESOURCES

### I need code examples
→ Read **IMPLEMENTATION_GUIDE.md** → IMPLEMENTATION STEPS

### I need to deploy
→ Read **IMPLEMENTATION_GUIDE.md** → DEPLOYMENT

### I have an error
→ Read **IMPLEMENTATION_GUIDE.md** → TROUBLESHOOTING

### I need to monitor progress
→ Read **IMPLEMENTATION_GUIDE.md** → MONITORING

---

## 📈 DOCUMENT STATISTICS

| Metric | Value |
|--------|-------|
| Total Documents | 4 |
| Total Lines | 1,997 |
| Total Size | 46 KB |
| Average Document Size | 11.5 KB |
| Average Document Length | 499 lines |

---

## 🎯 KEY TAKEAWAYS

1. **SYSTEM_PROMPT_DICTIONARY_V2.md** = Master blueprint
2. **AGENT_PROMPTS.md** = Agent specifications
3. **IMPLEMENTATION_GUIDE.md** = Code & deployment
4. **PROMPT_QUICK_REFERENCE.md** = Quick lookup

---

## 📅 VERSION HISTORY

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-04-16 | Initial creation of 4 prompt documents |

---

## 🔗 RELATED FILES

### Existing Documentation
- `README.md` — Project overview
- `AGENTS.md` — Agent definitions
- `REBUILD_STATUS.md` — Current rebuild status

### Data Files
- `/data/processed/rebuild_v1/` — Existing v7 dictionaries
- `/data/processed/rebuild_v2/` — New v2 outputs
- `/Cleaned_Bible/` — Bible corpus

### Scripts
- `scripts/rebuild_v2_comprehensive.py` — Full pipeline
- `scripts/rebuild_v2_embeddings.py` — Search layer
- `scripts/agents/` — Individual agent implementations

---

**Last Updated:** 2026-04-16T03:10:19Z  
**Status:** ✅ All prompts ready for use  
**Next Step:** Choose your document and start reading!
