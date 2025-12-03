# Local Development Guide

This guide helps you set up and use the local development environment to speed up your feedback loop from **15 minutes → 2-3 minutes** (or 30 seconds with hot reload).

## Quick Start

```bash
# First time setup with production data
./scripts/setup-local.sh --fresh --seed-db

# Or start fresh without seeding
./scripts/setup-local.sh --fresh

# Subsequent runs (after pulling changes, etc.)
./scripts/setup-local.sh
```

## Your New Workflow

### Option A: Standard (2-3 minute feedback loop)
```bash
# 1. Make code changes
vim core/src/whatever.ts

# 2. Rebuild just the service you changed
docker-compose up --build -d core

# 3. Test immediately
curl -X POST http://localhost:3001/graphql \
  -H "Content-Type: application/json" \
  -d '{"query": "{ __typename }"}'
```

### Option B: Hot Reload (30 second feedback loop) - COMING SOON
See the "Hot Reload Setup" section below.

## Services & Endpoints

| Service | URL | Credentials |
|---------|-----|-------------|
| Core API / GraphQL | http://localhost:3001/graphql | - |
| Web Client | http://localhost:8080 | - |
| Image Gen UI | http://localhost:8081 | - |
| RabbitMQ Admin | http://localhost:15672 | admin / localrabbitpass |
| MinIO Console | http://localhost:9001 | admin / localminiopass |
| PostgreSQL | localhost:5432 | sprocketbot / localdevpassword |
| Redis | localhost:6379 | localredispass |

## Common Tasks

### View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f core

# Last 100 lines
docker-compose logs --tail=100 core
```

### Restart a Service
```bash
# Without rebuilding
docker-compose restart core

# With rebuild (after code changes)
docker-compose up --build -d core
```

### Database Operations

#### Access PostgreSQL
```bash
# Via docker
docker-compose exec postgres psql -U sprocketbot

# Or from host (requires psql installed)
psql -h localhost -p 5432 -U sprocketbot -d sprocketbot
# Password: localdevpassword
```

#### Run Migrations
```bash
docker-compose exec core npm run migration:run
```

#### Reset Database
```bash
# Warning: This deletes all data!
docker-compose down -v
docker-compose up -d postgres

# Wait for postgres to be ready, then:
docker-compose exec core npm run migration:run
```

#### Seed with Production Data
```bash
# Dump from production
./scripts/dump-prod-db.sh

# Reset and reseed
docker-compose down -v
docker-compose up -d
```

### Testing Your Changes

#### GraphQL Playground
Open http://localhost:3001/graphql in your browser for an interactive query interface.

#### cURL Examples
```bash
# Simple query
curl http://localhost:3001/graphql \
  -H 'Content-Type: application/json' \
  -d '{"query": "{ __typename }"}'

# With variables
curl http://localhost:3001/graphql \
  -H 'Content-Type: application/json' \
  -d '{
    "query": "mutation($input: YourInput!) { yourMutation(input: $input) { id } }",
    "variables": {"input": {"field": "value"}}
  }'
```

## Troubleshooting

### Services Won't Start
```bash
# Check service status
docker-compose ps

# Check service logs
docker-compose logs [service]

# Restart everything fresh
docker-compose down -v
./scripts/setup-local.sh --fresh
```

### Database Connection Errors
```bash
# Ensure postgres is healthy
docker-compose ps postgres

# Check postgres logs
docker-compose logs postgres

# Verify .env has correct values
cat .env | grep POSTGRES_HOST
# Should show: POSTGRES_HOST=postgres (NOT localhost!)
```

### Out of Disk Space
```bash
# Remove old images and volumes
docker system prune -a --volumes

# Then rebuild
./scripts/setup-local.sh --fresh
```

### Port Already in Use
```bash
# Find what's using the port (e.g., 3001)
lsof -i :3001

# Kill the process or change the port in docker-compose.yml
```

## Hot Reload Setup (Advanced)

For even faster feedback, add volume mounts to `docker-compose.yml`:

```yaml
core:
  # ... existing config ...
  volumes:
    - ./core:/app/core
    - ./common:/app/common
    - /app/node_modules  # Prevent overwriting
  command: npm run dev --workspace=core
```

Then:
```bash
# Add a dev script to core/package.json if not present
"dev": "ts-node-dev --respawn --transpile-only src/main.ts"

# Install ts-node-dev
npm install --save-dev ts-node-dev

# Rebuild with volumes
docker-compose up --build -d core

# Now code changes trigger auto-reload (~30 seconds)
```

## Environment Variables

### Local vs Production

- **Production .env**: Contains real credentials, points to prod services
- **.env.local**: Template for local development, points to docker services
- **Auto-generated .env**: Created by setup script from .env.local

### Switching Between Environments

```bash
# Save current .env (if it has prod creds)
cp .env .env.prod

# Use local
cp .env.local .env

# Switch back to prod (for dumping DB, etc.)
cp .env.prod .env
```

## Database Seeding

### Full Dump (Schema + Data)
```bash
./scripts/dump-prod-db.sh
```

### Schema Only
```bash
./scripts/dump-prod-db.sh --schema-only
```

### Data Only
```bash
./scripts/dump-prod-db.sh --data-only
```

Dumps are saved to `scripts/db-seed/` and automatically loaded when postgres starts fresh.

## Performance Tips

1. **Selective Service Startup**: Don't start services you don't need
   ```bash
   # Just infrastructure + core
   docker-compose up -d postgres redis rabbitmq minio core
   ```

2. **Build Caching**: Docker caches layers, so rebuilds are faster after the first

3. **Volume Persistence**: Unless you use `--fresh`, data persists between restarts

4. **Resource Limits**: If slow, allocate more resources to Docker in settings

## Getting Help

- Check logs: `docker-compose logs -f [service]`
- Check this guide's Troubleshooting section
- Ask in the team Slack channel
- File an issue if you find bugs in the local setup

## Next Steps

Once you're comfortable with the local setup, consider:
- Setting up hot reload for your most-edited services
- Creating test scripts for common GraphQL operations
- Setting up a local debugger (VS Code can attach to docker containers)
