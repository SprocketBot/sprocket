#!/bin/bash
set -e

# Local Development Setup Script
# This script sets up your complete local development environment
# Usage: ./scripts/setup-local.sh [--fresh] [--seed-db] [--skip-build]

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

# Flags
FRESH_START=false
SEED_DB=false
SKIP_BUILD=false

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --fresh)
            FRESH_START=true
            shift
            ;;
        --seed-db)
            SEED_DB=true
            shift
            ;;
        --skip-build)
            SKIP_BUILD=true
            shift
            ;;
        --help)
            echo "Usage: $0 [OPTIONS]"
            echo ""
            echo "Options:"
            echo "  --fresh      Tear down existing containers and volumes (fresh start)"
            echo "  --seed-db    Dump and seed database from production"
            echo "  --skip-build Skip docker image building"
            echo "  --help       Show this help message"
            exit 0
            ;;
        *)
            echo -e "${RED}Unknown option: $1${NC}"
            echo "Use --help for usage information"
            exit 1
            ;;
    esac
done

echo -e "${BLUE}╔═══════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  Sprocket Local Development Setup        ║${NC}"
echo -e "${BLUE}╚═══════════════════════════════════════════╝${NC}"
echo ""

cd "$PROJECT_ROOT"

# Step 1: Check prerequisites
echo -e "${GREEN}[1/7] Checking prerequisites...${NC}"
command -v docker >/dev/null 2>&1 || { echo -e "${RED}Error: docker is not installed${NC}"; exit 1; }
command -v docker-compose >/dev/null 2>&1 || { echo -e "${RED}Error: docker-compose is not installed${NC}"; exit 1; }
echo -e "  ✓ Docker installed"
echo -e "  ✓ Docker Compose installed"
echo ""

# Step 2: Setup .env file
echo -e "${GREEN}[2/7] Setting up environment variables...${NC}"
if [ ! -f .env.local ]; then
    echo -e "${RED}Error: .env.local not found${NC}"
    exit 1
fi

# Ask user if they want to backup existing .env
if [ -f .env ] && [ "$FRESH_START" = false ]; then
    echo -e "${YELLOW}Existing .env file found.${NC}"
    read -p "Backup current .env to .env.backup? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        cp .env .env.backup
        echo -e "  ✓ Backed up to .env.backup"
    fi
fi

cp .env.local .env
echo -e "  ✓ Created .env from .env.local"
echo ""

# Step 3: Database dump (if requested)
if [ "$SEED_DB" = true ]; then
    echo -e "${GREEN}[3/7] Dumping production database...${NC}"

    # We need prod credentials, so temporarily use the backup
    if [ -f .env.backup ]; then
        echo -e "${YELLOW}  Using .env.backup for prod credentials...${NC}"
        cp .env .env.local.tmp
        cp .env.backup .env
        "$SCRIPT_DIR/dump-prod-db.sh"
        cp .env.local.tmp .env
        rm .env.local.tmp
    else
        echo -e "${RED}Error: Cannot dump DB without prod credentials${NC}"
        echo -e "${YELLOW}Please run this script with production .env first, or manually run:${NC}"
        echo -e "  ./scripts/dump-prod-db.sh"
        SEED_DB=false
    fi
    echo ""
else
    echo -e "${YELLOW}[3/7] Skipping database dump (use --seed-db to enable)${NC}"
    echo ""
fi

# Step 4: Tear down existing containers (if fresh start)
if [ "$FRESH_START" = true ]; then
    echo -e "${GREEN}[4/7] Tearing down existing containers and volumes...${NC}"
    docker-compose down -v
    echo -e "  ✓ All containers and volumes removed"
    echo ""
else
    echo -e "${YELLOW}[4/7] Keeping existing containers (use --fresh for clean start)${NC}"
    echo ""
fi

# Step 5: Build images
if [ "$SKIP_BUILD" = false ]; then
    echo -e "${GREEN}[5/7] Building Docker images...${NC}"
    echo -e "${YELLOW}  This may take 5-10 minutes on first run...${NC}"
    docker-compose build
    echo -e "  ✓ Images built successfully"
    echo ""
else
    echo -e "${YELLOW}[5/7] Skipping image build (--skip-build enabled)${NC}"
    echo ""
fi

# Step 6: Start services
echo -e "${GREEN}[6/7] Starting services...${NC}"
echo -e "${YELLOW}  Starting infrastructure services first...${NC}"

# Start infrastructure services
docker-compose up -d postgres redis rabbitmq minio

echo -e "${YELLOW}  Waiting for services to be healthy...${NC}"
sleep 10

# Check health
RETRIES=30
for i in $(seq 1 $RETRIES); do
    if docker-compose ps | grep -q "unhealthy"; then
        echo -e "  Waiting for services... ($i/$RETRIES)"
        sleep 2
    else
        break
    fi
done

echo -e "${YELLOW}  Starting application services...${NC}"
docker-compose up -d

echo -e "  ✓ All services started"
echo ""

# Step 7: Run migrations
echo -e "${GREEN}[7/7] Running database migrations...${NC}"
sleep 5  # Give core a moment to start
docker-compose exec -T core npm run migration:run || {
    echo -e "${YELLOW}  Note: Migrations may have already run or service not ready yet${NC}"
    echo -e "${YELLOW}  You can manually run: docker-compose exec core npm run migration:run${NC}"
}
echo ""

# Final status
echo -e "${BLUE}╔═══════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  Setup Complete! 🚀                       ║${NC}"
echo -e "${BLUE}╚═══════════════════════════════════════════╝${NC}"
echo ""
echo -e "${GREEN}Services running:${NC}"
echo "  - Core API:        http://localhost:3001"
echo "  - GraphQL:         http://localhost:3001/graphql"
echo "  - Web Client:      http://localhost:8080"
echo "  - Image Gen UI:    http://localhost:8081"
echo "  - RabbitMQ Admin:  http://localhost:15672 (admin/localrabbitpass)"
echo "  - MinIO Console:   http://localhost:9001 (admin/localminiopass)"
echo ""
echo -e "${GREEN}Useful commands:${NC}"
echo "  View logs:           docker-compose logs -f [service]"
echo "  Restart service:     docker-compose restart [service]"
echo "  Rebuild service:     docker-compose up --build -d [service]"
echo "  Run migrations:      docker-compose exec core npm run migration:run"
echo "  Access DB:           docker-compose exec postgres psql -U sprocketbot"
echo "  Stop all:            docker-compose down"
echo ""
echo -e "${GREEN}Test your setup:${NC}"
echo "  curl http://localhost:3001/graphql -H 'Content-Type: application/json' -d '{\"query\":\"{__typename}\"}'"
echo ""
echo -e "${YELLOW}Your feedback loop is now:${NC}"
echo "  1. Edit code"
echo "  2. docker-compose up --build -d core  (~2-3 min)"
echo "  3. Test via GraphQL"
echo ""
echo -e "${BLUE}Happy coding! 🎉${NC}"
