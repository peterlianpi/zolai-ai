# Skill: Model Deployer

## Trigger
- "deploy model"
- "serve model"
- "api endpoint"

## Description
Deploys trained Zolai model as API or web service.

## Options

### Option 1: FastAPI (Recommended)
```python
# app.py
from fastapi import FastAPI
from transformers import AutoModelForCausalLM, AutoTokenizer

app = FastAPI()
model = AutoModelForCausalLM.from_pretrained("peterpausianlian/zolai-qwen")
tokenizer = AutoTokenizer.from_pretrained("peterpausianlian/zolai-qwen")

@app.post("/generate")
def generate(prompt: str, max_length: int = 128):
    inputs = tokenizer(prompt, return_tensors="pt")
    outputs = model.generate(**inputs, max_length=max_length)
    return {"text": tokenizer.decode(outputs[0])}
```

```bash
# Run
uvicorn app:app --host 0.0.0.0 --port 8000
```

### Option 2: Gradio
```python
import gradio as gr
from transformers import pipeline

zolai = pipeline("text-generation", model="peterpausianlian/zolai-qwen")

gr.Interface(fn=zolai, inputs="text", outputs="text").launch()
```

### Option 3: Ollama (Local)
```bash
# Save in Ollama format
ollama create zolai -f Modelfile

# Run
ollama run zolai
```

### Option 4: Streamlit Space
```python
import streamlit as st
from transformers import pipeline

st.title("Zolai Chat")
model = pipeline("text-generation", model="peterpausianlian/zolai-qwen")

if prompt := st.text_input("Ask Zolai:"):
    st.write(model(prompt))
```

```bash
# Deploy to HF Spaces
huggingface-cli space create zolai-chat --sdk streamlit
```

## Deployment Targets
| Target | URL | Instructions |
|--------|-----|-------------|
| HF Spaces | huggingface.co/spaces | `huggingface-cli space create` |
| Render | render.com | Connect GitHub repo |
| Railway | railway.app | Connect GitHub repo |
| VPS | your-server.com | `docker run` or `gunicorn` |
| Local | localhost:8000 | `uvicorn app:app` |

## API Endpoints
```
POST /generate     # Text generation
POST /translate   # Translation
POST /chat       # Conversation
GET  /health    # Health check
```

## Related Skills
- huggingface-uploader - Upload to HF
- kaggle-automation - Train model
- rag-builder - Add RAG