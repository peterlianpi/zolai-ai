# ⚡ Quick Reference - Optimized Tools & Libraries

## 🎯 System Specs
- **CPU:** 4 cores → Use 3 workers
- **RAM:** 1.3GB available → Batch size 256
- **Disk:** 28GB available → Cache 5GB

## 📦 Key Libraries

| Library | Use Case | Why |
|---------|----------|-----|
| `orjson` | JSON parsing | 3x faster than json |
| `asyncio` | Concurrency | Non-blocking I/O |
| `sqlalchemy` | Database | Connection pooling |
| `diskcache` | Caching | Survives restarts |
| `structlog` | Logging | Structured output |

## 🔧 Common Patterns

### Stream Large File
```python
from server.data import stream_jsonl
async for item in stream_jsonl("file.jsonl"):
    process(item)
```

### Batch Database Insert
```python
from server.db import batch_insert
count = await batch_insert(session, Model, items)
```

### Cached Function
```python
from server.cache import cached
@cached(ttl=3600)
async def expensive_op():
    return result
```

### Structured Logging
```python
from server.logging import get_logger
logger = get_logger(__name__)
logger.info("event", key="value")
```

## ⚙️ Configuration

**Machine Config** (`config/machine.py`)
```python
cpu_cores = 4
worker_processes = 3
batch_size = 256
db_pool_size = 5
max_concurrent_tasks = 20
```

**Server Config** (`server/config.py`)
```python
workers = 3
timeout = 60
db_pool_size = 5
```

## 🚀 Start Server
```bash
python server/main.py
# Uses 3 workers, batch_size=256, pool_size=5
```

## 📊 Monitor
```bash
# Memory
free -h

# Disk
df -h /

# Cache
python -c "from server.cache import cache_stats; print(cache_stats())"

# DB connections
psql -c "SELECT count(*) FROM pg_stat_activity;"
```

## ❌ Avoid

| Pattern | Why | Use Instead |
|---------|-----|-------------|
| `json.load()` | Slow, memory | `orjson` + streaming |
| `list(map())` | Blocks | `concurrent_map()` |
| `psycopg2.connect()` | No pooling | `get_async_session()` |
| `asyncio.gather(*)` | Unlimited | `concurrent_map(limit=20)` |
| `open().read()` | Memory spike | `stream_file()` |

## 📈 Expected Results

- **Memory:** 6.3GB → <2GB (68% reduction)
- **Swap:** 7.6GB → <1GB (87% reduction)
- **CPU:** 100% → 60% (better headroom)
- **DB Connections:** Unlimited → 5 (controlled)

---

**Ready to use. See TOOLS_LIBRARIES_OPTIMIZATION.md for details.**
