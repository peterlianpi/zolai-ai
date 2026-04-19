# Zolai Tools Setup

## Core Tools Required

### Python Environment
```bash
# Requirements
python >= 3.10
pip >= 21.0

# Install dependencies
pip install -e .
pip install -r requirements.txt
```

### Data Processing Tools
| Tool | Purpose | Install |
|------|---------|---------|
| pandas | DataFrames | `pip install pandas` |
| jq | JSONL processing | `brew install jq` |
| ruff | Linting | `pip install ruff` |
| mypy | Type checking | `pip install mypy` |

### ML/Training Tools
| Tool | Purpose | Install |
|------|---------|---------|
| transformers | Model training | `pip install transformers` |
| peft | LoRA fine-tuning | `pip install peft` |
| datasets | HF datasets | `pip install datasets` |
| accelerate | DDP training | `pip install accelerate` |

### Optional Tools
| Tool | Purpose | Install |
|------|---------|---------|
| kaggle | Kaggle API | `pip install kaggle` |
| ollama | Local LLMs | See ollama.ai |
| sentence-transformers | Embeddings | `pip install sentence-transformers` |

## Environment Variables
Create `.env` file:
```bash
# Zolai paths
ZOLAI_ROOT=/path/to/zolai
ZOLAI_DATA_ROOT=/path/to/data

# API keys (optional)
OPENAI_API_KEY=sk-...
HF_TOKEN=hf_...
KAGGLE_USERNAME=user
KAGGLE_KEY=key
```

## Quick Setup
```bash
# Clone and setup
git clone https://github.com/peterpausianlian/zolai.git
cd zolai

# Python virtual environment
python -m venv .venv
source .venv/bin/activate

# Install
pip install -e ".[dev]"

# Test
python pipelines/run.py --help

# Run pipeline
python pipelines/run.py
```

## Verify Installation
```bash
# Test Python
python --version  # Should be >= 3.10

# Test imports
python -c "import zolai; print(zolai.__version__)"

# Test pipelines
python pipelines/collect.py --help
python pipelines/clean.py --help
python pipelines/run.py --help
```

## Common Commands
```bash
# Full pipeline
python pipelines/run.py

# Individual stages
python pipelines/clean.py -i raw/ -o clean/
python pipelines/deduplicate.py -i clean/ -o clean/
python pipelines/export.py -f huggingface

# Run CLI
python -m zolai --help

# Lint code
ruff check zolai/ scripts/
```