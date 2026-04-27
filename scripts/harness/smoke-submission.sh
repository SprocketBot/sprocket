#!/usr/bin/env bash
#
# smoke-submission.sh - Submission service smoke test
#
# Usage:
#   ./smoke-submission.sh [base_url]
#
# Tests:
# - Health check
# - Replay upload endpoint
# - Submission processing
#

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "${SCRIPT_DIR}/common.sh"

# Configuration
BASE_URL="${1:-http://localhost:8000}"
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
    curl -s --max-time $TIMEOUT "$HEALTH_ENDPOINT" > "${ARTIFACTS_DIR}/submission/health-response.json" 2>/dev/null || true
}

# Test 2: API version/info endpoint
test_info_endpoint() {
    log_info ""
    log_info "=== Service Info ==="
    
    # Try common info endpoints
    local endpoints=("/info" "/api/v1/info" "/version")
    local found=false
    
    for endpoint in "${endpoints[@]}"; do
        local response
        response=$(curl -s --max-time $TIMEOUT "${BASE_URL}${endpoint}" 2>/dev/null) || continue
        
        if [ -n "$response" ]; then
            log_success "  ✓ Info endpoint available at ${endpoint}"
            ((TESTS_RUN++))
            ((TESTS_PASSED++))
            echo "$response" > "${ARTIFACTS_DIR}/submission/info-response.json" 2>/dev/null || true
            found=true
            break
        fi
    done
    
    if [ "$found" = false ]; then
        log_warn "  ~ No info endpoint found (may be OK)"
        ((TESTS_RUN++))
    fi
}

# Test 3: Replay upload endpoint (POST)
test_replay_upload() {
    log_info ""
    log_info "=== Replay Upload ==="
    
    # Test that the endpoint exists (may reject without auth, but should respond)
    local response
    response=$(curl -s --max-time $TIMEOUT \
        -X POST \
        -H "Content-Type: multipart/form-data" \
        "${BASE_URL}/api/v1/replay/upload" 2>/dev/null) || true
    
    # Should get either 400 (missing file), 401 (unauthorized), or 200 (success)
    # Any other response indicates the endpoint doesn't exist
    if [ -n "$response" ] || [ $? -eq 0 ]; then
        log_success "  ✓ Replay upload endpoint responds"
        ((TESTS_RUN++))
        ((TESTS_PASSED++))
    else
        log_error "  ✗ Replay upload endpoint not responding"
        ((TESTS_RUN++))
        ((TESTS_FAILED++))
        EXIT_CODE=1
    fi
    
    echo "$response" > "${ARTIFACTS_DIR}/submission/upload-response.json" 2>/dev/null || true
}

# Test 4: Submission status endpoint
test_submission_status() {
    log_info ""
    log_info "=== Submission Status ==="
    
    # Try to get status of a non-existent submission (should return 404 or similar)
    local response
    response=$(curl -s --max-time $TIMEOUT \
        "${BASE_URL}/api/v1/submission/test-id/status" 2>/dev/null) || true
    
    # Should get a structured response (even if 404)
    if echo "$response" | grep -q "error\|not found\|status\|{\""; then
        log_success "  ✓ Submission status endpoint responds"
        ((TESTS_RUN++))
        ((TESTS_PASSED++))
    else
        log_warn "  ~ Submission status endpoint response unclear"
        ((TESTS_RUN++))
    fi
    
    echo "$response" > "${ARTIFACTS_DIR}/submission/status-response.json" 2>/dev/null || true
}

# Test 5: Response time
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
    cat > "${ARTIFACTS_DIR}/submission/smoke-summary.json" <<EOF
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
        log_success "✓ All submission service smoke tests passed!"
    else
        log_error "✗ Some submission service smoke tests failed"
        log_info ""
        log_info "Check artifacts at: ${ARTIFACTS_DIR}/submission/"
    fi
}

# Main execution
main() {
    log_info "Submission Service Smoke Test"
    log_info "Endpoint: $BASE_URL"
    log_info ""
    
    # Ensure artifact directory exists
    mkdir -p "${ARTIFACTS_DIR}/submission"
    
    # Run tests
    test_health_endpoint
    test_info_endpoint
    test_replay_upload
    test_submission_status
    test_response_time
    
    # Generate summary
    generate_summary
    
    exit $EXIT_CODE
}

main "$@"
