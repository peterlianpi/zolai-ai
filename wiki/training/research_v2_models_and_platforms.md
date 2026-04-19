# Deep Research v2 — Part 2: Models, Training & Platforms
> Last updated: 2026-04-18 | Based on arxiv papers 2024–2025 + community benchmarks

---

## 1. Model Selection — Professor-Level Analysis

### 1.1 The Research Consensus (2024–2025)

From surveying 10+ papers on low-resource language fine-tuning:

**Finding 1:** Start from a **multilingual base model**, not English-only. Models pretrained on diverse languages transfer better to unseen languages.

**Finding 2:** **Continued Pretraining (CPT) before SFT** gives +8–15 BLEU points for low-resource languages (arXiv:2410.14815). Don't skip CPT.

**Finding 3:** **3B–7B parameter models** with QLoRA outperform larger models when data is limited. Bigger is not better for low-resource.

**Finding 4:** **Data diversity > data quantity** for SFT (arXiv:2408.12780). 10K diverse instruction pairs beats 100K repetitive ones.

**Finding 5:** **BLEU scores mislead** for low-resource languages. Use chrF + human evaluation (arXiv:2411.18571).

### 1.2 Model Comparison Table (Research-Backed)

| Model | Params | Multilingual | License | VRAM (4-bit) | Recommended For |
|---|---|---|---|---|---|
| **Qwen2.5-7B-Instruct** | 7B | ✅ Strong (29 langs) | Apache 2.0 | ~6GB | Primary choice |
| **Qwen2.5-3B-Instruct** | 3B | ✅ Good | Apache 2.0 | ~3GB | Fast iteration |
| **Gemma-2-2b-it** | 2B | ✅ Good | Gemma Terms | ~2GB | Smallest/fastest |
| **Gemma-2-9b-it** | 9B | ✅ Strong | Gemma Terms | ~8GB | Best quality |
| **Llama-3.2-3B-Instruct** | 3B | ✅ Good | Llama 3 | ~3GB | Community support |
| **Llama-3.1-8B-Instruct** | 8B | ✅ Strong | Llama 3 | ~7GB | UrduLLaMA used this |
| **SeaLLMs-v3-7B-Chat** | 7B | ✅ SEA-focused | Apache 2.0 | ~6GB | Best for SEA context |
| **Phi-4-mini** | 3.8B | ✅ Good | MIT | ~4GB | Strong reasoning |
| **Mistral-7B-v0.3** | 7B | ⚠️ Limited | Apache 2.0 | ~6GB | Older, less multilingual |

### 1.3 Why Qwen2.5 is the Top Pick

From arXiv:2407.10671 (Qwen2 Technical Report):
- Trained on 7 trillion tokens including multilingual data
- Supports 29 languages natively
- Outperforms most open-weight models on multilingual benchmarks
- Apache 2.0 license — fully commercial use allowed
- Strong instruction-following from RLHF training

For Zolai specifically: Qwen2.5 has seen Burmese and other Myanmar-region languages in pretraining, giving it a better starting point for Tedim than English-only models.

### 1.4 The UrduLLaMA Blueprint (Most Directly Applicable)

arXiv:2502.16961 describes building a low-resource LLM for Urdu — the closest published work to what we're doing:

**Their exact recipe:**
1. Base: `meta-llama/Llama-3.1-8B-Instruct`
2. CPT: 128M Urdu tokens (monolingual web text)
3. SFT: 41K Urdu instructions + 50K EN-Urdu translation pairs
4. Method: LoRA (not QLoRA — they had A100s)
5. Result: Strong improvement on Urdu benchmarks

**Zolai adaptation:**
1. Base: `Qwen/Qwen2.5-7B-Instruct` (better multilingual than Llama)
2. CPT: ~100M Zolai tokens (our corpus_master)
3. SFT: 11K instructions (expand to 50K) + 105K translation pairs
4. Method: QLoRA (we use Kaggle T4, not A100)

### 1.5 Training Stages — What Research Says

**Stage 1: Continued Pretraining (CPT)**
- Purpose: Teach the model Zolai token distributions
- Data: Raw monolingual Zolai text (no instruction format)
- Format: Plain text completion
- Key finding (arXiv:2410.14815): CPT on synthetic translationese data also works — translate English web text to Zolai using NLLB, then use as CPT data
- Expected gain: Model starts generating fluent Zolai

**Stage 2: Supervised Fine-Tuning (SFT)**
- Purpose: Teach instruction-following in Zolai
- Data: Instruction pairs + translation pairs
- Format: ChatML or Alpaca
- Key finding (arXiv:2408.12780): Include both Zolai-only and ZO↔EN translation tasks
- Key finding (arXiv:2511.00130): SFT excels at skill acquisition but risks catastrophic forgetting — use LoRA to preserve base model knowledge

**Stage 3: DPO Alignment**
- Purpose: Enforce ZVS dialect, fix hallucinations
- Data: Preference pairs (ZVS-correct chosen, ZVS-wrong rejected)
- Format: `{prompt, chosen, rejected}`
- Key finding: DPO needs SFT first — don't skip Stage 2
- Alternative: **ORPO** (Odds Ratio Preference Optimization) — combines SFT + alignment in one pass, saves compute

---

## 2. Training Frameworks — Deep Comparison

### 2.1 Framework Comparison (2025)

| Framework | Speed | Memory | Ease | Multi-GPU | Best For |
|---|---|---|---|---|---|
| **Unsloth** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ❌ Single GPU | Kaggle/Colab free tier |
| **LLaMA-Factory** | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ✅ Yes | Web UI, easy config |
| **Axolotl** | ⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ | ✅ Yes | Production, YAML config |
| **TRL (HuggingFace)** | ⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ | ✅ Yes | DPO/ORPO/GRPO |
| **torchtune** | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐ | ✅ Yes | PyTorch-native |

**Recommendation for Zolai:**
- **Kaggle/Colab:** Unsloth (fastest on single T4)
- **Multi-GPU server:** LLaMA-Factory (easiest config, web UI)
- **DPO/alignment:** TRL DPOTrainer or ORPO

### 2.2 Unsloth — Key Facts

- 2x faster than HuggingFace PEFT
- 70% less VRAM (Llama 3.1 70B runs on 2x T4 with Unsloth)
- Supports: Llama 3.x, Qwen 2.5, Gemma 2/3, Mistral, Phi-4, SeaLLMs
- Free tier: `unsloth/Qwen2.5-7B-Instruct` pre-quantized on HF Hub
- Context length: up to 13x longer than standard on same hardware

### 2.3 LLaMA-Factory — Key Facts

- Web UI (Gradio) for no-code fine-tuning
- Supports 100+ models
- Built-in dataset management
- Supports: SFT, DPO, ORPO, KTO, PPO, GRPO
- Install: `pip install llamafactory`
- GitHub: github.com/hiyouga/LLaMA-Factory

### 2.4 Key Hyperparameters (Research-Validated)

From arXiv:2412.13337 ("A Guide For Supervised Fine-Tuning Small LLMs"):

```python
# For 3B–7B models, these ranges work well:
lora_r = 16          # 8–64; higher = more capacity but more VRAM
lora_alpha = 32      # Usually 2x lora_r
learning_rate = 2e-4 # 1e-4 to 5e-4 for LoRA
batch_size = 2       # Per device; use gradient_accumulation to scale
grad_accum = 8       # Effective batch = 16
epochs = 3           # 1–5; more epochs risks overfitting on small data
warmup_ratio = 0.03  # 3% of steps for warmup
scheduler = "cosine" # Cosine decay works best
max_seq_len = 2048   # 1024–4096 depending on VRAM
```

**For Zolai specifically:**
- Use `max_seq_len = 1024` on Kaggle T4 to fit larger batch
- Set `lora_r = 16` (not 8) — Zolai needs more capacity than English tasks
- Train for 3 epochs minimum — low-resource needs more passes

---

## 3. Platforms — Complete Guide

### 3.1 Free Platforms (Priority Order)

**1. Kaggle (Primary)**
- 30h/week free GPU (2x T4 = 32GB total VRAM)
- 12h per session (unattended)
- 20GB disk (compress datasets with gzip)
- Persistent datasets (upload once, reuse)
- No credit card needed
- Best for: CPT and SFT training runs

**2. Google Colab Free**
- T4 GPU, ~4h before disconnect
- 12GB VRAM
- Best for: Quick experiments, debugging

**3. Google Colab Pro ($10/month)**
- A100 40GB or V100 16GB
- 24h sessions
- Best for: Serious training when Kaggle quota runs out

**4. Lightning AI (Free Tier)**
- T4 GPU, limited hours
- Good Jupyter-like interface
- Best for: Alternative to Colab

**5. Modal (Free Credits)**
- A10G GPU (24GB VRAM)
- Serverless — pay per second
- Free $30 credits on signup
- Best for: One-off large training runs

### 3.2 Paid Platforms (When Free Isn't Enough)

| Platform | GPU | Price | Best For |
|---|---|---|---|
| **RunPod** | A100 80GB | ~$2.50/hr | Large model training |
| **Vast.ai** | Various | ~$0.50–2/hr | Budget GPU rental |
| **Lambda Labs** | A100/H100 | ~$1.50/hr | Reliable, good UX |
| **Paperspace** | A100 | ~$2/hr | Persistent storage |

**For Zolai:** Kaggle free tier is sufficient for our current data size. A full CPT + SFT run on Qwen2.5-7B takes ~20 hours on T4 — fits within weekly quota.

### 3.3 Experiment Tracking

**W&B (Weights & Biases) — Recommended**
- Free for individuals (unlimited runs)
- Integrates with Unsloth/TRL with 2 lines of code
- Tracks: loss curves, GPU usage, hyperparameters, model artifacts
- Setup: `pip install wandb && wandb login`

```python
# Add to training args:
report_to="wandb",
run_name="zolai-qwen25-7b-sft-v1",
```

**MLflow — Alternative (Self-Hosted)**
- Fully open source, no account needed
- Run locally: `mlflow ui`
- Better for: Privacy, no internet dependency

### 3.4 Model Storage & Deployment

**HuggingFace Hub (Free)**
- Upload LoRA adapters (~100MB) and merged models
- Private repos available on free tier
- Target: `huggingface.co/zolai-project/`

**GGUF Export (Local Deployment)**
- Convert merged model to GGUF for Ollama/llama.cpp
- Unsloth can export directly: `model.save_pretrained_gguf("model", tokenizer, quantization_method="q4_k_m")`
- GGUF replaced GGML in 2023 — use GGUF only
- Q4_K_M quantization: best quality/size ratio for deployment

**Ollama (Local Inference)**
- Run GGUF models locally: `ollama run zolai-model`
- Create custom Modelfile with Zolai system prompt
- Free, open source, runs on CPU+GPU

---

## 4. Alignment Methods — Beyond Basic SFT

### 4.1 DPO (Direct Preference Optimization)

Most practical alignment method for Zolai:
- No reward model needed
- Works with small datasets (1K–5K pairs)
- Tool: `trl.DPOTrainer`

**Building DPO pairs for Zolai:**
```
Prompt: "Zolai in 'God' ci hi eng nge?"
Chosen: "Pasian ci hi." (ZVS correct)
Rejected: "Pathian ci hi." (wrong dialect)
```

Sources for rejected examples:
- Our own model's wrong outputs
- Old dialect text (pre-ZVS)
- Hallucinated Bible verses

### 4.2 ORPO (Odds Ratio Preference Optimization)

Newer than DPO, combines SFT + alignment in one pass:
- Saves compute (one training stage instead of two)
- Works well with small datasets
- Tool: `trl.ORPOTrainer`
- Paper: arXiv:2403.07691

**Recommendation:** Use ORPO instead of separate SFT + DPO if compute is limited.

### 4.3 GRPO (Group Relative Policy Optimization)

Used by DeepSeek-R1 for reasoning. For Zolai:
- Overkill for current stage
- Useful later for: grammar correction, translation quality scoring
- Requires reward function (e.g., ZVS compliance checker)

---

## 5. The Complete Zolai Training Roadmap

### Phase 1 (Now — Month 1): Foundation
```
1. Clean corpus_master_v1.jsonl with full pipeline
2. Build Zolai fastText langid model
3. Create 1K held-out evaluation set (human-verified)
4. Train Qwen2.5-7B CPT on Kaggle (corpus_master_clean)
5. Evaluate: perplexity on held-out set
```

### Phase 2 (Month 2): Instruction Tuning
```
1. Expand synthetic instructions to 50K (use GPT-4o with ZVS prompt)
2. Format all data in ChatML
3. Train SFT on Kaggle (instructions + translation pairs)
4. Evaluate: ZVS compliance + human eval on 100 sentences
5. Export to GGUF, test with Ollama locally
```

### Phase 3 (Month 3): Alignment
```
1. Build 2K DPO pairs (ZVS-correct vs ZVS-wrong)
2. Train ORPO (combined SFT+alignment)
3. Evaluate: ZVS compliance > 95%, forbidden_word_rate = 0%
4. Upload to HuggingFace Hub
5. Submit Zolai corpus to SEACrowd
```

### Phase 4 (Month 4+): Scale & Community
```
1. Build Zolai-FLORES evaluation set (1012 sentences)
2. Submit to FLORES+ official dataset
3. Write technical report / paper
4. Expand to speech (Whisper fine-tuning for Zolai ASR)
```

---

*Sources: arXiv:2502.16961, arXiv:2408.12780, arXiv:2410.14815, arXiv:2412.13337, arXiv:2511.00130, arXiv:2403.07691, spheron.network/blog/axolotl-vs-unsloth-vs-torchtune*
