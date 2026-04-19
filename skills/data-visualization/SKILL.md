# Skill: Data Visualization

## Trigger
- "visualize data"
- "plot"
- "charts"

## Description
Creates visualizations for Zolai data analysis.

## Basic Plots
```python
import matplotlib.pyplot as plt

# Bar chart (topic distribution)
def plot_topics(data):
    topics = data["by_topic"]
    plt.figure(figsize=(10, 6))
    plt.bar(topics.keys(), topics.values())
    plt.title("Topic Distribution")
    plt.xlabel("Topic")
    plt.ylabel("Count")
    plt.xticks(rotation=45)
    plt.tight_layout()
    plt.savefig("stats/topics.png", dpi=150)
```

## Visualization Types

### 1. Topic Distribution
```python
import seaborn as sns

def plot_topic_dist(df):
    plt.figure(figsize=(12, 6))
    sns.barplot(x="topic", y="count", data=df)
    plt.title("Zolai Dataset - Topic Distribution")
    plt.savefig("stats/topic_dist.png")
```

### 2. Length Distribution
```python
def plot_length_hist(lengths):
    plt.figure(figsize=(10, 6))
    plt.hist(lengths, bins=50, edgecolor="black")
    plt.xlabel("Text Length")
    plt.ylabel("Frequency")
    plt.title("Text Length Distribution")
    plt.savefig("stats/length_dist.png")
```

### 3. Dialect Split
```python
def plot_dialect(df):
    plt.figure(figsize=(8, 8))
    df["dialect"].value_counts().plot.pie(autopct="%1.1f%%")
    plt.title("Dialect Distribution")
    plt.savefig("stats/dialect.png")
```

### 4. Training Curve
```python
def plot_training_curve(logs):
    plt.figure(figsize=(10, 6))
    plt.plot(logs["step"], logs["loss"], label="Train")
    plt.plot(logs["step"], logs["val_loss"], label="Val")
    plt.xlabel("Step")
    plt.ylabel("Loss")
    plt.legend()
    plt.title("Training Curve")
    plt.savefig("stats/training.png")
```

### 5. Heatmap (Correlation)
```python
def plot_correlation(df):
    plt.figure(figsize=(10, 8))
    sns.heatmap(df.corr(), annot=True)
    plt.title("Feature Correlation")
    plt.savefig("stats/correlation.png")
```

## Interactive (Plotly)
```python
import plotly.express as px

fig = px.bar(df, x="topic", y="count", title="Zolai Topics")
fig.write_html("stats/topics_interactive.html")
```

## Dashboard
```python
# Create dashboard
fig = make_subplots(
    rows=2, cols=2,
    subplot_titles=("Topics", "Lengths", "Dialects", "Quality")
)

fig.add_trace(go.Bar(x=topics.keys(), y=topics.values()), row=1, col=1)
fig.add_trace(go.Histogram(x=lengths), row=1, col=2)
# ... more plots

fig.write_html("stats/dashboard.html")
```

## Commands
```bash
# Generate all stats
python pipelines/visualize.py --input dataset/ --output stats/

# Specific visualization
python -c "
import json
import matplotlib.pyplot as plt

with open('dataset/stats.json') as f:
    data = json.load(f)
    
# Create plots
plt.bar(data['topics'].keys(), data['topics'].values())
plt.savefig('stats/topics.png')
"
```

## Output
Save visualizations to `stats/`:
- topic_dist.png
- length_dist.png
- dialect.png
- training_curve.png
- correlation.png
- dashboard.html

## Related Skills
- zolai-data-analytics - Data analysis
- zolai-statistics - Statistical tests
- model-evaluator - Model plots