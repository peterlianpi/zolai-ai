# Skill: HuggingFace Model Card Updater
# Triggers: "update model card", "fix huggingface readme", "update hf model"
# Version: 1.0.0

## Purpose
Update a HuggingFace model card README.md with correct YAML frontmatter, usage code, and source references.

## Prerequisites
- `HF_TOKEN` in `config/env/.env`
- `huggingface_hub` installed: `pip install huggingface_hub`
- `PYTHONPATH=/home/peter/.local/lib/python3.12/site-packages`

## Steps

1. Write or edit `README.md` locally with correct YAML frontmatter
2. Upload to HuggingFace Hub

## Commands
```bash
# Upload README.md to model repo
PYTHONPATH=/home/peter/.local/lib/python3.12/site-packages \
python3 -c "
from huggingface_hub import HfApi
HfApi().upload_file(
    path_or_fileobj='README.md',
    path_in_repo='README.md',
    repo_id='peterpausianlian/zolai-qwen2.5-3b-lora',
    repo_type='model',
    token='$HF_TOKEN',
    commit_message='Update model card'
)
"
```

## YAML Frontmatter Template
```yaml
---
language:
  - ctd        # ISO 639-3 for Tedim Chin — NOT 'zolai'
  - en
license: apache-2.0
base_model: Qwen/Qwen2.5-3B-Instruct   # 3B not 7B
tags:
  - zolai
  - tedim
  - lora
  - qwen2.5
datasets:
  - peterpausianlian/zolai-tedim-v3
pipeline_tag: text-generation
---
```

## Notes
- Language code for Tedim Chin is `ctd` (ISO 639-3); HuggingFace does not accept `zolai`
- Base model is `Qwen/Qwen2.5-3B-Instruct` (3B, not 7B)
- YAML frontmatter must be the very first block in README.md
