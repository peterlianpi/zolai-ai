# Skill: Experiment Tracker

## Trigger
- "track experiment"
- "log metrics"
- "compare runs"

## Description
Tracks ML experiments and training runs.

## Tools
| Tool | Purpose |
|------|---------|
| MLflow | Full experiment tracking |
| Weights & Biases | Cloud tracking |
| TensorBoard | Local visualization |
| CSV/JSON | Simple logging |

## MLflow Setup
```bash
pip install mlflow
mlflow server --backend-store-uri sqlite:///mlruns.db
```

## Python API
```python
import mlflow
from mlflow.tracking import MlflowClient

client = MlflowClient()

# Start run
with mlflow.start_run(run_name="zolai-v1-baseline") as run:
    run_id = run.info.run_id
    
    # Log parameters
    mlflow.log_params({
        "model": "qwen2-0.5b",
        "lr": 3e-4,
        "epochs": 3,
        "batch_size": 4,
    })
    
    # Log metrics
    mlflow.log_metric("loss", 0.15)
    mlflow.log_metric("perplexity", 12.5)
    mlflow.log_metric("bleu", 0.42)
    
    # Log artifacts
    mlflow.log_artifact("model/")
    mlflow.log_artifact("eval_results.json")
    
    # Log evaluation table
    table = mlflow.FeatureLookupTable()
    table.log_predictions(df)
```

## TensorBoard
```bash
# Start server
tensorboard --logdir runs/

# In training
from torch.utils.tensorboard import SummaryWriter
writer = SummaryWriter("runs/v1")

for step, loss in enumerate(losses):
    writer.add_scalar("loss/train", loss, step)
    writer.add_scalar("perplexity", perplexity, step)
```

## Manual Tracking
```python
import json
import csv
from datetime import datetime

def log_experiment(config, metrics):
    """Log to CSV."""
    data = {
        "timestamp": datetime.now().isoformat(),
        **config,
        **metrics,
    }
    
    with open("experiments/log.csv", "a") as f:
        writer = csv.DictWriter(f, fieldnames=data.keys())
        if f.tell() == 0:
            writer.writeheader()
        writer.writerow(data)
```

## Comparison Table
```python
# experiments/log.csv structure
timestamp,model,lr,epochs,loss,perplexity,bleu,status
2024-01-01,v1-baseline,3e-4,3,0.15,12.5,0.42,keep
2024-01-01,v1-lr2e-4,2e-4,3,0.14,11.8,0.44,keep
```

## Commands
```bash
# MLflow UI
mlflow ui --backend-store-uri sqlite:///mlruns.db

# TensorBoard
tensorboard --logdir runs/

# View experiments
cat experiments/log.csv | sort -t, -k6 -n | head

# Compare
python pipelines/compare.py --experiment v1 --baseline v0
```

## Best Practices
- Log every experiment
- Use meaningful names
- Log both config and metrics
- Keep all runs (don't delete)
- Use tags: "baseline", "abandoned", "best"

## Related Skills
- model-evaluator - Evaluate metrics
- model-trainer - Train with tracking
- zolai-statistics - Statistical analysis