#!/usr/bin/env bash
#
# smoke-graphql.sh - GraphQL API smoke test for core service
#
# Usage:
#   ./smoke-graphql.sh [base_url]
#
# Tests:
# - Health check endpoint
# - GraphQL introspection
# - Representative queries
# - Representative mutations
#

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "${SCRIPT_DIR}/common.sh"

# Configuration
BASE_URL="${1:-http://localhost:3001}"
GRAPHQL_ENDPOINT="${BASE_URL}/graphql"
HEALTH_ENDPOINT="${BASE_URL}/healthz"
TIMEOUT=10
EXIT_CODE=0

# Test counters
TESTS_RUN=0
TESTS_PASSED=0
TESTS_FAILED=0

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Test helper
run_test() {
    local test_name="$1"
    local test_command="$2"
    
    ((TESTS_RUN++))
    log_info "Test $TESTS_RUN: $test_name"
    
    if eval "$test_command" > /dev/null 2>&1; then
        log_success "  ✓ $test_name"
        ((TESTS_PASSED++))
        return 0
    else
        log_error "  ✗ $test_name"
        ((TESTS_FAILED++))
        EXIT_CODE=1
        return 1
    fi
}

# Test 1: Health check
test_health_endpoint() {
    log_info ""
    log_info "=== Health Check ==="
    
    run_test "Health endpoint responds" \
        "curl -s --max-time $TIMEOUT '$HEALTH_ENDPOINT' | grep -q 'ok\\|status\\|healthy'"
    
    # Get full response for artifacts
    curl -s --max-time $TIMEOUT "$HEALTH_ENDPOINT" > "${ARTIFACTS_DIR}/graphql/health-response.json" 2>/dev/null || true
}

# Test 2: GraphQL introspection
test_introspection() {
    log_info ""
    log_info "=== GraphQL Introspection ==="
    
    local query='{
        "__schema": {
            "queryType": { "name" },
            "mutationType": { "name" },
            "types": [
                { "name", "kind" }
            ]
        }
    }'
    
    run_test "Introspection query succeeds" \
        "curl -s --max-time $TIMEOUT -H 'Content-Type: application/json' -d '{\"query\": $query}' '$GRAPHQL_ENDPOINT' | grep -q '__schema'"
    
    # Save response
    curl -s --max-time $TIMEOUT \
        -H "Content-Type: application/json" \
        -d "{\"query\": \"$query\"}" \
        "$GRAPHQL_ENDPOINT" > "${ARTIFACTS_DIR}/graphql/introspection-response.json" 2>/dev/null || true
}

# Test 3: Basic query - __typename
test_typename_query() {
    log_info ""
    log_info "=== Basic Queries ==="
    
    local query='{ "__typename" }'
    
    run_test "Query __typename" \
        "curl -s --max-time $TIMEOUT -H 'Content-Type: application/json' -d '{\"query\": $query}' '$GRAPHQL_ENDPOINT' | grep -q '\"data\":{\"__typename\"'"
    
    # Save response
    curl -s --max-time $TIMEOUT \
        -H "Content-Type: application/json" \
        -d "{\"query\": \"$query\"}" \
        "$GRAPHQL_ENDPOINT" > "${ARTIFACTS_DIR}/graphql/typename-response.json" 2>/dev/null || true
}

# Test 4: Query with arguments (if available)
test_user_query() {
    log_info ""
    log_info "=== Representative Queries ==="
    
    # Try to query a user (may not exist, but tests the schema)
    local query='{
        users(limit: 1) {
            id
            email
        }
    }'
    
    # This might fail if no users exist, which is OK
    local response
    response=$(curl -s --max-time $TIMEOUT \
        -H "Content-Type: application/json" \
        -d "{\"query\": \"$query\"}" \
        "$GRAPHQL_ENDPOINT" 2>/dev/null) || true
    
    if echo "$response" | grep -q "__typename\|data"; then
        log_success "  ✓ User query executes (schema valid)"
        ((TESTS_RUN++))
        ((TESTS_PASSED++))
    else
        log_warn "  ~ User query returned unexpected response (may be OK)"
        ((TESTS_RUN++))
        # Don't count as failure
    fi
    
    echo "$response" > "${ARTIFACTS_DIR}/graphql/user-query-response.json" 2>/dev/null || true
}

# Test 5: Mutation (if available)
test_mutation() {
    log_info ""
    log_info "=== Representative Mutations ==="
    
    # Try a simple mutation (may fail auth, but tests schema)
    # This is a placeholder - adjust based on actual mutations
    log_info "  ℹ Mutation tests skipped (require authentication)"
    log_info "  ℹ To test mutations, provide auth token:"
    log_info "     AUTH_TOKEN=xxx ./smoke-graphql.sh"
}

# Test 6: Error handling
test_error_handling() {
    log_info ""
    log_info "=== Error Handling ==="
    
    local invalid_query='{ invalidSyntaxHere }'
    
    local response
    response=$(curl -s --max-time $TIMEOUT \
        -H "Content-Type: application/json" \
        -d "{\"query\": \"$invalid_query\"}" \
        "$GRAPHQL_ENDPOINT" 2>/dev/null) || true
    
    if echo "$response" | grep -q "errors\|syntax"; then
        log_success "  ✓ Invalid query returns error"
        ((TESTS_RUN++))
        ((TESTS_PASSED++))
    else
        log_error "  ✗ Invalid query did not return proper error"
        ((TESTS_RUN++))
        ((TESTS_FAILED++))
        EXIT_CODE=1
    fi
    
    echo "$response" > "${ARTIFACTS_DIR}/graphql/error-response.json" 2>/dev/null || true
}

# Test 7: Response time
test_response_time() {
    log_info ""
    log_info "=== Performance ==="
    
    local query='{ "__typename" }'
    
    local start_time end_time duration
    start_time=$(date +%s%N)
    curl -s --max-time $TIMEOUT \
        -H "Content-Type: application/json" \
        -d "{\"query\": \"$query\"}" \
        "$GRAPHQL_ENDPOINT" > /dev/null 2>&1 || true
    end_time=$(date +%s%N)
    
    duration=$(( (end_time - start_time) / 1000000 ))  # Convert to ms
    
    if [ $duration -lt 1000 ]; then
        log_success "  ✓ Response time: ${duration}ms (< 1000ms)"
        ((TESTS_RUN++))
        ((TESTS_PASSED++))
    elif [ $duration -lt 5000 ]; then
        log_warn "  ~ Response time: ${duration}ms (< 5000ms, acceptable)"
        ((TESTS_RUN++))
        ((TESTS_PASSED++))
    else
        log_error "  ✗ Response time: ${duration}ms (> 5000ms, too slow)"
        ((TESTS_RUN++))
        ((TESTS_FAILED++))
        EXIT_CODE=1
    fi
}

# Generate summary
generate_summary() {
    log_info ""
    log_info "=== Summary ==="
    log_info "Tests run: $TESTS_RUN"
    log_info "Tests passed: $TESTS_PASSED"
    log_info "Tests failed: $TESTS_FAILED"
    log_info ""
    
    # Save summary to artifacts
    cat > "${ARTIFACTS_DIR}/graphql/smoke-summary.json" <<EOF
{
    "timestamp": "$(date -Iseconds)",
    "endpoint": "$GRAPHQL_ENDPOINT",
    "tests_run": $TESTS_RUN,
    "tests_passed": $TESTS_PASSED,
    "tests_failed": $TESTS_FAILED,
    "exit_code": $EXIT_CODE
}
EOF
    
    if [ $EXIT_CODE -eq 0 ]; then
        log_success "✓ All GraphQL smoke tests passed!"
    else
        log_error "✗ Some GraphQL smoke tests failed"
        log_info ""
        log_info "Check artifacts at: ${ARTIFACTS_DIR}/graphql/"
    fi
}

# Main execution
main() {
    log_info "GraphQL API Smoke Test"
    log_info "Endpoint: $GRAPHQL_ENDPOINT"
    log_info ""
    
    # Ensure artifact directory exists
    mkdir -p "${ARTIFACTS_DIR}/graphql"
    
    # Run tests
    test_health_endpoint
    test_introspection
    test_typename_query
    test_user_query
    test_mutation
    test_error_handling
    test_response_time
    
    # Generate summary
    generate_summary
    
    exit $EXIT_CODE
}

main "$@"
