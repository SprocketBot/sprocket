# Agent Harness Local Runtime Guide

## Purpose

This document provides AI agents with a single source of truth for operating the local development environment. It focuses on the minimal commands and knowledge needed for effective agent workflows.

## One-Command Boot Sequence

### Start Full Stack

```bash
npm run dev:up
```

**What this does:**
- Starts all infrastructure services (postgres, redis, rabbitmq, minio)
- Starts all application services (core, web, microservices)
- Applies health checks to verify services are ready
- Expected boot time: 2-3 minutes on first run, 30-60 seconds on subsequent runs

### Verify Stack is Running

```bash
npm run dev:status
```

**Expected output:**
```
PostgreSQL:      healthy (port 5434)
Redis:           healthy (port 6379)
RabbitMQ:        healthy (port 5672, mgmt 15672)
MinIO:           healthy (port 9000, console 9001)
Core API:        healthy (port 3001)
Web Client:      healthy (port 8080)
```

### Stop Full Stack

```bash
npm run dev:down
```

### Reset to Clean State

```bash
npm run dev:reset
```

**What this does:**
- Stops all services
- Removes all Docker volumes (deletes all data)
- Restarts with fresh database and storage

---

## Service Dependency Graph

```
┌─────────────────────────────────────────────────────┐
│                   Infrastructure                     │
│  ┌──────────┐  ┌───────┐  ┌──────────┐  ┌────────┐ │
│  │ postgres │  │ redis │  │ rabbitmq │  │ minio  │ │
│  │ :5434    │  │ :6379 │  │ :5672    │  │ :9000  │ │
│  └────┬─────┘  └───┬───┘  └────┬─────┘  └───┬────┘ │
└───────┼────────────┼───────────┼────────────┼──────┘
        │            │           │            │
        ▼            ▼           ▼            ▼
┌─────────────────────────────────────────────────────┐
│                  Application Layer                   │
│  ┌──────────┐  ┌──────────────────────────────┐    │
│  │   core   │  │    microservices             │    │
│  │  :3001   │  │  - submission                │    │
│  └────┬─────┘  │  - matchmaking               │    │
│       │        │  - replay-parse              │    │
│       │        │  - notification              │    │
│       │        │  - analytics                 │    │
│       │        └──────────────────────────────┘    │
│       │                                            │
│       ▼                                            │
│  ┌──────────┐                                      │
│  │   web    │                                      │
│  │  :8080   │                                      │
│  └──────────┘                                      │
└─────────────────────────────────────────────────────┘
```

**Key dependencies:**
- `core` depends on: postgres, redis, rabbitmq, minio
- `web` depends on: core
- `microservices` depend on: rabbitmq, minio, redis, (core for some)

---

## Health Check Endpoints

### Infrastructure Services

| Service    | Health Check                          | Port  |
|------------|---------------------------------------|-------|
| PostgreSQL | `docker-compose ps postgres`          | 5434  |
| Redis      | `redis-cli ping` → `PONG`             | 6379  |
| RabbitMQ   | `rabbitmq-diagnostics ping`           | 5672  |
| RabbitMQ UI| http://localhost:15672                | 15672 |
| MinIO      | http://localhost:9000/minio/health    | 9000  |
| MinIO Console | http://localhost:9001              | 9001  |

### Application Services

| Service | Health Check                          | Port  |
|---------|---------------------------------------|-------|
| Core    | http://localhost:3001/healthz         | 3001  |
| Core GraphQL | `curl http://localhost:3001/graphql -d '{"query":"{__typename}"}'` | 3001 |
| Web     | http://localhost:8080                 | 8080  |

---

## Common Debugging Commands

### View Service Logs

```bash
# All services
npm run dev:logs

# Specific service
npm run dev:logs -- core
npm run dev:logs -- web
npm run dev:logs -- postgres
```

### Check Service Status

```bash
# Via docker-compose
docker-compose ps

# Via harness
npm run dev:status
```

### Restart a Single Service

```bash
# Without rebuild
docker-compose restart core

# With rebuild (after code changes)
docker-compose up --build -d core
```

### Access Database

```bash
# Via docker
docker-compose exec postgres psql -U sprocketbot -d sprocket

# Direct connection (if psql installed locally)
psql -h localhost -p 5434 -U sprocketbot -d sprocket
# Password: localdevpassword
```

### Access Redis

```bash
docker-compose exec redis redis-cli
```

### Access RabbitMQ CLI

```bash
docker-compose exec rabbitmq rabbitmq-diagnostics ping
```

---

## Expected Boot Time and Resources

### Boot Times

| Scenario              | Expected Time |
|-----------------------|---------------|
| First boot (pull images) | 3-5 minutes   |
| Cold boot (images cached) | 2-3 minutes   |
| Warm restart          | 30-60 seconds |
| Single service rebuild | 30-90 seconds |

### Resource Requirements

| Resource | Minimum | Recommended |
|----------|---------|-------------|
| RAM      | 4 GB    | 8 GB        |
| CPU      | 2 cores | 4 cores     |
| Disk     | 10 GB   | 20 GB       |

### Check Resource Usage

```bash
# Docker stats
docker stats --no-stream

# Disk usage
docker system df
```

---

## Troubleshooting Guide

### Problem: Services Won't Start

**Symptoms:** `docker-compose up` fails or services exit immediately

**Diagnosis:**
```bash
# Check status
docker-compose ps

# Check logs for specific service
docker-compose logs postgres
docker-compose logs core
```

**Common causes:**
1. Port already in use (another process on 3001, 5434, etc.)
2. Out of disk space
3. Corrupted volumes

**Solutions:**
```bash
# Free up ports
lsof -i :3001  # Find process using port 3001
kill <PID>     # Kill the process

# Clean up disk
docker system prune -a --volumes

# Full reset
npm run dev:reset
```

---

### Problem: Database Connection Errors

**Symptoms:** Core API logs show "ECONNREFUSED" or "connection refused"

**Diagnosis:**
```bash
# Check if postgres is running
docker-compose ps postgres

# Check postgres logs
docker-compose logs postgres

# Verify .env configuration
cat .env | grep POSTGRES
```

**Expected .env values:**
```
POSTGRES_HOST=postgres
POSTGRES_PORT=5434
POSTGRES_DB=sprocket
POSTGRES_USER=sprocketbot
POSTGRES_PASSWORD=localdevpassword
```

**Solution:**
```bash
# Restart postgres
docker-compose restart postgres

# Wait for it to be ready
sleep 10

# Restart core
docker-compose restart core
```

---

### Problem: GraphQL Endpoint Returns 500

**Symptoms:** `curl http://localhost:3001/graphql` returns 500 error

**Diagnosis:**
```bash
# Check core logs
docker-compose logs --tail=100 core

# Test health endpoint
curl http://localhost:3001/healthz
```

**Common causes:**
1. Database migrations not run
2. Missing required environment variables
3. Code compilation errors

**Solutions:**
```bash
# Run migrations
docker-compose exec core npm run migration:run

# Check environment
docker-compose exec core env | grep -E "POSTGRES|RABBIT|MINIO|REDIS"

# Rebuild core
docker-compose up --build -d core
```

---

### Problem: Web Client Shows 500 Errors

**Symptoms:** http://localhost:8080 loads but pages return 500

**Diagnosis:**
```bash
# Check web logs
docker-compose logs web

# Check if core is accessible from web
docker-compose exec web curl http://core:3001/healthz
```

**Common causes:**
1. Svelte compilation errors (pre-existing in codebase)
2. Core API not accessible
3. Environment variable mismatch

**Solutions:**
```bash
# Rebuild web
docker-compose up --build -d web

# Check core connectivity
docker-compose logs core | grep "listening"
```

---

### Problem: Out of Disk Space

**Symptoms:** Docker commands fail with "no space left on device"

**Diagnosis:**
```bash
docker system df
```

**Solution:**
```bash
# Remove unused data
docker system prune -a --volumes

# Remove old images
docker image prune -a

# Rebuild fresh
npm run dev:reset
```

---

## Minimal Validation Flow

For agents making changes, this is the minimal validation sequence:

### 1. Before Changes (Baseline)

```bash
# Ensure stack is running
npm run dev:status

# Run smoke test
npm run dev:smoke
```

### 2. Make Changes

```bash
# Edit files
vim core/src/my-module.ts

# Rebuild affected service
docker-compose up --build -d core
```

### 3. After Changes (Validation)

```bash
# Check service is healthy
curl http://localhost:3001/healthz

# Run targeted tests
npm run test --workspace=core -- --testPathPattern=my-module

# Run smoke test again
npm run dev:smoke
```

### 4. Collect Artifacts

```bash
# If validation failed, collect artifacts
npm run harness:collect

# Check artifacts directory
ls -la artifacts/latest/
```

---

## Quick Reference Card

```bash
# Start everything
npm run dev:up

# Check status
npm run dev:status

# View logs
npm run dev:logs -- <service>

# Run smoke tests
npm run dev:smoke

# Stop everything
npm run dev:down

# Reset to clean state
npm run dev:reset

# Seed test data
npm run dev:seed

# Run Tier 0 verification
npm run verify:tier0 -- local-dev
```

---

## Environment Files

### Location
- `.env.local` - Template for local development (committed to repo)
- `.env` - Active environment (generated from .env.local)
- `.env.prod` - Production credentials (not committed, operator-provided)

### Setup
```bash
# First time setup
cp .env.local .env

# Or use setup script
./scripts/setup-local.sh
```

### Critical Variables
```bash
POSTGRES_HOST=postgres
POSTGRES_PORT=5434
POSTGRES_DB=sprocket
POSTGRES_USER=sprocketbot
POSTGRES_PASSWORD=localdevpassword

REDIS_HOST=redis
REDIS_PORT=6379

RABBITMQ_HOST=rabbitmq
RABBITMQ_USER=admin
RABBITMQ_PASSWORD=localrabbitpass

MINIO_ENDPOINT=minio:9000
MINIO_ACCESS_KEY=admin
MINIO_SECRET_KEY=localminiopass
```

---

## Related Documentation

- **Task Classifications:** `reports/agent-harness-charter.md`
- **Service Metadata:** `scripts/harness/service-manifest.json`
- **Task Protocol:** `reports/agent-task-protocol.md`
- **Self-Review Checklist:** `reports/agent-self-review-checklist.md`
- **Main Development Guide:** `LOCAL_DEVELOPMENT.md`
