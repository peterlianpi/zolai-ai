# Server Infrastructure

## VPS Specifications

| Spec | Value |
|------|-------|
| Provider | AWS EC2 |
| Instance | t3.small (spot) |
| vCPUs | 2 |
| RAM | 2 GB |
| Disk | 58 GB SSD |
| CPU | Intel Xeon Platinum 8259CL @ 2.50GHz |
| OS | Ubuntu 24.04 LTS |

## Resource Constraints

- **Heap Limit**: 1400MB (leave ~600MB for OS)
- **Memory Max**: 1700MB (systemd)
- **Memory High**: 1500MB (systemd)

## SSH Access

```bash
# Shortcut configured in ~/.ssh/config
ssh zolai

# Or directly
ssh ubuntu@172.26.3.238
```

## Service Configuration

### Systemd Service: `zolai-next`

Location: `/etc/systemd/system/zolai-next.service`

Key settings:
- `Restart=always` with 5s delay
- Memory limits configured (1.7GB max)
- `NODE_OPTIONS=--max-old-space-size=1400`

### Management Commands

```bash
# Check status
ssh zolai 'sudo systemctl status zolai-next'

# View logs
ssh zolai 'sudo journalctl -u zolai-next -f'
ssh zolai 'sudo journalctl -u zolai-next -n 50 --no-pager'

# Restart
ssh zolai 'sudo systemctl restart zolai-next'

# Stop/Start
ssh zolai 'sudo systemctl stop zolai-next'
ssh zolai 'sudo systemctl start zolai-next'
```

## Deploy Pipeline

### Local: `scripts/deploy.sh`

1. Pre-flight: disk check, env merge
2. Kill stale builds
3. Rsync source (excludes: .git, node_modules, .next, .env*, tests)
4. Install deps + prisma generate
5. Stop service → backup .next → build → migrate → start
6. Health check (API `/api/cron/health`)

### GitHub Actions: `.github/workflows/deploy.yml`

- Triggered on push to `master`
- Runs lint + build locally first
- Syncs to server via SCP
- Runs install + migrate + restart
- Health check and Telegram alert on failure

### Monitoring: `.github/workflows/monitor.yml`

- Runs every 5 minutes
- Checks `/api/cron/health`
- Telegram alert on failure with server status

## Resource Monitoring

### During Deploy

The deploy script reports:
- Pre-flight: disk, memory, load
- Pre-build: current resource state  
- Post-build: final resource state

### Health Endpoint

```
GET /api/cron/health

Response:
{
  "success": true,
  "data": {
    "status": "ok",
    "uptime": 3600,
    "db": { "ok": true, "latencyMs": 45 },
    "memory": { "heapUsedMb": 128, "heapTotalMb": 256, "rssMb": 180 },
    "timestamp": "2026-04-15T00:00:00.000Z"
  }
}
```

## Troubleshooting

### High Memory

```bash
# Check what's using memory
ssh zolai 'free -m && ps aux --sort=-%mem | head -10'
```

### Disk Full

```bash
# Check disk usage
ssh zolai 'df -h /'
ssh zolai 'du -sh /home/ubuntu/nextjs-app/*'
```

### Service Won't Start

```bash
# Full logs
ssh zolai 'sudo journalctl -u zolai-next -n 100 --no-pager'

# Check .next build
ssh zolai 'ls -la /home/ubuntu/nextjs-app/.next'
```

### Rollback

The deploy script automatically backs up `.next` before building. If deploy fails:
1. Script attempts rollback automatically
2. Manual: `ssh zolai 'cd /home/ubuntu/nextjs-app && mv .next.bak .next && sudo systemctl start zolai-next'`