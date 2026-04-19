# Contributing to Zolai Second Brain

Thank you for your interest in preserving the Zolai language through AI!

## Who We Need

- **Native Tedim speakers** — data validation, translation review
- **Linguists** — Tibeto-Burman / Kuki-Chin language expertise
- **ML engineers** — low-resource NLP, fine-tuning, evaluation
- **Developers** — Python, Next.js, FastAPI

## AI Agent CLI Tools (Recommended)

This project is designed to work with AI agent CLIs. Load the project context and get instant help with data pipelines, ZVS compliance, training, and more.

| Tool | Context File | Best For |
|------|-------------|---------|
| **[Kiro CLI](https://kiro.dev)** | `.kiro/` (auto-loaded) | Full project agent, code generation, multi-agent tasks (`kiro-cli chat`) |
| **[Gemini CLI](https://github.com/google-gemini/gemini-cli)** | `GEMINI.md` | Dictionary verification, ZVS compliance, data tasks |
| **[OpenCode](https://opencode.ai)** | auto-detects | Code editing, refactoring |

```bash
# Kiro CLI (this project)
kiro-cli chat

# Gemini CLI with project context
gemini -f GEMINI.md "Verify this Zolai sentence: Pasian in leitung a bawl hi."

# Gemini — verify dictionary batch
gemini -f GEMINI.md "$(python3 -c 'import json,random; lines=[json.loads(l) for l in open("data/dictionary/wordlists/zo_en_singlewords_v1.jsonl") if l.strip()]; print(json.dumps(random.sample(lines,10),ensure_ascii=False))')" "Verify all entries. Mark ✓ correct or ✗ wrong."
```

```bash
git clone https://github.com/peterlianpi/zolai-ai.git
cd zolai-ai
python -m venv .venv
source .venv/bin/activate
pip install -e ".[dev]"
cp .env.example .env   # fill in your API keys
```

## Ways to Contribute

### Data
- Correct translation errors in `data/parallel/`
- Add missing vocabulary to `data/dictionary/`
- Validate synthetic training examples in `data/corpus/synthetic/`

### Code
- Fix bugs or add features in `zolai/` (core package)
- Improve crawlers in `scripts/crawlers/`
- Add tests in `tests/`

### Language & Wiki
- Improve grammar rules in `wiki/`
- Document ZVS dialect standards
- Add cultural context and idioms

## Standards

- Dialect: **Tedim ZVS** — use `pasian`, `gam`, `tapa`, `topa`
- Never use: `pathian`, `ram`, `fapa`, `bawipa`
- Word order: **SOV**
- See `wiki/` for full grammar reference

## Pull Request Process

1. Fork the repo and create a branch: `git checkout -b feat/your-feature`
2. Make changes and add tests if applicable
3. Run `pytest tests/` to verify
4. Open a PR with a clear description

## Code of Conduct

Be respectful. This project serves a minority language community — cultural sensitivity is required.
