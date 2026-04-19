# Skill: Model Evaluator

## Trigger
- "evaluate model"
- "test model"
- "benchmark"

## Description
Evaluates trained Zolai model quality.

## Evaluation Metrics

### Language Model Metrics
```python
from transformers import AutoModelForCausalLM, AutoTokenizer

def evaluate_model(model_path, test_data):
    model = AutoModelForCausalLM.from_pretrained(model_path)
    tokenizer = AutoTokenizer.from_pretrained(model_path)
    
    results = {
        "perplexity": [],
        "accuracy": [],
        "bleu": [],
    }
    
    for example in test_data:
        inputs = tokenizer(example["input"], return_tensors="pt")
        outputs = model.generate(**inputs)
        
        # Perplexity
        loss = model(**inputs, labels=inputs["input"]).loss
        results["perplexity"].append(loss.exp().item())
    
    return {
        "avg_perplexity": np.mean(results["perplexity"]),
        "bleu": np.mean(results["bleu"]),
    }
```

### Translation Metrics
```python
# BLEU (n-gram overlap)
from nltk.translate.bleu_score import sentence_bleu
score = sentence_bleu([ref], hypothesis)

# METEOR
from nltk.translate.meteor_score import meteor
score = meteor([ref], hypothesis)

# COMET (pretrained)
from comet import load_from_checkpoint
model = load_from_checkpoint("Comet")
score = model.predict([{"src": src, "hyp": hyp, "ref": ref}])
```

### Generation Quality
```python
# ROUGE (summarization)
from rouge import Rouge
scores = Rouge().get_scores(hyp, ref)

# BERTScore (semantic)
from bert_score import score
P, R, F1 = score([hyp], [ref])
```

## Evaluation Tasks

### 1. Grammar
```python
grammar_tests = [
    {"input": "I read a book", "expected": "Keimah in laibu sim hi"},
    {"input": "You eat rice", "expected": "Nang in an nei"},
]

for test in grammar_tests:
    output = generate(test["input"])
    correct = output == test["expected"]
```

### 2. Translation
```python
translation_tests = [
    {"zolai": "Keimah in an nei", "en": "I eat rice"},
    {"zolai": "Ka sim hi", "en": "I read"},
]

for test in translation_tests:
    output = translate(test["en"])
    score = bleu(output, test["zolai"])
```

### 3. Conversation
```python
conversation_tests = [
    {"input": "Hello", "expected": "khawng.in"},
    {"input": "How are you?", "expected": "Nangtei tawk a?"},
]
```

## Benchmark Datasets
| Dataset | Purpose | Size |
|---------|--------|------|
| grammar_test.jsonl | Grammar | 100 |
| translation_test.jsonl | Translation | 200 |
| conversation_test.jsonl | Chat | 100 |

## Results Format
```json
{
  "model": "zolai-v1",
  "timestamp": "2024-01-01",
  "metrics": {
    "perplexity": 15.2,
    "bleu": 0.42,
    "rouge_l": 0.38,
    "accuracy": 0.85
  },
  "examples": [
    {"input": "...", "output": "...", "correct": true}
  ]
}
```

## Commands
```bash
# Run evaluation
python pipelines/evaluate.py --model models/zolai-v1 --test data/test/

# Compare models
python pipelines/compare.py --model1 v1 --model2 v2

# Generate report
python pipelines/report.py --output eval_report.md
```

## Related Skills
- model-trainer - Train model
- zolai-statistics - Statistical analysis
- experiment-tracker - Track results