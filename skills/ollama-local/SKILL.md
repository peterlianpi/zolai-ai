# Skill: Ollama Local

## Trigger
- "run local model"
- "ollama"
- "local llm"

## Description
Runs local LLM with Ollama for Zolai tasks.

## Prerequisites
```bash
# Install Ollama
curl -fsSL https://ollama.ai/install.sh | sh

# Or use Docker
docker run -d -v ollama:/root/.ollama -p 11434:11434 ollama/ollama
```

## Available Models
```bash
# List available
ollama list

# Pull model
ollama pull qwen2:1.5b
ollama pull gemma2
ollama pull llama3.2
```

## Usage
```bash
# Chat
ollama run qwen2:1.5b "Hello in Zolai"

# Or via API
curl http://localhost:11434/api/chat -d '{
  "model": "qwen2:1.5b",
  "messages": [{"role": "user", "content": "How do I say eat in Zolai?"}]
}'
```

## Python Client
```python
from openai import OpenAI

client = OpenAI(
    base_url="http://localhost:11434/v1",
    api_key="ollama"
)

response = client.chat.completions.create(
    model="qwen2:1.5b",
    messages=[{
        "role": "system", 
        "content": "You are a Zolai language teacher."
    }, {
        "role": "user",
        "content": "What does 'Keimah in an nei' mean?"
    }]
)
print(response.choices[0].message.content)
```

## Best Models for Zolai
| Model | Size | VRAM | Use |
|-------|------|------|-----|
| qwen2:1.5b | 1GB | 2GB | Multilingual |
| gemma2 | 2GB | 4GB | Study help |
| phi3:3.8b | 2GB | 4GB | Fast |

## Local RAG with Ollama
```python
# embeddings
from sentence_transformers import SentenceTransformer
model = SentenceTransformer("nomic-ai/nomic-embed-text-v1")

# Store in Ollama
ollama embed -m nomic-ai/nomic-embed-text-v1 -i "Zolai sentence"
```

## Automation
```bash
# Start in background
ollama serve &

# Use in pipelines
python pipelines/clean.py --model qwen2:1.5b
```

## Related Skills
- model-deployer - Deploy with FastAPI
- rag-builder - Build RAG
- prompts/master - Full workflow