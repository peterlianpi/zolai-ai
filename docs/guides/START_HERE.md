# 🚀 START HERE — Dictionary Rebuild V2 Prompts

Welcome! This document guides you to the right prompt for your needs.

---

## ⚡ QUICK CHOICE

### What do you want to do?

**I'm new to this project**
→ Read [PROMPTS_INDEX.md](PROMPTS_INDEX.md) (5 min)

**I need a quick overview**
→ Read [PROMPT_QUICK_REFERENCE.md](PROMPT_QUICK_REFERENCE.md) (10 min)

**I need to understand the full system**
→ Read [SYSTEM_PROMPT_DICTIONARY_V2.md](SYSTEM_PROMPT_DICTIONARY_V2.md) (20 min)

**I need to implement an agent**
→ Read [agents/AGENT_PROMPTS.md](agents/AGENT_PROMPTS.md) (15 min)

**I need to write code**
→ Read [IMPLEMENTATION_GUIDE.md](IMPLEMENTATION_GUIDE.md) (20 min)

**I need to deploy**
→ Read [IMPLEMENTATION_GUIDE.md](IMPLEMENTATION_GUIDE.md) → DEPLOYMENT section (10 min)

---

## 📚 FIVE CORE DOCUMENTS

### 1. PROMPTS_INDEX.md
**Complete index and navigation guide**
- Document comparison (size, lines, purpose)
- Learning paths for different roles
- Quick lookup for specific topics
- Document structure overview
- Checklist before you start

**Best for:** Finding the right document

---

### 2. PROMPT_QUICK_REFERENCE.md
**Quick reference card**
- System overview (input → process → output)
- Execution flow diagram
- Success metrics
- Quick start commands
- 9 SOP explanation
- Entry format examples
- Common commands
- Language rules

**Best for:** Quick lookups and getting started

---

### 3. SYSTEM_PROMPT_DICTIONARY_V2.md
**Master system prompt**
- Role definition
- Core objective
- System architecture (10-step pipeline)
- Memory system
- Heartbeat mode
- Final outputs
- Execution strategy
- Success criteria

**Best for:** Understanding the full system

---

### 4. AGENT_PROMPTS.md
**Individual agent prompts**
- Agent 1-10 specifications
- Agent coordination
- Memory interface
- Success metrics

**Best for:** Implementing individual agents

---

### 5. IMPLEMENTATION_GUIDE.md
**Code examples and deployment**
- Quick start commands
- Architecture overview
- Implementation steps (code examples)
- Orchestrator pattern
- Testing procedures
- Deployment steps
- Monitoring commands
- Troubleshooting guide

**Best for:** Writing code and deploying

---

## 🎯 LEARNING PATHS

### Path 1: Beginner (30 min)
1. Read this file (5 min)
2. Read PROMPTS_INDEX.md (5 min)
3. Read PROMPT_QUICK_REFERENCE.md (10 min)
4. Skim SYSTEM_PROMPT_DICTIONARY_V2.md (10 min)

### Path 2: Implementer (1 hour)
1. Read SYSTEM_PROMPT_DICTIONARY_V2.md (20 min)
2. Find your agent in AGENT_PROMPTS.md (10 min)
3. Read IMPLEMENTATION_GUIDE.md (20 min)
4. Start coding (10 min)

### Path 3: Deployer (45 min)
1. Read PROMPT_QUICK_REFERENCE.md (10 min)
2. Read IMPLEMENTATION_GUIDE.md → DEPLOYMENT (15 min)
3. Run deployment commands (20 min)

### Path 4: Maintainer (2 hours)
1. Read SYSTEM_PROMPT_DICTIONARY_V2.md (20 min)
2. Read AGENT_PROMPTS.md (20 min)
3. Read IMPLEMENTATION_GUIDE.md (20 min)
4. Review monitoring and troubleshooting (20 min)

---

## 📊 SYSTEM AT A GLANCE

### Input
- 24,894 EN→ZO entries (existing)
- 21,259 ZO→EN entries (existing)
- 66 Bible books
- External resources

### Process
10-step pipeline with 10 agents:
1. Ingestion
2. Direction Detection
3. Normalization
4. Dictionary Builder
5. Reversal
6. Deduplication
7. Context Expansion (9 SOP)
8. Extraction
9. Audit
10. Learning

### Output
- 25,000+ EN→ZO entries
- 22,000+ ZO→EN entries
- 2,000+ parallel sentences
- Instruction dataset
- Semantic graph
- Search index

---

## ✅ SUCCESS CRITERIA

**Dictionary Quality**
- 25,000+ EN→ZO entries
- 22,000+ ZO→EN entries
- 95%+ bidirectional coverage
- 0 encoding errors

**Context Richness**
- 90%+ entries have POS
- 80%+ entries have examples
- 70%+ entries have related words
- All entries have source tag

**Sentence Dataset**
- 2,000+ parallel pairs
- All pairs validated
- Diverse topics
- Clean UTF-8 encoding

**Production Ready**
- Search index built
- API layer functional
- Prisma integration complete
- Real-time updates working

---

## 🚀 QUICK START (3 COMMANDS)

```bash
# 1. Run full pipeline
python scripts/rebuild_v2_comprehensive.py

# 2. Build search layer
python scripts/rebuild_v2_embeddings.py

# 3. Monitor progress
tail -f /data/processed/rebuild_v2/heartbeat.log
```

---

## 📁 FILE LOCATIONS

**Prompts**
- `SYSTEM_PROMPT_DICTIONARY_V2.md` — Master system prompt
- `agents/AGENT_PROMPTS.md` — Individual agent prompts
- `IMPLEMENTATION_GUIDE.md` — Code examples and deployment
- `PROMPT_QUICK_REFERENCE.md` — Quick reference card
- `PROMPTS_INDEX.md` — Complete index

**Data**
- `/data/processed/rebuild_v1/` — Existing v7 dictionaries
- `/data/processed/rebuild_v2/` — New v2 outputs
- `/Cleaned_Bible/` — Bible corpus (66 books)

**Scripts**
- `scripts/rebuild_v2_comprehensive.py` — Full pipeline
- `scripts/rebuild_v2_embeddings.py` — Search layer
- `scripts/agents/` — Individual agent implementations

**Website**
- `website/zolai-project/` — Next.js app
- `website/zolai-project/lib/dictionary-api.ts` — API layer

---

## 🔗 NAVIGATION

### I need to...

**Understand the system**
→ SYSTEM_PROMPT_DICTIONARY_V2.md → CORE OBJECTIVE

**Implement an agent**
→ AGENT_PROMPTS.md → Find your agent

**Write code**
→ IMPLEMENTATION_GUIDE.md → IMPLEMENTATION STEPS

**Deploy**
→ IMPLEMENTATION_GUIDE.md → DEPLOYMENT

**Monitor progress**
→ IMPLEMENTATION_GUIDE.md → MONITORING

**Troubleshoot**
→ IMPLEMENTATION_GUIDE.md → TROUBLESHOOTING

**Find something specific**
→ PROMPTS_INDEX.md → QUICK LOOKUP

**Get quick overview**
→ PROMPT_QUICK_REFERENCE.md

---

## 💡 KEY CONCEPTS

### 10-Step Pipeline
1. **Ingestion** — Load all data
2. **Direction Detection** — Classify EN/ZO
3. **Normalization** — Clean text
4. **Dictionary Builder** — Create entries
5. **Reversal** — Create bidirectional mappings
6. **Deduplication** — Merge duplicates
7. **Context Expansion** — Add 9 SOP
8. **Extraction** — Extract sentences
9. **Audit** — Validate quality
10. **Learning** — Improve rules

### 9 SOP (Context Expansion)
1. POS (Part of Speech)
2. Synonyms
3. Antonyms
4. Domains
5. Register
6. Examples
7. Related Words
8. Etymology
9. Frequency

### 3 Phases
1. **Immediate** (Cycle 1-2) — Build core dictionary
2. **Integration** (Cycle 3-4) — Build API and deploy
3. **Continuous** (Cycle 5+) — Monitor and improve

---

## 📈 CURRENT STATUS

✅ **Prompts Created**
- SYSTEM_PROMPT_DICTIONARY_V2.md (592 lines)
- AGENT_PROMPTS.md (507 lines)
- IMPLEMENTATION_GUIDE.md (525 lines)
- PROMPT_QUICK_REFERENCE.md (400+ lines)
- PROMPTS_INDEX.md (400+ lines)

✅ **Pipeline Complete**
- Rebuild V2 Comprehensive (Cycle 1)
- Rebuild V2 Embeddings & Search Layer

📊 **Dictionary State**
- EN→ZO Entries: 24,894
- ZO→EN Entries: 21,259
- Bidirectional: 85.3%
- Database Sync: 99.99%

🚀 **Ready for Phase 2** (API Integration & Deployment)

---

## 🎓 LEARNING RESOURCES

### For Understanding
1. PROMPTS_INDEX.md (navigation)
2. PROMPT_QUICK_REFERENCE.md (overview)
3. SYSTEM_PROMPT_DICTIONARY_V2.md (details)

### For Implementing
1. AGENT_PROMPTS.md (agent specs)
2. IMPLEMENTATION_GUIDE.md (code examples)
3. Start coding!

### For Deploying
1. IMPLEMENTATION_GUIDE.md (deployment steps)
2. Run commands
3. Monitor with heartbeat log

### For Troubleshooting
1. IMPLEMENTATION_GUIDE.md (troubleshooting section)
2. Check common issues
3. Follow solutions

---

## ❓ FAQ

**Q: Where do I start?**
A: Read this file, then choose your path above.

**Q: How long does it take to understand?**
A: 30 min for overview, 1-2 hours for full understanding.

**Q: Can I skip some documents?**
A: Yes! Choose your learning path above.

**Q: What if I get stuck?**
A: Check IMPLEMENTATION_GUIDE.md → TROUBLESHOOTING

**Q: How do I monitor progress?**
A: Use `tail -f /data/processed/rebuild_v2/heartbeat.log`

**Q: What's the next step?**
A: Choose your learning path and start reading!

---

## 🎯 NEXT STEPS

1. **Choose your path** (beginner, implementer, deployer, maintainer)
2. **Read the recommended documents** (5-120 min)
3. **Start your task** (implement, deploy, monitor, etc.)
4. **Use the guides** (code examples, deployment steps, troubleshooting)
5. **Monitor progress** (heartbeat log, audit results)

---

## 📞 SUPPORT

**I'm confused**
→ Read PROMPTS_INDEX.md → NAVIGATION GUIDE

**I don't know where to start**
→ Read PROMPTS_INDEX.md → LEARNING PATH

**I need code examples**
→ Read IMPLEMENTATION_GUIDE.md → IMPLEMENTATION STEPS

**I need to deploy**
→ Read IMPLEMENTATION_GUIDE.md → DEPLOYMENT

**I have an error**
→ Read IMPLEMENTATION_GUIDE.md → TROUBLESHOOTING

**I need to monitor**
→ Read IMPLEMENTATION_GUIDE.md → MONITORING

---

## 🚀 READY?

Choose your starting point:

1. **New to the system?** → [PROMPTS_INDEX.md](PROMPTS_INDEX.md)
2. **Need quick overview?** → [PROMPT_QUICK_REFERENCE.md](PROMPT_QUICK_REFERENCE.md)
3. **Need full details?** → [SYSTEM_PROMPT_DICTIONARY_V2.md](SYSTEM_PROMPT_DICTIONARY_V2.md)
4. **Ready to implement?** → [AGENT_PROMPTS.md](agents/AGENT_PROMPTS.md)
5. **Ready to deploy?** → [IMPLEMENTATION_GUIDE.md](IMPLEMENTATION_GUIDE.md)

---

**Last Updated:** 2026-04-16T03:10:19Z  
**Status:** ✅ All prompts ready for use  
**Next Step:** Choose your starting point and begin!
