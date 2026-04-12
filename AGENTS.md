# AGENTS.md — Zolai AI Second Brain Project

## Build / Install / Run Commands

```bash
pip install -e .                     # Editable install (zolai CLI entrypoint)
pip install -r requirements.txt      # Core ML deps (datasets, transformers, peft, torch, jupyter)
pip install -e ".[dev]"              # Install with dev dependencies (ruff, mypy, pytest)
```

**Linting & Type Checking:**
```bash
ruff check src/ scripts/                # Lint Python files
ruff check --fix src/ scripts/          # Auto-fix issues
mypy src/ scripts/                      # Type check (uses pyproject.toml config)
```

**Testing:**
```bash
pytest tests/                           # Run test suite
python -m pytest tests/ -v              # Verbose output
pytest tests/test_specific_file.py::test_function_name  # Run a single specific test
python scripts/test_grammar_rules.py    # Grammar rule validation script
```

**Run Single Script:**
```bash
python scripts/<script_name>.py --arg1 value --arg2 value
python -c "import json; [json.loads(l) for l in open('output.jsonl')]"  # Validate JSONL output
```

**CLI commands:**
```bash
zolai standardize-jsonl -i INPUT -o OUTPUT [--dedupe] [--min-chars N] [--keep-empty]
zolai audit-jsonl -i INPUT [--text-field FIELD]
python zolai_menu.py                 # Interactive menu for all scripts/commands
```

**Standalone scripts:**
```bash
python scripts/fetch_tongdot_dictionary.py --input FILE --output FILE [--resume] [--sleep SECS]
python scripts/build_tongdot_search_words.py --input FILE --output FILE
python scripts/export_full_sources.py [--repo-root PATH] [--lines-per-part N]
python scripts/export_all_zolai_sources.py [--overwrite]
python scripts/export_all_linguistics_sources.py [--ocr] [--overwrite]
```

**Notebooks:** Located in `notebooks/` — designed for Kaggle execution.

## Testing Validation

**No formal extensive pytest test suite exists yet.** Validate changes by:
1. Running the affected script/notebook end-to-end with a small sample
2. Checking output JSONL validity: `python -c "import json; [json.loads(l) for l in open('output.jsonl')]"`
3. Verifying UTF-8 integrity and no truncated fragments (lowercase-end check)
4. Running grammar validation: `python scripts/test_grammar_rules.py`

**Validation Scripts:**
```bash
python scripts/test_grammar_rules.py                    # Test grammar patterns
python scripts/verify_words.py data/processed/          # Verify word list integrity
python scripts/audit-jsonl -i data/output.jsonl       # Audit JSONL file
```

## Code Style Guidelines

### General
- **Line length:** ~120 chars max (enforced by ruff in pyproject.toml)
- **Encoding:** Strictly valid UTF-8; no truncated fragments
- **Formatting:** Use ruff for linting; follow existing file conventions
- **Python:** 3.10+ required (`from __future__ import annotations` in all files)

### Imports
- Every file starts with `from __future__ import annotations`
- Order: stdlib → third-party → local (with blank line between groups)
- Prefer `import X` over `from X import *`

### Types
- Use type hints on all function signatures and class attributes
- Prefer `list[str]` over `List[str]` (PEP 585 style, enabled by `__future__` import)
- Use `dataclass` for structured data (stats, config, paths)

### Naming
- `snake_case` for functions, variables, modules
- `PascalCase` for classes
- `UPPER_SNAKE_CASE` for constants
- Prefix private helpers with underscore: `_heartbeat()`, `_finalize_result()`

### Formatting
- Double quotes (`"`) preferred for strings; single quotes acceptable in f-strings
- 4-space indentation (no tabs)
- Trailing commas in multi-line dicts/lists

### Error Handling
- Broad `except Exception:` acceptable in data pipelines for robustness
- Always log or print error context; never silently swallow
- Use `raise SystemExit(main())` for script entry points
- Use `argparse` with sensible defaults for all CLI scripts
- Log to stderr with context: `print(f"Error processing {file}: {e}", file=sys.stderr)`
- Fail fast on unrecoverable errors (missing files, invalid config)

### Path Handling
- Prefer `pathlib.Path` over `os.path` for new code
- Use `Path(...).parent.mkdir(parents=True, exist_ok=True)` before writing
- Check `path.exists()` before reading

### JSONL Processing
- Stream line-by-line for large files (never load entire file into memory)
- Use `json.dumps(..., ensure_ascii=False, indent=2)` for human-readable output
- Use `hashlib.md5(text.encode("utf-8")).hexdigest()` for deduplication

### Progress Visibility
- Use heartbeat pattern with flush for long-running operations:
  ```python
  sys.stdout.write(msg); sys.stdout.flush()
  ```
- Write progress to a log file alongside stdout for resumability

### Dataclass Usage
- Use `@dataclass` for stats, config, and path objects
- Use `@dataclass(frozen=True)` for immutable config/path objects
- Include `to_dict()` method when serialization is needed

### CLI Pattern
- Use `argparse` with subparsers for multiple commands
- Entry point: `def main(argv: list[str] | None = None) -> int`
- Exit via: `raise SystemExit(main())`
- Return `0` on success, non-zero on failure

### File I/O
- Always specify `encoding="utf-8"` explicitly
- Use generators (`yield`) for streaming large files
- Never load entire JSONL/CSV files into memory

### Script Patterns (Karpathy-Style)
Each script should have a clear structure:
1. Imports
2. Configuration/Constants
3. Helper functions
4. Main execution function
5. Entry point with `if __name__ == "__main__": raise SystemExit(main())`

## Content Selection Rules
When generating or structuring data, responses, or examples for the Zolai language, adhere to the following domain-specific guidelines to match user intent and level:

- **General Principles:**
  - Prefer simple, everyday language for beginners.
  - Introduce domain-specific language only when appropriate.
  - Avoid mixing too many domains in one response.
  - Balance exposure across domains over time.
- **Religious Text:** Use for structured, formal language.
- **Conversation:** Use for daily communication practice.
- **Education:** Use for grammar and structured learning.
- **Culture:** Use for contextual understanding and expressions.

## Language Tutor Profile
When acting as a Zolai language tutor:
- **System Priority:** Teach effectively, guide thinking, reinforce learning, and adapt dynamically. *Never* act as a simple translator only. *Always* act as a structured tutor.
- **Core Rules:** Adapt to learner level; keep difficulty slightly above current ability; prioritize clarity and gradual learning over complex grammar.
- **Difficulty Control:** Adjust based on level:
  - Beginner: short sentences, basic vocabulary.
  - Intermediate: moderate sentence complexity.
  - Advanced: full structure and nuance.
  - *Always* stay slightly above user ability, increase gradually, and reduce if user struggles repeatedly.
- **Task Routing:** Classify input as `translation`, `grammar`, `reading`, `practice`, or `conversation`. Detect domain (`religious`, `daily conversation`, `education`, `culture`, `general`). Default to `general` conversational learning if unclear.
- **Teaching Strategy:** Do NOT give full answers immediately. Start with hints/guiding steps. Encourage participation before revealing answers.
- **Correction Method:** Recast naturally instead of explicitly saying "wrong". Model correct usage.
- **Feedback:** Provide specific, actionable feedback; focus on 1-2 key improvements.
- **Language Rules:** Follow SOV structure; use English only for explanations; keep explanations short.
- **Data Usage & Bias Control:** Do not overuse religious content, even if abundant in the dataset. Balance daily conversation, practical language, and structured learning to ensure real-world usable language skills.
- **Memory Behavior:** Track vocabulary and grammar errors across all domains. Reintroduce weak items later in different contexts (e.g., religious → conversation, conversation → reading, reading → practice) to ensure the learner understands usage in multiple real-world contexts.
- **Response Flow (Silent Planning):** Before responding, internally plan: 1) detect intent, 2) detect domain, 3) detect level, 4) choose teaching method, 5) decide hint vs. answer. Do NOT reveal this plan to the learner; generate and output only the final response.
- **Self-Improvement:** After each interaction, if any new knowledge (vocabulary, rule, correction, or resource reference) was identified, add it to the appropriate wiki file following the wiki schema (Concept/Decision/Reason/Pattern).
- **Chat System Guardrails:** Responses MUST be short (≤4 lines). Use the "Socratic Method" (questioning instead of answering) to engage the student's `Lung` (mind). Refer to `wiki/architecture/chat_system.md` for operational flow.
