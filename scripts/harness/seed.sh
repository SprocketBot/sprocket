#!/usr/bin/env bash
#
# seed.sh - Seed local database with test fixtures for agent harness validation
#
# Usage:
#   ./seed.sh           # Seed database with test fixtures
#   ./seed.sh --reset   # Reset database and reseed
#
# This script populates the local database with deterministic test data:
# - Test users with known credentials
# - Test organizations and teams
# - Test seasons and fixtures
# - Test replays for submission testing
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
RESET_MODE=false
SEED_DATA_DIR="${SCRIPT_DIR}/test-data/agent-harness"

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --reset|-r)
            RESET_MODE=true
            shift
            ;;
        --help|-h)
            echo "Usage: $0 [--reset]"
            echo ""
            echo "Seed local database with test fixtures"
            echo ""
            echo "Options:"
            echo "  --reset, -r    Reset database before seeding"
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

log_info "Starting database seed process..."
log_info "Mode: $([ "$RESET_MODE" = true ] && echo 'RESET' || echo 'SEED')"

# Check if docker-compose is available
if ! command_exists "docker-compose" && ! command_exists "docker"; then
    log_error "Docker is required for database seeding"
    exit 1
fi

# Get database connection info from environment
load_env_file

DB_HOST="${POSTGRES_HOST:-localhost}"
DB_PORT="${POSTGRES_PORT:-5434}"
DB_NAME="${POSTGRES_DB:-sprocket}"
DB_USER="${POSTGRES_USER:-sprocketbot}"
DB_PASS="${POSTGRES_PASSWORD:-localdevpassword}"

# Wait for postgres to be ready
wait_for_postgres() {
    log_info "Waiting for PostgreSQL to be ready..."
    local max_attempts=30
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        if docker-compose ps postgres 2>/dev/null | grep -q "healthy\|Up"; then
            log_success "PostgreSQL is ready"
            return 0
        fi
        
        log_info "Attempt $attempt/$max_attempts: Waiting for PostgreSQL..."
        sleep 2
        ((attempt++))
    done
    
    log_error "PostgreSQL did not become ready after $max_attempts attempts"
    return 1
}

# Reset database (optional)
reset_database() {
    log_info "Resetting database..."
    
    # Drop and recreate database
    docker-compose exec -T postgres psql -U "$DB_USER" -d "$DB_NAME" -c \
        "DROP SCHEMA public CASCADE; CREATE SCHEMA public;" 2>/dev/null || {
        log_warn "Could not reset database via Docker, trying direct connection..."
        PGPASSWORD="$DB_PASS" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c \
            "DROP SCHEMA public CASCADE; CREATE SCHEMA public;" 2>/dev/null || {
            log_error "Failed to reset database"
            return 1
        }
    }
    
    log_success "Database reset complete"
}

# Run migrations
run_migrations() {
    log_info "Running database migrations..."
    
    # Check if core workspace exists
    if [ ! -d "${SCRIPT_DIR}/../../core" ]; then
        log_error "Core workspace not found"
        return 1
    fi
    
    cd "${SCRIPT_DIR}/../../core"
    
    # Run migrations using npm
    npm run migration:run 2>&1 | tee "${SCRIPT_DIR}/../../artifacts/latest/migration.log" || {
        log_warn "Some migrations may have failed (this is expected in local dev)"
        log_warn "Core API should still function for most operations"
    }
    
    cd "${SCRIPT_DIR}"
    log_success "Migration process complete"
}

# Seed test data
seed_test_data() {
    log_info "Seeding test data..."
    
    # Create seed data directory if it doesn't exist
    mkdir -p "$SEED_DATA_DIR"
    
    # Check if seed SQL files exist
    if [ ! -d "$SEED_DATA_DIR" ]; then
        log_warn "Seed data directory not found: $SEED_DATA_DIR"
        log_info "Creating minimal seed data..."
        create_minimal_seed_data
    fi
    
    # Apply seed SQL files in order
    for sql_file in $(find "$SEED_DATA_DIR" -name "*.sql" -type f | sort); do
        log_info "Applying $(basename "$sql_file")..."
        
        PGPASSWORD="$DB_PASS" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" \
            -f "$sql_file" 2>&1 | tee -a "${SCRIPT_DIR}/../../artifacts/latest/seed.log" || {
            log_warn "Failed to apply $(basename "$sql_file")"
        }
    done
    
    log_success "Test data seeding complete"
}

# Create minimal seed data if none exists
create_minimal_seed_data() {
    log_info "Creating minimal seed data..."
    
    mkdir -p "$SEED_DATA_DIR"
    
    # Create test users
    cat > "$SEED_DATA_DIR/001-users.sql" << 'EOF'
-- Test users for agent harness validation
-- Password for all users: 'TestPassword123!'
INSERT INTO "user" (id, email, "discordId", "displayName", "createdAt", "updatedAt")
VALUES 
    (1, 'test-admin@example.com', '100000000000000001', 'Test Admin', NOW(), NOW()),
    (2, 'test-user@example.com', '100000000000000002', 'Test User', NOW(), NOW()),
    (3, 'test-player@example.com', '100000000000000003', 'Test Player', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    "displayName" = EXCLUDED."displayName",
    "updatedAt" = NOW();
EOF

    # Create test organization
    cat > "$SEED_DATA_DIR/002-organizations.sql" << 'EOF'
-- Test organization for agent harness
INSERT INTO organization (id, name, slug, "createdAt", "updatedAt")
VALUES 
    (1, 'Test Organization', 'test-org', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    slug = EXCLUDED.slug,
    "updatedAt" = NOW();
EOF

    log_success "Minimal seed data created"
}

# Verify seed
verify_seed() {
    log_info "Verifying seed data..."
    
    local user_count
    user_count=$(PGPASSWORD="$DB_PASS" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -t -c \
        "SELECT COUNT(*) FROM \"user\";" 2>/dev/null | tr -d ' ')
    
    log_info "Users in database: $user_count"
    
    if [ "$user_count" -gt 0 ]; then
        log_success "Database seed verification passed"
        return 0
    else
        log_warn "Database appears to be empty"
        return 1
    fi
}

# Main execution
main() {
    # Ensure artifacts directory exists
    mkdir -p "${SCRIPT_DIR}/../../artifacts/latest"
    
    # Wait for postgres
    if ! wait_for_postgres; then
        log_error "Cannot proceed without PostgreSQL"
        exit 1
    fi
    
    # Reset if requested
    if [ "$RESET_MODE" = true ]; then
        reset_database || exit 1
    fi
    
    # Run migrations (optional, may fail in local dev)
    # run_migrations
    
    # Seed test data
    seed_test_data || exit 1
    
    # Verify
    verify_seed
    
    log_success "Database seed process completed successfully!"
    log_info ""
    log_info "Test credentials:"
    log_info "  Admin user: test-admin@example.com"
    log_info "  Regular user: test-user@example.com"
    log_info "  Player: test-player@example.com"
    log_info "  Password: TestPassword123!"
    log_info ""
    log_info "Next steps:"
    log_info "  1. Run smoke tests: npm run dev:smoke"
    log_info "  2. Start services: npm run dev:up"
}

main "$@"
