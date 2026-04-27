#!/usr/bin/env bash
#
# check-drift.sh - Recurring drift detection checks
#
# Usage:
#   ./check-drift.sh [environment]
#
# Checks for:
# - Environment configuration drift
# - Dependency version drift
# - Schema drift
# - API contract drift
#

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "${SCRIPT_DIR}/common.sh"

# Configuration
ENVIRONMENT="${1:-local-dev}"
EXIT_CODE=0

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Drift counters
CHECKS_RUN=0
CHECKS_PASSED=0
CHECKS_FAILED=0
CHECKS_WARN=0

# Check environment configuration drift
check_env_drift() {
    log_info ""
    log_info "=== Environment Configuration Drift ==="
    
    ((CHECKS_RUN++))
    
    # Compare .env.local with expected values
    if [ -f ".env.local" ]; then
        local drift_found=false
        
        # Check for deprecated variables
        if grep -q "OLD_\|DEPRECATED_\|LEGACY_" ".env.local" 2>/dev/null; then
            log_warn "  ~ Found deprecated environment variables"
            drift_found=true
        fi
        
        # Check for missing required variables
        local required_vars=(
            "POSTGRES_HOST"
            "POSTGRES_PORT"
            "REDIS_HOST"
            "RABBITMQ_HOST"
            "MINIO_ENDPOINT"
        )
        
        for var in "${required_vars[@]}"; do
            if ! grep -q "^${var}=" ".env.local" 2>/dev/null; then
                log_warn "  ~ Missing required variable: $var"
                drift_found=true
            fi
        done
        
        if [ "$drift_found" = false ]; then
            log_success "  ✓ Environment configuration in sync"
            ((CHECKS_PASSED++))
        else
            ((CHECKS_WARN++))
        fi
    else
        log_warn "  ~ .env.local not found (may be OK for CI)"
        ((CHECKS_WARN++))
    fi
}

# Check dependency version drift
check_dependency_drift() {
    log_info ""
    log_info "=== Dependency Version Drift ==="
    
    ((CHECKS_RUN++))
    
    # Check if package-lock.json is in sync with package.json
    if [ -f "package.json" ] && [ -f "package-lock.json" ]; then
        # Check for uncommitted changes in lockfile
        if git diff --quiet package-lock.json 2>/dev/null; then
            log_success "  ✓ package-lock.json in sync"
            ((CHECKS_PASSED++))
        else
            log_warn "  ~ package-lock.json has uncommitted changes"
            ((CHECKS_WARN++))
        fi
        
        # Check for outdated dependencies (optional, requires npm)
        if command -v npm &> /dev/null; then
            log_info "  ℹ To check for outdated deps: npm outdated"
        fi
    else
        log_warn "  ~ package files not found"
        ((CHECKS_WARN++))
    fi
}

# Check schema drift (database)
check_schema_drift() {
    log_info ""
    log_info "=== Database Schema Drift ==="
    
    ((CHECKS_RUN++))
    
    # Check if migration files match expected state
    local migrations_dir="core/src/database/migrations"
    
    if [ -d "$migrations_dir" ]; then
        local migration_count
        migration_count=$(find "$migrations_dir" -name "*.ts" -type f 2>/dev/null | wc -l)
        
        log_info "  ℹ Found $migration_count migration files"
        
        # Check for uncommitted migration changes
        if git diff --quiet "$migrations_dir" 2>/dev/null; then
            log_success "  ✓ No uncommitted migration changes"
            ((CHECKS_PASSED++))
        else
            log_warn "  ~ Uncommitted migration changes detected"
            ((CHECKS_WARN++))
        fi
    else
        log_info "  ℹ No migrations directory found (may be OK)"
        ((CHECKS_PASSED++))
    fi
}

# Check API contract drift (OpenAPI/GraphQL schema)
check_api_drift() {
    log_info ""
    log_info "=== API Contract Drift ==="
    
    ((CHECKS_RUN++))
    
    # Check GraphQL schema
    local graphql_schema="core/src/graphql/schema.graphql"
    
    if [ -f "$graphql_schema" ]; then
        if git diff --quiet "$graphql_schema" 2>/dev/null; then
            log_success "  ✓ GraphQL schema unchanged"
            ((CHECKS_PASSED++))
        else
            log_warn "  ~ GraphQL schema has uncommitted changes"
            ((CHECKS_WARN++))
        fi
    else
        log_info "  ℹ No GraphQL schema file found (may be code-first)"
        ((CHECKS_PASSED++))
    fi
    
    # Check OpenAPI specs if they exist
    local openapi_specs
    openapi_specs=$(find . -name "openapi*.yaml" -o -name "openapi*.json" -o -name "swagger*.yaml" -o -name "swagger*.json" 2>/dev/null) || true
    
    if [ -n "$openapi_specs" ]; then
        local spec_drift=false
        for spec in $openapi_specs; do
            if ! git diff --quiet "$spec" 2>/dev/null; then
                log_warn "  ~ API spec changed: $spec"
                spec_drift=true
            fi
        done
        
        if [ "$spec_drift" = false ]; then
            log_success "  ✓ API specs unchanged"
            ((CHECKS_PASSED++))
        else
            ((CHECKS_WARN++))
        fi
    fi
}

# Check service configuration drift
check_service_drift() {
    log_info ""
    log_info "=== Service Configuration Drift ==="
    
    ((CHECKS_RUN++))
    
    # Check docker-compose.yml
    if [ -f "docker-compose.yml" ]; then
        if git diff --quiet docker-compose.yml 2>/dev/null; then
            log_success "  ✓ docker-compose.yml unchanged"
            ((CHECKS_PASSED++))
        else
            log_warn "  ~ docker-compose.yml has uncommitted changes"
            ((CHECKS_WARN++))
        fi
    else
        log_info "  ℹ No docker-compose.yml found"
        ((CHECKS_PASSED++))
    fi
    
    # Check service manifests
    local manifest="scripts/harness/service-manifest.json"
    if [ -f "$manifest" ]; then
        if git diff --quiet "$manifest" 2>/dev/null; then
            log_success "  ✓ Service manifest unchanged"
            ((CHECKS_PASSED++))
        else
            log_warn "  ~ Service manifest has uncommitted changes"
            ((CHECKS_WARN++))
        fi
    fi
}

# Check documentation drift
check_docs_drift() {
    log_info ""
    log_info "=== Documentation Drift ==="
    
    ((CHECKS_RUN++))
    
    # Check if README references match current structure
    local readme_files=("README.md" "LOCAL_DEVELOPMENT.md")
    
    for readme in "${readme_files[@]}"; do
        if [ -f "$readme" ]; then
            # Check for stale references (example: old repo paths)
            if grep -q "sprocket-infra\|old-repo-name" "$readme" 2>/dev/null; then
                log_warn "  ~ $readme contains stale references"
                ((CHECKS_WARN++))
            else
                log_success "  ✓ $readme references current"
                ((CHECKS_PASSED++))
            fi
        fi
    done
}

# Check for TODO/FIXME accumulation
check_technical_debt() {
    log_info ""
    log_info "=== Technical Debt Accumulation ==="
    
    ((CHECKS_RUN++))
    
    # Count TODOs and FIXMEs
    local todo_count
    todo_count=$(grep -r "TODO\|FIXME" --include="*.ts" --include="*.js" src/ 2>/dev/null | wc -l) || todo_count=0
    
    if [ "$todo_count" -gt 100 ]; then
        log_warn "  ~ High TODO count: $todo_count (consider addressing)"
        ((CHECKS_WARN++))
    elif [ "$todo_count" -gt 50 ]; then
        log_info "  ℹ Moderate TODO count: $todo_count"
        ((CHECKS_PASSED++))
    else
        log_success "  ✓ TODO count acceptable: $todo_count"
        ((CHECKS_PASSED++))
    fi
}

# Generate summary
generate_summary() {
    log_info ""
    log_info "=== Drift Check Summary ==="
    log_info "Checks run: $CHECKS_RUN"
    log_info "Passed: $CHECKS_PASSED"
    log_info "Warnings: $CHECKS_WARN"
    log_info "Failures: $CHECKS_FAILED"
    log_info ""
    
    # Save summary to artifacts
    mkdir -p "${ARTIFACTS_DIR}/diff"
    cat > "${ARTIFACTS_DIR}/diff/drift-summary.json" <<EOF
{
    "timestamp": "$(date -Iseconds)",
    "environment": "$ENVIRONMENT",
    "checks_run": $CHECKS_RUN,
    "checks_passed": $CHECKS_PASSED,
    "checks_warn": $CHECKS_WARN,
    "checks_failed": $CHECKS_FAILED,
    "exit_code": $EXIT_CODE
}
EOF
    
    if [ $CHECKS_FAILED -eq 0 ] && [ $CHECKS_WARN -eq 0 ]; then
        log_success "✓ No drift detected!"
    elif [ $CHECKS_FAILED -eq 0 ]; then
        log_warn "~ Drift warnings detected (review recommended)"
    else
        log_error "✗ Drift failures detected (action required)"
        EXIT_CODE=1
    fi
    
    log_info ""
    log_info "Artifacts saved to: ${ARTIFACTS_DIR}/diff/"
}

# Main execution
main() {
    log_info "Drift Detection Check"
    log_info "Environment: $ENVIRONMENT"
    log_info ""
    
    # Run checks
    check_env_drift
    check_dependency_drift
    check_schema_drift
    check_api_drift
    check_service_drift
    check_docs_drift
    check_technical_debt
    
    # Generate summary
    generate_summary
    
    exit $EXIT_CODE
}

main "$@"
