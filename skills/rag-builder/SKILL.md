# Skill: Zolai RAG Builder

## Trigger
- "build rag"
- "create embeddings"
- "search knowledge"

## Description
Builds retrieval-augmented generation system for Zolai.

## Prerequisites
```bash
pip install sentence-transformers faiss-cpu chromadb
# Or for GPU
pip install sentence-transformers faiss-gpu
```

## Workflow

### Step 1: Create Embeddings
```python
from sentence_transformers import SentenceTransformer
import json

model = SentenceTransformer("sentence-transformers/all-MiniLM-L6-v2")

# Load documents
documents = []
with open("wiki/**/*.md") as f:
    documents.append(f.read())

# Create embeddings
embeddings = model.encode(documents)
```

### Step 2: Build Vector Store
```python
import faiss
import numpy as np

# FAISS index
dim = embeddings.shape[1]
index = faiss.IndexFlatL(dim)
index.add(embeddings)

# Or use ChromaDB
import chromadb
client = chromadb.Client()
collection = client.create_collection("zolai-wiki")
collection.add(
    documents=documents,
    embeddings=embeddings.tolist(),
    ids=[str(i) for i in range(len(documents))]
)
```

### Step 3: Query
```python
query = "How do I say 'I eat rice' in Zolai?"
query_emb = model.encode([query])

# Search
D, I = index.search(query_emb, k=3)
results = [documents[i] for i in I[0]]
```

## RAG with LLM
```python
from transformers import AutoModelForCausalLM

# Retrieve context
context = "\n".join(results[:3])

# Generate with context
prompt = f"""Answer based on Zolai knowledge:

Context: {context}

Question: {query}
Answer:"""

model = AutoModelForCausalLM.from_pretrained("peterpausianlian/zolai-qwen")
output = model.generate(prompt)
```

## Tools
| Tool | Purpose | Install |
|------|---------|---------|
| sentence-transformers | Embeddings | `pip install sentence-transformers` |
| faiss-cpu | Fast search | `pip install faiss-cpu` |
| chromadb | Vector DB | `pip install chromadb` |
| langchain | RAG framework | `pip install langchain` |

## Embedding Models
| Model | Dim | Speed | Quality |
|-------|-----|-------|--------|
| all-MiniLM-L6-v2 | 384 | Fast | Good |
| all-mpnet-base-v2 | 768 | Medium | Better |
| bge-base-en-v1.5 | 768 | Medium | Best |

## Use Cases
- **Chatbot** - RAG + LLM for answers
- **Search** - Semantic search in wiki
- **Suggestions** - Grammar help

## Related Skills
- wiki-updater - Update knowledge
- model-deployer - Deploy RAG API
- huggingface-uploader - Share embeddings