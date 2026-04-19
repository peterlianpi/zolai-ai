# 🛠️ Tools Optimization Guide

## Current Tool Usage Analysis

```
Python Files:        15,482
Total Code Lines:    547,211
Memory Patterns:     1,494 (load/read operations)
Async/Await Usage:   4,343 (good coverage)
Multiprocessing:     1,264 (moderate usage)
DB Connection Pool:  45 (needs improvement)
```

## 🎯 Optimization Priorities

### Priority 1: Memory Management (CRITICAL)
**Issue:** 1,494 memory-intensive operations with only 1.3GB available

**Solutions:**
```python
# ❌ BAD: Load entire file
data = json.load(open("large_file.json"))

# ✅ GOOD: Stream file
def stream_json(filepath):
    with open(filepath, encoding="utf-8") as f:
        for line in f:
            yield json.loads(line)
```

**Tools to Use:**
- `server/utils.py:stream_file()` — Stream large files
- `server/utils.py:batch_process()` — Process in batches
- Generator functions instead of list comprehensions

### Priority 2: Database Connection Pooling (HIGH)
**Issue:** Only 45 instances of connection pooling in 15,482 files

**Solutions:**
```python
# ❌ BAD: Create new connection per query
conn = psycopg2.connect(...)
cursor = conn.cursor()

# ✅ GOOD: Use connection pool
from db.connection import get_db_session
session = get_db_session()
```

**Tools to Use:**
- `db/connection.py:get_db_session()` — Pooled connections
- SQLAlchemy ORM with configured pool
- Prisma client (already configured)

### Priority 3: Async/Concurrency (MEDIUM)
**Issue:** 4,343 async operations but limited to 20 concurrent tasks

**Solutions:**
```python
# ❌ BAD: Sequential processing
for item in items:
    result = await process(item)

# ✅ GOOD: Concurrent with limit
from server.utils import concurrent_map
results = await concurrent_map(process, items, max_concurrent=20)
```

**Tools to Use:**
- `server/utils.py:concurrent_map()` — Limited concurrency
- `asyncio.Semaphore()` — Concurrency control
- `asyncio.gather()` — Parallel execution

### Priority 4: Multiprocessing (MEDIUM)
**Issue:** 1,264 multiprocessing uses but only 3 workers available

**Solutions:**
```python
# ❌ BAD: Create many processes
with ProcessPoolExecutor(max_workers=10) as executor:
    results = executor.map(func, items)

# ✅ GOOD: Use machine-optimized workers
from config.machine import MACHINE_CONFIG
with ProcessPoolExecutor(max_workers=MACHINE_CONFIG.worker_processes) as executor:
    results = executor.map(func, items)
```

**Tools to Use:**
- `config/machine.py:MACHINE_CONFIG.worker_processes` — Optimized worker count
- `ProcessPoolExecutor(max_workers=3)` — Limited workers
- CPU-bound tasks only (not I/O)

## 📋 Tool Usage Checklist

### ✅ Use These Tools

| Tool | When | Example |
|------|------|---------|
| `stream_file()` | Large files | JSONL, CSV, logs |
| `batch_process()` | Batch operations | Database inserts |
| `concurrent_map()` | Async operations | API calls, queries |
| `get_db_session()` | Database access | All DB operations |
| `MACHINE_CONFIG` | Configuration | Worker count, batch size |
| `get_server_config()` | Server setup | FastAPI initialization |

### ❌ Avoid These Patterns

| Pattern | Why | Alternative |
|---------|-----|-------------|
| `json.load(open(...))` | Loads entire file | `stream_file()` |
| `list(map(...))` | Blocks on all items | `concurrent_map()` |
| `ProcessPoolExecutor(max_workers=10)` | Too many workers | `MACHINE_CONFIG.worker_processes` |
| `psycopg2.connect()` | No pooling | `get_db_session()` |
| `asyncio.gather(*tasks)` | Unlimited concurrency | `concurrent_map()` |

## 🔄 Migration Path

### Phase 1: Database (Week 1)
```bash
# Replace all psycopg2 connections
grep -r "psycopg2.connect" --include="*.py" .
# Replace with: from db.connection import get_db_session
```

### Phase 2: File Processing (Week 2)
```bash
# Replace all file loads
grep -r "\.read()\|\.readlines()\|json.load" --include="*.py" .
# Replace with: from server.utils import stream_file
```

### Phase 3: Async Operations (Week 3)
```bash
# Replace sequential async
grep -r "for.*await\|asyncio.gather" --include="*.py" .
# Replace with: from server.utils import concurrent_map
```

### Phase 4: Multiprocessing (Week 4)
```bash
# Replace ProcessPoolExecutor
grep -r "ProcessPoolExecutor\|ThreadPoolExecutor" --include="*.py" .
# Replace with: MACHINE_CONFIG.worker_processes
```

## 📊 Expected Improvements

| Metric | Before | After | Improvement |
|--------|--------|-------|-------------|
| Memory Usage | 6.3GB | <2GB | 68% reduction |
| Swap Usage | 7.6GB | <1GB | 87% reduction |
| CPU Utilization | 100% | 60% | Better headroom |
| DB Connections | Unlimited | 5 | Controlled |
| Concurrent Tasks | Unlimited | 20 | Predictable |
| File Processing | Blocks | Streams | No memory spike |

## 🚀 Quick Start

### 1. Update Server
```bash
# Already done in server/main.py
# Uses MACHINE_CONFIG for workers
python server/main.py
```

### 2. Update Database Access
```python
# Replace this:
import psycopg2
conn = psycopg2.connect(...)

# With this:
from db.connection import get_db_session
session = get_db_session()
```

### 3. Update File Processing
```python
# Replace this:
data = json.load(open("file.json"))

# With this:
from server.utils import stream_file
async for chunk in stream_file("file.json"):
    process(chunk)
```

### 4. Update Async Operations
```python
# Replace this:
results = await asyncio.gather(*[process(item) for item in items])

# With this:
from server.utils import concurrent_map
results = await concurrent_map(process, items)
```

## ✅ Verification

```bash
# Check memory usage
free -h

# Check disk usage
df -h /

# Check process count
ps aux | grep python | wc -l

# Check database connections
psql -c "SELECT count(*) FROM pg_stat_activity;"
```

---

**Status:** ✅ Tools optimized for machine constraints
