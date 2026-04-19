# Skill: GitHub Models API

## Trigger
- "use github models"
- "free api"
- "azure openai"

## Description
Uses GitHub Models (Azure AI) for free API access.

## Prerequisites
```bash
pip install openai

# Get token from:
# github.com/settings/tokens (classic, tokens:read, tokens:write)
# Or Azure AI: https://ai.azure.com
```

## Setup
```bash
export GITHUB_TOKEN=ghp_...
export OPENAI_BASE_URL=https://models.inference.ai.azure.com
```

## Available Models
| Model | Use Case |
|--------|---------|
| gpt-4o | Best quality |
| gpt-4o-mini | Fast, cheap |
| o3-mini | Reasoning |
| claude-sonnet-4 | Alternative |
| gemini-2.0-flash | Fast |
| meta-llama-3.3-70b | Open model |

## Usage
```python
from openai import OpenAI

client = OpenAI(
    base_url="https://models.inference.ai.azure.com",
    api_key=os.environ["GITHUB_TOKEN"]
)

response = client.chat.completions.create(
    model="gpt-4o",
    messages=[{"role": "user", "content": "Hello in Zolai?"}]
)
print(response.choices[0].message.content)
```

## Translate with GitHub Models
```python
response = client.chat.completions.create(
    model="gpt-4o",
    messages=[{
        "role": "system",
        "content": "You are a Zolai language expert."
    }, {
        "role": "user",
        "content": "Translate to Zolai: 'I eat rice'"
    }]
)
```

## Compare Quality
```python
# Use best model for translations
best_model = "gpt-4o"  # Paid quality, free access
fast_model = "gpt-4o-mini"  # Fast for bulk

# For reasoning tasks
reason_model = "o3-mini"
```

## Rate Limits
| Model | RPM | TPM |
|-------|-----|-----|
| gpt-4o | 500 | 30K |
| gpt-4o-mini | 1500 | 90K |

## Related Skills
- data-cleaner - Clean with AI
- data-labeler - Label with AI
- prompts/master - Full workflow