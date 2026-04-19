# 🖥️ Machine Optimization Guide

## Machine Specifications

```
OS:           Linux (Ubuntu 24.04)
Kernel:       6.17.0-20-generic
Architecture: x86_64
CPU:          4 cores
Memory:       7.7GB total | 1.3GB available
Swap:         7.8GB (7.6GB used - HIGH)
Disk:         233GB total | 28GB available (88% used)
Python:       3.14.4
Node.js:      v24.14.0
PostgreSQL:   16.13
```

## ⚠️ Critical Issues

### 1. **Memory Pressure** (6.3GB/7.7GB used)
- Only 1.3GB available
- Swap heavily used (7.6GB/7.8GB)
- **Action:** Reduce batch sizes, stream data, avoid loading entire files

### 2. **Disk Space** (194GB/233GB used)
- Only 28GB available (88% used)
- **Action:** Clean old data, use compression, monitor cache

### 3. **CPU Contention** (4 cores)
- Limited parallelism
- **Action:** Use 3 workers max, leave 1 core free

## 🔧 Optimizations Applied

### Configuration Files

**`config/machine.py`** — Machine-specific settings
```python
cpu_cores: 4
worker_threads: 4
worker_processes: 3  # Leave 1 core free
batch_size: 256      # Conservative for 1.3GB available
chunk_size: 10000    # Lines per chunk
db_pool_size: 5      # Conservative for 4 cores
max_concurrent_tasks: 20
```

**`server/config.py`** — Server configuration
```python
workers: 3           # uvicorn workers
timeout: 60          # Keep-alive timeout
db_pool_size: 5      # Connection pool
```

**`.env.machine`** — Environment variables
```
SERVER_WORKERS=3
BATCH_SIZE=256
CHUNK_SIZE=10000
MAX_CONCURRENT_TASKS=20
```

### Database Optimization

**`db/connection.py`** — Connection pooling
```python
pool_size=5              # Conservative
max_overflow=10          # Limited overflow
pool_pre_ping=True       # Verify connections
pool_recycle=3600        # Recycle hourly
```

### Processing Utilities

**`server/utils.py`** — Optimized functions
- `batch_process()` — Process items in batches
- `concurrent_map()` — Limited concurrency
- `stream_file()` — Stream large files line-by-line

## 📊 Performance Targets

| Metric | Target | Reason |
|--------|--------|--------|
| Memory Usage | <2GB | Avoid swap thrashing |
| CPU Usage | <80% | Leave headroom |
| Disk Cache | <5GB | Preserve disk space |
| DB Connections | 5 | Conservative for 4 cores |
| Concurrent Tasks | 20 | Avoid context switching |
| Batch Size | 256 | Fit in available memory |

## 🚀 Usage

### Start Server (Optimized)
```bash
# Uses 3 workers, optimized pool sizes
python server/main.py
```

### Process Large Files
```python
from server.utils import stream_file, batch_process

# Stream file in chunks
async for chunk in stream_file("large_file.jsonl"):
    process(chunk)

# Process items in batches
async for batch in batch_process(items):
    await process_batch(batch)
```

### Database Queries
```python
from db.connection import get_db_session

session = get_db_session()
# Connection pooling handles optimization
entries = session.query(Entry).limit(256).all()
```

## 🧹 Cleanup Commands

### Free Memory
```bash
# Clear cache
rm -rf /tmp/zolai_cache/*

# Clear swap (requires restart)
sudo swapoff -a && sudo swapon -a
```

### Free Disk Space
```bash
# Find large files
find . -type f -size +100M -exec ls -lh {} \;

# Remove old backups
rm -f db/backups/backup_*.sql

# Compress old data
gzip data/processed/rebuild_v*/README.md
```

### Monitor Resources
```bash
# Real-time monitoring
watch -n 1 'free -h && echo "" && df -h /'

# Process monitoring
top -p $(pgrep -f "python server/main.py")
```

## 📈 Scaling Recommendations

### If Memory Increases
- Increase `batch_size` to 512
- Increase `max_concurrent_tasks` to 50
- Increase `db_pool_size` to 10

### If Disk Space Increases
- Increase `max_cache_gb` to 10
- Enable compression for old data
- Archive processed data

### If CPU Increases
- Increase `worker_processes` to 4
- Increase `max_concurrent_tasks` to 50
- Use multiprocessing for CPU-bound tasks

## ✅ Checklist

- [x] Machine specs documented
- [x] Memory optimization applied
- [x] CPU optimization applied
- [x] Disk optimization applied
- [x] Database connection pooling configured
- [x] Batch processing utilities created
- [x] Async utilities created
- [x] Environment variables set
- [x] Monitoring commands documented

## 🔍 Monitoring

### Check Current Usage
```bash
# Memory
free -h

# Disk
df -h /

# CPU
nproc --all

# Processes
ps aux | grep python
```

### Log Optimization
```bash
# Server logs
tail -f /var/log/zolai/server.log

# Database logs
tail -f /var/log/postgresql/postgresql.log
```

---

**Status:** ✅ Machine optimized for 4 cores, 7.7GB RAM, 28GB disk
