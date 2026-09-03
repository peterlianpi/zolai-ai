# 🛠️ Tools & Libraries Optimization

## System Constraints
- **CPU:** 4 cores
- **RAM:** 7.7GB total | 1.3GB available
- **Disk:** 233GB total | 28GB available (88% used)

## 📦 Optimized Dependencies

### Data Processing (Memory-Efficient)
```
orjson==3.9.10          # Fast JSON parsing (3x faster than json)
jsonlines==4.0.0        # JSONL streaming
pandas==2.1.0           # Data manipulation (use chunking)
numpy==1.24.0           # Numerical operations
```

**Why:** orjson is 3x faster and uses less memory than stdlib json

### Database (Connection Pooling)
```
sqlalchemy==2.0.0       # ORM with async support
psycopg2-binary==2.9.0  # PostgreSQL driver
sqlalchemy-utils==0.41.1 # Utilities
```

**Why:** Connection pooling prevents connection exhaustion on 4 cores

### Async & Concurrency (Non-Blocking)
```
fastapi==0.104.0        # Async web framework
uvicorn[standard]==0.24.0 # ASGI server
aiofiles==23.2.1        # Async file I/O
```

**Why:** Async prevents blocking on I/O, critical with 1.3GB RAM

### Caching (Disk-Based)
```
diskcache==5.6.3        # Disk-based cache (5GB limit)
cachetools==5.3.2       # In-memory cache utilities
```

**Why:** Disk cache prevents memory overflow, uses available disk space

### Logging (Structured)
```
structlog==23.2.0       # Structured logging
python-json-logger==2.0.0 # JSON logging
```

**Why:** Structured logging enables better monitoring and debugging

## 🔧 Optimized Tools

### 1. Data Processing (`server/data.py`)

**Stream JSONL (Memory-Efficient)**
```python
from server.data import stream_jsonl

async for item in stream_jsonl("large_file.jsonl"):
    process(item)
```
- Uses `orjson` (3x faster)
- Chunks by 10,000 lines
- Yields control with `await asyncio.sleep(0)`

**Batch Iterator**
```python
from server.data import batch_iter

for batch in batch_iter(items, batch_size=256):
    process_batch(batch)
```
- Processes in 256-item batches
- Fits in 1.3GB available RAM

**Deduplicate JSONL**
```python
from server.data import dedupe_jsonl

count = await dedupe_jsonl("input.jsonl", "output.jsonl", key="id")
```
- Memory-efficient deduplication
- Uses set for O(1) lookups

### 2. Database (`server/db.py`)

**Async Session Management**
```python
from server.db import get_async_session

async with get_async_session() as session:
    result = await session.execute(query)
```
- Connection pooling (pool_size=5)
- Async operations (non-blocking)
- Pre-ping verification

**Batch Insert**
```python
from server.db import batch_insert

count = await batch_insert(session, Model, items, batch_size=256)
```
- Inserts in 256-item batches
- Commits after each batch
- Prevents memory overflow

**Batch Query**
```python
from server.db import batch_query

async for batch in batch_query(session, query):
    process_batch(batch)
```
- Queries in 256-item batches
- Streams results
- No memory spike

### 3. Caching (`server/cache.py`)

**Disk-Based Cache**
```python
from server.cache import cached

@cached(ttl=3600)
async def expensive_operation(param):
    return result
```
- Stores on disk (5GB limit)
- TTL-based expiration
- Survives process restarts

**Cache Statistics**
```python
from server.cache import cache_stats

stats = cache_stats()
# {'size': 1234567, 'items': 42, 'max_size': 5368709120}
```

### 4. Logging (`server/logging.py`)

**Structured Logging**
```python
from server.logging import get_logger

logger = get_logger(__name__)
logger.info("event", key="value", count=42)
```
- JSON output
- Structured fields
- File and stdout

## 📊 Performance Comparison

| Operation | Before | After | Improvement |
|-----------|--------|-------|-------------|
| JSON parsing | json (1x) | orjson (3x) | 3x faster |
| File loading | Load all | Stream | No memory spike |
| DB queries | Unlimited | Batched (256) | Controlled memory |
| Concurrency | Unlimited | Limited (20) | Predictable |
| Caching | In-memory | Disk (5GB) | Survives restarts |

## 🚀 Usage Examples

### Process Large JSONL File
```python
from server.data import stream_jsonl, write_jsonl

async def process_file():
    async def transform():
        async for item in stream_jsonl("input.jsonl"):
            item["processed"] = True
            yield item
    
    count = await write_jsonl("output.jsonl", transform())
    print(f"Processed {count} items")
```

### Batch Database Operations
```python
from server.db import get_async_session, batch_insert

async def load_data():
    async with get_async_session() as session:
        items = [{"name": f"item_{i}"} for i in range(1000)]
        count = await batch_insert(session, Entry, items)
        print(f"Inserted {count} items")
```

### Cached API Endpoint
```python
from fastapi import FastAPI
from server.cache import cached

app = FastAPI()

@app.get("/api/expensive")
@cached(ttl=3600)
async def expensive_endpoint(param: str):
    # This result is cached for 1 hour
    return {"result": compute(param)}
```

### Stream and Transform Data
```python
from server.data import stream_jsonl, batch_iter, write_jsonl

async def transform_data():
    items = []
    async for item in stream_jsonl("input.jsonl"):
        items.append(transform(item))
    
    # Write in batches
    async def batch_gen():
        for batch in batch_iter(items):
            for item in batch:
                yield item
    
    await write_jsonl("output.jsonl", batch_gen())
```

## ✅ Checklist

- [x] orjson for fast JSON parsing
- [x] Async database with connection pooling
- [x] Disk-based caching (5GB limit)
- [x] Structured logging
- [x] Stream-based file processing
- [x] Batch-based database operations
- [x] Limited concurrency (20 tasks)
- [x] Memory-efficient utilities

## 📈 Scaling

### If Memory Increases to 2GB
```python
# Increase batch sizes
BATCH_SIZE = 512
CHUNK_SIZE = 20000
```

### If Disk Space Increases to 100GB
```python
# Increase cache size
MAX_CACHE_GB = 20
```

### If CPU Increases to 8 Cores
```python
# Increase workers
API_WORKERS = 6
WORKER_PROCESSES = 7
MAX_CONCURRENT_TASKS = 50
```

## 🔍 Monitoring

### Check Memory Usage
```bash
# Real-time
watch -n 1 'free -h'

# Process-specific
ps aux | grep python | grep server
```

### Check Cache Usage
```python
from server.cache import cache_stats
print(cache_stats())
```

### Check Database Connections
```bash
psql -c "SELECT count(*) FROM pg_stat_activity;"
```

---

**Status:** ✅ Tools & libraries optimized for 4 cores, 1.3GB RAM, 28GB disk
