# Skill: Zolai Statistics

## Trigger
- "statistics"
- "statistical test"
- "significance"

## Description
Statistical analysis for Zolai dataset and model evaluation.

## Basic Statistics
```python
import numpy as np
from scipy import stats

def basic_stats(data):
    return {
        "mean": np.mean(data),
        "median": np.median(data),
        "std": np.std(data),
        "min": np.min(data),
        "max": np.max(data),
        "q25": np.percentile(data, 25),
        "q75": np.percentile(data, 75),
    }
```

## Dataset Statistics
```python
def dataset_stats(path):
    """Calculate dataset statistics."""
    lengths = []
    char_counts = {}
    
    with open(path) as f:
        for line in f:
            data = json.loads(line)
            text = data.get("text", "")
            lengths.append(len(text))
            
            # Character frequency
            for c in text.lower():
                char_counts[c] = char_counts.get(c, 0) + 1
    
    return {
        "samples": len(lengths),
        "avg_length": np.mean(lengths),
        "median_length": np.median(lengths),
        "std_length": np.std(lengths),
        "unique_chars": len(char_counts),
        "char_diversity": len(char_counts) / sum(char_counts.values()),
    }
```

## Statistical Tests

### Comparing Datasets
```python
# Two-sample t-test
t_stat, p_value = stats.ttest_ind(dataset1_lengths, dataset2_lengths)

# Mann-Whitney U test (non-parametric)
u_stat, p_value = stats.mannwhitneyu(dataset1, dataset2)

# Chi-squared (categorical)
chi2, p_value = stats.chi2_contingency(topic_table)
```

### Model Evaluation
```python
# Perplexity
perplexity = np.exp(loss)

# BLEU score
from nltk.translate.bleu_score import sentence_bleu
score = sentence_bleu(reference, hypothesis)

# ROUGE score
from rouge import Rouge
scores = Rouge().get_scores(hypothesis, reference)
```

## Quality Metrics
| Metric | Formula | Good |
|--------|---------|------|
| Diversity | unique/total | >0.5 |
| Avg length | sum/n | 20-100 |
| Vocabulary | unique words | >1000 |
| Missing rate | missing/total | <0.01 |

## Confidence Intervals
```python
def confidence_interval(data, confidence=0.95):
    n = len(data)
    mean = np.mean(data)
    se = stats.sem(data)
    h = se * stats.t.ppf((1 + confidence) / 2, n - 1)
    return mean - h, mean + h
```

## Normality Test
```python
# Shapiro-Wilk test
stat, p = stats.shapiro(data[:5000])  # Use sample if large

# K-S test
stat, p = stats.kstest(data, 'norm')
```

## Related Skills
- zolai-data-analytics - Dataset analysis
- model-evaluator - Model metrics
- experiment-tracker - Track experiments