# Zolai Agents

Specialized AI agents for the Zolai data pipeline and language processing tasks.
Each agent is defined as a JSON file with a role, goal, rules, tools, and workflows.

**Total agents: 34** | Last Updated: 2026-04-20

## Data Pipeline Agents

| Agent | Role |
|-------|------|
| `zomi-data` | Dataset management — merge, deduplicate, version |
| `zomi-cleaner-bot` | Clean and normalize raw corpus data |
| `zomi-crawler-bot` | Web crawling — ZomiDaily, Tongsan, RVAsia |
| `zomi-synthesizer` | Instruction synthesis for fine-tuning |
| `zomi-evaluator` | Quality evaluation of training data |
| `zomi-trainer-bot` | Training pipeline orchestration |

## Language & Linguistics Agents

| Agent | Role |
|-------|------|
| `linguistic-specialist` | Deep linguistic analysis of Tedim Zolai |
| `zolai-dialect-classifier` | Classify dialect variants (Tedim, Falam, Hakha) |
| `zolai-grammar-checker` | Validate ZVS grammar rules |
| `zolai-grammar-learner` | Learn and extract grammar patterns |
| `zolai-pronunciation-guide` | Phonetic transcription and pronunciation |
| `zolai-phrasebook-builder` | Build structured phrasebooks |
| `zomi-philosopher` | Linguistic reasoning and cultural context |

## Dictionary & Bible Agents

| Agent | Role |
|-------|------|
| `zomi-dictionary-builder` | Build and enrich the unified dictionary |
| `zolai-bible-dictionary-builder` | Extract vocabulary from Bible corpus |
| `zomi-bible-aligner` | Align Bible verses across versions (TB77, TBR17, KJV) |
| `zomi-bible-vocab-builder` | Build vocabulary lists from Bible |
| `zolai-cultural-content` | Cultural context and idiomatic content |

## Learning & Curriculum Agents

| Agent | Role |
|-------|------|
| `zolai-learner` | Language learning tutor (student-facing) |
| `zolai-lesson-tutor` | Lesson delivery and feedback |
| `zolai-grammar-learner` | Grammar lesson generation |
| `zolai-dpo-builder` | Build DPO preference pairs for RLHF |

## Data Publishing Agents

| Agent | Role |
|-------|------|
| `zolai-kaggle-publisher` | Kaggle dataset metadata, versioning, and publishing |
| `zolai-hf-publisher` | HuggingFace Hub model cards, adapter uploads, dataset publishing |
| `zolai-open-source-manager` | GitHub repo hygiene, CI, secrets scanning, open source readiness |

## Operations Agents

| Agent | Role |
|-------|------|
| `zomi-wiki-manager` | Maintain the wiki knowledge base |
| `zomi-ops-monitor` | Monitor pipeline health and logs |
| `zomi-server-ops` | Server deployment and maintenance |
| `zolai-security-auditor` | Security and data privacy auditing |
| `zolai-research-tracker` | Track research progress and experiments |
| `zolai-pipeline-team` | Orchestrate multi-agent pipeline runs |
| `zolai-data-quality` | Data quality checks and reporting |
| `zolai-github-manager` | GitHub repo metadata, project board, CI management |
| `zolai-docs-syncer` | Keep docs in sync with actual project state |
| `zolai-notebook-manager` | Kaggle training session management |

## Usage

Agents are invoked via the Kiro CLI or referenced directly:

```bash
cat agents/zomi-data/agent.json
```

## Agent Schema

Each `agent.json` contains:

```json
{
  "name": "agent-name",
  "role": "short role description",
  "department": "data|language|ops|training",
  "goal": "primary objective",
  "rules": ["rule 1", "rule 2"],
  "tools": ["tool1", "tool2"],
  "workflows": { "task_name": "steps..." }
}
```

## Language Standards

All agents follow **Tedim ZVS dialect** rules. See `wiki/` for full grammar reference.
