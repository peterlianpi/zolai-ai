# Skill: A/B Testing

## Trigger
- "ab test"
- "compare models"
- "significance test"

## Description
Compares models statistically with A/B testing.

## Setup
```python
import numpy as np
from scipy import stats

def compare_models(model_a_results, model_b_results):
    """Compare two model outputs."""
    
    # Calculate metrics
    results = {
        "model_a": {"mean": np.mean(model_a_results)},
        "model_b": {"mean": np.mean(model_b_results)},
    }
    
    # Paired t-test
    t_stat, p_value = stats.ttest_rel(model_a_results, model_b_results)
    results["paired_ttest"] = {"t": t_stat, "p": p_value}
    
    # Effect size (Cohen's d)
    diff = np.mean(model_a_results) - np.mean(model_b_results)
    pooled_std = np.sqrt((np.std(model_a_results)**2 + np.std(model_b_results)**2) / 2)
    results["cohens_d"] = diff / pooled_std
    
    return results
```

## Statistical Tests

### 1. Paired t-test (for scores)
```python
# When same test set
from scipy.stats import ttest_rel

t, p = ttest_rel(model_a_scores, model_b_scores)
significant = p < 0.05
```

### 2. McNemar's test (for classifications)
```python
# When binary outcomes
from scipy.stats import chi2

# Confusion matrix
a_correct = 45
a_wrong_b_correct = 10
b_wrong_a_correct = 5
a_wrong_b_wrong = 40

chi2, p = chi2_contingency([[a_correct, a_wrong_b_correct], 
                            [b_wrong_a_correct, a_wrong_b_wrong]])
```

### 3. Wilcoxon signed-rank (non-parametric)
```python
from scipy.stats import wilcoxon

stat, p = wilcoxon(model_a_scores, model_b_scores)
```

### 4. Bootstrap confidence interval
```python
def bootstrap_ci(data, n_bootstrap=10000, ci=0.95):
    means = []
    for _ in range(n_bootstrap):
        sample = np.random.choice(data, size=len(data), replace=True)
        means.append(np.mean(sample))
    
    lower = np.percentile(means, (1-ci)/2 * 100)
    upper = np.percentile(means, (1+ci)/2 * 100)
    return lower, upper
```

## A/B Test Design
```python
def ab_test_setup():
    return {
        "name": "model_comparison_v1",
        "control": "zolai-v0",
        "treatment": "zolai-v1",
        "sample_size": 100,
        "metrics": ["bleu", "rouge_l", "accuracy"],
        "alpha": 0.05,  # significance level
    }
```

## Running A/B Test
```bash
# Run comparison
python -c "
from skills.ab_tester import compare_models

# Collect results from both models
results_a = []  # from model A
results_b = []  # from model B

comparison = compare_models(results_a, results_b)
print(json.dumps(comparison, indent=2))
"
```

## Interpreting Results
| p-value | Interpretation |
|---------|----------------|
| p < 0.001 | Very significant |
| p < 0.01 | Significant |
| p < 0.05 | Marginal |
| p > 0.05 | Not significant |

| Cohen's d | Effect |
|-----------|--------|
| > 0.8 | Large |
| 0.5-0.8 | Medium |
| 0.2-0.5 | Small |
| < 0.2 | Negligible |

## Example Results
```json
{
  "control": "gemma2b",
  "treatment": "qwen2-1.5b",
  "sample_size": 100,
  "metrics": {
    "bleu": {
      "control_mean": 0.32,
      "treatment_mean": 0.38,
      "improvement": "+18.7%",
      "p_value": 0.023,
      "significant": true,
      "cohens_d": 0.45
    }
  }
}
```

## Commands
```bash
# Run full A/B test
python pipelines/ab_test.py \
  --model-a models/zolai-v0 \
  --model-b models/zolai-v1 \
  --test-set data/test/ \
  --output results/ab_comparison.json
```

## Related Skills
- model-evaluator - Evaluate models
- experiment-tracker - Track results
- zolai-statistics - Statistical tests