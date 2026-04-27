#!/usr/bin/env bash
#
# reset-data.sh - Reset local database to clean state
#
# Usage:
#   ./reset-data.sh           # Reset database to clean state
#   ./reset-data.sh --force   # Skip confirmation prompt
#
# This script drops and recreates the database schema, returning
# the local environment to a clean state for testing.
#
# WARNING: This will destroy all data in the local database!
#

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "${SCRIPT_DIR}/common.sh"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
FORCE_MODE=false

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --force|-f)
            FORCE_MODE=true
            shift
            ;;
        --help|-h)
            echo "Usage: $0 [--force]"
            echo ""
            echo "Reset local database to clean state"
            echo ""
            echo "Options:"
            echo "  --force, -f    Skip confirmation prompt"
            echo "  --help, -h     Show this help message"
            exit 0
            ;;
        *)
            echo -e "${RED}Unknown option: $1${NC}"
            echo "Use --help for usage information"
            exit 1
            ;;
    esac
done

# Confirmation prompt
if [ "$FORCE_MODE" = false ]; then
    echo -e "${RED}WARNING: This will destroy ALL data in the local database!${NC}"
    echo ""
    echo "Database: ${POSTGRES_DB:-sprocket}"
    echo "Host: ${POSTGRES_HOST:-localhost}:${POSTGRES_PORT:-5434}"
    echo ""
    read -p "Are you sure you want to continue? (yes/no): " confirmation
    
    if [ "$confirmation" != "yes" ]; then
        echo "Aborted."
        exit 0
    fi
fi

log_info "Starting database reset process..."

# Get database connection info from environment
load_env_file

DB_HOST="${POSTGRES_HOST:-localhost}"
DB_PORT="${POSTGRES_PORT:-5434}"
DB_NAME="${POSTGRES_DB:-sprocket}"
DB_USER="${POSTGRES_USER:-sprocketbot}"
DB_PASS="${POSTGRES_PASSWORD:-localdevpassword}"

# Check if postgres is running
check_postgres() {
    if docker-compose ps postgres 2>/dev/null | grep -q "healthy\|Up"; then
        return 0
    fi
    
    log_error "PostgreSQL is not running"
    log_info "Start it with: npm run dev:up"
    return 1
}

# Reset database
reset_database() {
    log_info "Dropping all tables..."
    
    # Use docker-compose exec if available, otherwise direct connection
    if docker-compose ps postgres >/dev/null 2>&1; then
        docker-compose exec -T postgres psql -U "$DB_USER" -d "$DB_NAME" -c \
            "DROP SCHEMA public CASCADE; CREATE SCHEMA public;" || {
            log_error "Failed to reset database via Docker"
            return 1
        }
    else
        PGPASSWORD="$DB_PASS" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c \
            "DROP SCHEMA public CASCADE; CREATE SCHEMA public;" || {
            log_error "Failed to reset database via direct connection"
            return 1
        }
    fi
    
    log_success "Database schema dropped and recreated"
}

# Verify reset
verify_reset() {
    log_info "Verifying database reset..."
    
    local table_count
    table_count=$(PGPASSWORD="$DB_PASS" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -t -c \
        "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';" 2>/dev/null | tr -d ' ')
    
    log_info "Tables in public schema: $table_count"
    
    if [ "$table_count" -eq 0 ] || [ "$table_count" -eq 1 ]; then
        log_success "Database reset verification passed"
        return 0
    else
        log_warn "Database may not be fully reset (found $table_count tables)"
        return 1
    fi
}

# Main execution
main() {
    # Check postgres
    if ! check_postgres; then
        exit 1
    fi
    
    # Reset
    reset_database || exit 1
    
    # Verify
    verify_reset
    
    log_success "Database reset completed successfully!"
    log_info ""
    log_info "Next steps:"
    log_info "  1. Seed test data: npm run dev:seed"
    log_info "  2. Run migrations: cd core && npm run migration:run"
    log_info "  3. Restart services: npm run dev:up"
}

main "$@"
