#!/bin/bash
set -e

# Database Dump Script
# This script dumps the production database to a local SQL file for seeding your local environment
# Usage: ./scripts/dump-prod-db.sh [--schema-only] [--data-only]

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
DUMP_DIR="$SCRIPT_DIR/db-seed"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}=== Production Database Dump ===${NC}"

# Load production credentials from .env
if [ ! -f "$PROJECT_ROOT/.env" ]; then
    echo -e "${RED}Error: .env file not found at $PROJECT_ROOT/.env${NC}"
    echo "Please ensure your .env file exists with POSTGRES_* variables"
    exit 1
fi

# Source the .env file
set -a
source "$PROJECT_ROOT/.env"
set +a

# Validate required variables
if [ -z "$POSTGRES_HOST" ] || [ -z "$POSTGRES_USERNAME" ] || [ -z "$POSTGRES_PASSWORD" ]; then
    echo -e "${RED}Error: Missing required POSTGRES_* environment variables${NC}"
    echo "Required: POSTGRES_HOST, POSTGRES_USERNAME, POSTGRES_PASSWORD, POSTGRES_DATABASE"
    exit 1
fi

PROD_HOST="${POSTGRES_HOST}"
PROD_PORT="${POSTGRES_PORT:-5432}"
PROD_USER="${POSTGRES_USERNAME}"
PROD_DB="${POSTGRES_DATABASE}"
PROD_PASS="${POSTGRES_PASSWORD}"

# Parse arguments
SCHEMA_ONLY=false
DATA_ONLY=false
while [[ $# -gt 0 ]]; do
    case $1 in
        --schema-only)
            SCHEMA_ONLY=true
            shift
            ;;
        --data-only)
            DATA_ONLY=true
            shift
            ;;
        *)
            echo -e "${RED}Unknown option: $1${NC}"
            exit 1
            ;;
    esac
done

# Create dump directory if it doesn't exist
mkdir -p "$DUMP_DIR"

# Determine dump type
DUMP_TYPE="full"
DUMP_ARGS=""
if [ "$SCHEMA_ONLY" = true ]; then
    DUMP_TYPE="schema"
    DUMP_ARGS="--schema-only"
elif [ "$DATA_ONLY" = true ]; then
    DUMP_TYPE="data"
    DUMP_ARGS="--data-only"
fi

OUTPUT_FILE="$DUMP_DIR/prod_dump_${DUMP_TYPE}_${TIMESTAMP}.sql"

echo -e "${YELLOW}Dumping from:${NC}"
echo "  Host: $PROD_HOST"
echo "  Port: $PROD_PORT"
echo "  Database: $PROD_DB"
echo "  User: $PROD_USER"
echo "  Type: $DUMP_TYPE"
echo ""

# Perform the dump
echo -e "${GREEN}Starting dump...${NC}"
PGPASSWORD="$PROD_PASS" pg_dump \
    -h "$PROD_HOST" \
    -p "$PROD_PORT" \
    -U "$PROD_USER" \
    -d "$PROD_DB" \
    $DUMP_ARGS \
    --no-owner \
    --no-acl \
    -f "$OUTPUT_FILE"

# Create a symlink to the latest dump for easy access
LATEST_LINK="$DUMP_DIR/latest_${DUMP_TYPE}.sql"
ln -sf "$(basename "$OUTPUT_FILE")" "$LATEST_LINK"

# Create init script that postgres container will run
INIT_SCRIPT="$DUMP_DIR/01-restore-dump.sh"
cat > "$INIT_SCRIPT" << 'INIT_EOF'
#!/bin/bash
set -e

# This script runs automatically when postgres container starts for the first time
# It restores the latest dump if it exists

ROLES_FILE="/docker-entrypoint-initdb.d/00_create_roles.sql"
SCHEMA_FILE="/docker-entrypoint-initdb.d/01_schema.sql"
DATA_FILE="/docker-entrypoint-initdb.d/02_data.sql"

if [ -f "$ROLES_FILE" ]; then
    echo "Creating roles from: $ROLES_FILE"
    psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" -f "$ROLES_FILE"
    echo "Roles created successfully!"
fi

if [ -f "$SCHEMA_FILE" ]; then
    echo "Restoring schema from: $SCHEMA_FILE"
    psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" -f "$SCHEMA_FILE"
    echo "Schema restored successfully!"
fi

if [ -f "$DATA_FILE" ]; then
    echo "Restoring data from: $DATA_FILE"
    psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" -f "$DATA_FILE"
    echo "Data restored successfully!"
else
    echo "No data file found, starting with empty database"
fi
INIT_EOF

chmod +x "$INIT_SCRIPT"

echo ""
echo -e "${GREEN}✓ Dump completed successfully!${NC}"
echo ""
echo "Output file: $OUTPUT_FILE"
echo "Symlink created: $LATEST_LINK"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo "1. Review the dump file to ensure it contains what you need"
echo "2. Run './scripts/setup-local.sh' to start your local environment"
echo "   OR manually run: docker-compose down -v && docker-compose up -d"
echo ""
echo -e "${YELLOW}Note:${NC} The postgres container will automatically restore this dump on first startup"
echo "      To re-seed, delete the postgres_data volume with: docker-compose down -v"
