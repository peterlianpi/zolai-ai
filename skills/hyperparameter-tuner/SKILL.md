# Skill: Hyperparameter Tuner

## Trigger
- "tune hyperparameters"
- "optimize training"
- "grid search"

## Description
Optimizes model hyperparameters for best performance.

## Parameters to Tune
| Parameter | Typical Values |
|-----------|----------------|
| learning_rate | 1e-5 to 1e-2 |
| batch_size | 1, 2, 4, 8, 16 |
| epochs | 1, 2, 3, 5 |
| lora_r | 4, 8, 16, 32 |
| lora_alpha | 16, 32, 64 |

## Methods

### 1. Grid Search
```python
from itertools import product

def grid_search():
    params = {
        "lr": [1e-4, 3e-4, 1e-3],
        "batch_size": [2, 4, 8],
        "epochs": [1, 2, 3],
    }
    
    for values in product(*params.values()):
        config = dict(zip(params.keys(), values))
        yield config
```

### 2. Random Search
```python
import random

def random_search(n_trials=10):
    for _ in range(n_trials):
        yield {
            "lr": random.choice([1e-5, 1e-4, 1e-3]),
            "batch_size": random.choice([2, 4, 8]),
            "lora_r": random.choice([8, 16, 32]),
        }
```

### 3. Optuna (Bayesian)
```python
import optuna

def objective(trial):
    lr = trial.suggest_float("lr", 1e-5, 1e-3, log=True)
    batch = trial.suggest_int("batch_size", 2, 8)
    
    # Train and evaluate
    train(lr=lr, batch_size=batch)
    return eval_score

study = optuna.create_study()
study.optimize(objective, n_trials=20)
```

## Automation
```bash
# Grid search on Kaggle
python -c "
from skills.hyperparameter_tuner import grid_search

for config in grid_search():
    print(f'Testing: {config}')
    # Run training
    # Log results
"
```

## Results
```json
{
  "trials": [
    {"lr": 1e-4, "batch": 4, "bleu": 0.38, "keep": true},
    {"lr": 3e-4, "batch": 4, "bleu": 0.42, "keep": true},
    {"lr": 1e-3, "batch": 4, "bleu": 0.35, "keep": false}
  ],
  "best": {"lr": 3e-4, "batch": 4}
}
```

## Best Practices
- Start with default params
- Try learning rate first
- Then batch size
- Use early stopping
- Limit trials on Kaggle (12hr)

## Related Skills
- model-trainer - Train model
- experiment-tracker - Track results
- model-evaluator - Evaluate