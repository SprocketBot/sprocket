# Scripts Directory

Utility scripts for local development and database management.

## Available Scripts

### setup-local.sh
Complete local development environment setup script.

**Usage:**
```bash
# First time setup with production data
./scripts/setup-local.sh --fresh --seed-db

# Fresh start without seeding
./scripts/setup-local.sh --fresh

# Regular startup (keeps existing data)
./scripts/setup-local.sh
```

**Options:**
- `--fresh`: Tear down existing containers and volumes (clean slate)
- `--seed-db`: Dump and seed database from production
- `--skip-build`: Skip Docker image building
- `--help`: Show help message

**What it does:**
1. Checks prerequisites (docker, docker-compose)
2. Sets up .env file from .env.local
3. Optionally dumps production database
4. Optionally tears down existing containers
5. Builds Docker images
6. Starts all services
7. Runs database migrations

### dump-prod-db.sh
Dumps the production database to a local SQL file.

**Usage:**
```bash
# Full dump (schema + data)
./scripts/dump-prod-db.sh

# Schema only
./scripts/dump-prod-db.sh --schema-only

# Data only
./scripts/dump-prod-db.sh --data-only
```

**What it does:**
1. Reads production credentials from .env
2. Dumps database using pg_dump
3. Saves to `scripts/db-seed/prod_dump_<type>_<timestamp>.sql`
4. Creates symlink to `scripts/db-seed/latest_<type>.sql`
5. Creates init script for postgres container auto-restore

**Output:**
- Dump files in `scripts/db-seed/`
- Latest symlink for easy access
- Auto-restore script for postgres container

## Directory Structure

```
scripts/
├── README.md              # This file
├── setup-local.sh         # Main setup script
├── dump-prod-db.sh        # Database dump script
└── db-seed/               # Database dumps (gitignored)
    ├── prod_dump_full_*.sql      # Full dumps
    ├── latest_full.sql            # Symlink to latest full dump
    └── 01-restore-dump.sh         # Auto-restore script (generated)
```

## Workflow Examples

### Initial Setup
```bash
# 1. Dump production DB
./scripts/dump-prod-db.sh

# 2. Setup local environment
./scripts/setup-local.sh --fresh --seed-db

# 3. Start coding!
```

### Daily Development
```bash
# Start services
docker-compose up -d

# Make changes, then rebuild
docker-compose up --build -d core

# Test
curl http://localhost:3001/graphql
```

### Reset Database
```bash
# 1. Get fresh dump
./scripts/dump-prod-db.sh

# 2. Reset and reseed
docker-compose down -v
docker-compose up -d
```

## Troubleshooting

### Script won't run
```bash
# Make sure it's executable
chmod +x ./scripts/*.sh
```

### Can't connect to production DB
```bash
# Make sure .env has production credentials
cat .env | grep POSTGRES_HOST

# Should show production host, not "postgres"
```

### Dump is too large
```bash
# Dump schema only
./scripts/dump-prod-db.sh --schema-only

# Then manually import specific tables you need
```

## Notes

- Database dumps are **gitignored** to prevent committing sensitive data
- Prod credentials should be in `.env.backup` or similar (also gitignored)
- Local credentials are in `.env.local` (committed to repo)
- Scripts assume you're running from project root
