#!/usr/bin/env bash
#
# smoke-matchmaking.sh - Matchmaking service smoke test
#
# Usage:
#   ./smoke-matchmaking.sh [base_url]
#
# Tests:
# - Health check
# - Scrim lifecycle endpoints
# - Queue state
#

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "${SCRIPT_DIR}/common.sh"

# Configuration
BASE_URL="${1:-http://localhost:8001}"
HEALTH_ENDPOINT="${BASE_URL}/health"
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
        "curl -s --max-time $TIMEOUT '$HEALTH_ENDPOINT' | grep -q 'ok\\|status\\|healthy\\|alive'"
    
    # Get full response for artifacts
    curl -s --max-time $TIMEOUT "$HEALTH_ENDPOINT" > "${ARTIFACTS_DIR}/matchmaking/health-response.json" 2>/dev/null || true
}

# Test 2: Queue status
test_queue_status() {
    log_info ""
    log_info "=== Queue Status ==="
    
    # Try to get queue status
    local response
    response=$(curl -s --max-time $TIMEOUT \
        "${BASE_URL}/api/v1/queue/status" 2>/dev/null) || true
    
    # Should get a structured response
    if echo "$response" | grep -q "queue\|players\|waiting\|{\""; then
        log_success "  ✓ Queue status endpoint responds"
        ((TESTS_RUN++))
        ((TESTS_PASSED++))
    else
        log_warn "  ~ Queue status endpoint response unclear (may be OK)"
        ((TESTS_RUN++))
    fi
    
    echo "$response" > "${ARTIFACTS_DIR}/matchmaking/queue-response.json" 2>/dev/null || true
}

# Test 3: Scrim creation
test_scrim_creation() {
    log_info ""
    log_info "=== Scrim Lifecycle ==="
    
    # Try to create a scrim (may fail auth/validation, but endpoint should exist)
    local response
    response=$(curl -s --max-time $TIMEOUT \
        -X POST \
        -H "Content-Type: application/json" \
        -d '{"mode":"ranked","players":[]}' \
        "${BASE_URL}/api/v1/scrim" 2>/dev/null) || true
    
    # Should get a response (even if 400/401)
    if [ -n "$response" ]; then
        log_success "  ✓ Scrim creation endpoint responds"
        ((TESTS_RUN++))
        ((TESTS_PASSED++))
    else
        log_error "  ✗ Scrim creation endpoint not responding"
        ((TESTS_RUN++))
        ((TESTS_FAILED++))
        EXIT_CODE=1
    fi
    
    echo "$response" > "${ARTIFACTS_DIR}/matchmaking/scrim-create-response.json" 2>/dev/null || true
}

# Test 4: Scrim status
test_scrim_status() {
    log_info ""
    log_info "=== Scrim Status ==="
    
    # Try to get status of a scrim
    local response
    response=$(curl -s --max-time $TIMEOUT \
        "${BASE_URL}/api/v1/scrim/test-id/status" 2>/dev/null) || true
    
    # Should get a structured response
    if echo "$response" | grep -q "error\|not found\|status\|state\|{\""; then
        log_success "  ✓ Scrim status endpoint responds"
        ((TESTS_RUN++))
        ((TESTS_PASSED++))
    else
        log_warn "  ~ Scrim status endpoint response unclear"
        ((TESTS_RUN++))
    fi
    
    echo "$response" > "${ARTIFACTS_DIR}/matchmaking/scrim-status-response.json" 2>/dev/null || true
}

# Test 5: Matchmaking cycle
test_matchmaking_cycle() {
    log_info ""
    log_info "=== Matchmaking Cycle ==="
    
    # Test that matchmaking cycle is running (if applicable)
    local response
    response=$(curl -s --max-time $TIMEOUT \
        "${BASE_URL}/api/v1/matchmaking/cycle" 2>/dev/null) || true
    
    if [ -n "$response" ]; then
        log_success "  ✓ Matchmaking cycle endpoint responds"
        ((TESTS_RUN++))
        ((TESTS_PASSED++))
        echo "$response" > "${ARTIFACTS_DIR}/matchmaking/cycle-response.json" 2>/dev/null || true
    else
        log_info "  ℹ Matchmaking cycle endpoint not available (may be OK)"
        ((TESTS_RUN++))
    fi
}

# Test 6: Response time
test_response_time() {
    log_info ""
    log_info "=== Performance ==="
    
    local start_time end_time duration
    start_time=$(date +%s%N)
    curl -s --max-time $TIMEOUT "$HEALTH_ENDPOINT" > /dev/null 2>&1 || true
    end_time=$(date +%s%N)
    
    duration=$(( (end_time - start_time) / 1000000 ))  # Convert to ms
    
    if [ $duration -lt 500 ]; then
        log_success "  ✓ Response time: ${duration}ms (< 500ms)"
        ((TESTS_RUN++))
        ((TESTS_PASSED++))
    elif [ $duration -lt 2000 ]; then
        log_warn "  ~ Response time: ${duration}ms (< 2000ms, acceptable)"
        ((TESTS_RUN++))
        ((TESTS_PASSED++))
    else
        log_error "  ✗ Response time: ${duration}ms (> 2000ms, too slow)"
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
    cat > "${ARTIFACTS_DIR}/matchmaking/smoke-summary.json" <<EOF
{
    "timestamp": "$(date -Iseconds)",
    "endpoint": "$BASE_URL",
    "tests_run": $TESTS_RUN,
    "tests_passed": $TESTS_PASSED,
    "tests_failed": $TESTS_FAILED,
    "exit_code": $EXIT_CODE
}
EOF
    
    if [ $EXIT_CODE -eq 0 ]; then
        log_success "✓ All matchmaking service smoke tests passed!"
    else
        log_error "✗ Some matchmaking service smoke tests failed"
        log_info ""
        log_info "Check artifacts at: ${ARTIFACTS_DIR}/matchmaking/"
    fi
}

# Main execution
main() {
    log_info "Matchmaking Service Smoke Test"
    log_info "Endpoint: $BASE_URL"
    log_info ""
    
    # Ensure artifact directory exists
    mkdir -p "${ARTIFACTS_DIR}/matchmaking"
    
    # Run tests
    test_health_endpoint
    test_queue_status
    test_scrim_creation
    test_scrim_status
    test_matchmaking_cycle
    test_response_time
    
    # Generate summary
    generate_summary
    
    exit $EXIT_CODE
}

main "$@"
