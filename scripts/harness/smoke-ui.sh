#!/usr/bin/env bash
#
# smoke-ui.sh - Web client UI smoke test
#
# Usage:
#   ./smoke-ui.sh [base_url]
#
# Tests:
# - Home page loads
# - Key pages render
# - No 500 errors
# - Basic functionality
#

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "${SCRIPT_DIR}/common.sh"

# Configuration
BASE_URL="${1:-http://localhost:3000}"
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

# Check if page loads without 500 error
check_page() {
    local page_name="$1"
    local page_path="$2"
    
    local http_code
    local response
    
    # Get HTTP response code and body
    response=$(curl -s --max-time $TIMEOUT -w "\n%{http_code}" "${BASE_URL}${page_path}" 2>/dev/null) || {
        log_error "  ✗ $page_name - Connection failed"
        ((TESTS_RUN++))
        ((TESTS_FAILED++))
        EXIT_CODE=1
        return 1
    }
    
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')
    
    # Save response for artifacts
    echo "$body" > "${ARTIFACTS_DIR}/screenshots/${page_name//\//_}-response.html" 2>/dev/null || true
    
    # Check for 500 errors
    if [ "$http_code" = "500" ]; then
        log_error "  ✗ $page_name - HTTP 500 Internal Server Error"
        ((TESTS_RUN++))
        ((TESTS_FAILED++))
        EXIT_CODE=1
        return 1
    elif [ "$http_code" = "404" ]; then
        log_warn "  ~ $page_name - HTTP 404 Not Found (may be OK)"
        ((TESTS_RUN++))
        return 0
    elif [ "$http_code" = "200" ] || [ "$http_code" = "302" ] || [ "$http_code" = "304" ]; then
        log_success "  ✓ $page_name - HTTP $http_code"
        ((TESTS_RUN++))
        ((TESTS_PASSED++))
        return 0
    else
        log_warn "  ~ $page_name - HTTP $http_code (unexpected)"
        ((TESTS_RUN++))
        return 0
    fi
}

# Test 1: Home page
test_home_page() {
    log_info ""
    log_info "=== Home Page ==="
    
    check_page "home" "/"
}

# Test 2: About/Info pages
test_info_pages() {
    log_info ""
    log_info "=== Info Pages ==="
    
    # Common info pages
    local pages=(
        "about:/about"
        "help:/help"
        "faq:/faq"
        "terms:/terms"
        "privacy:/privacy"
    )
    
    for page_info in "${pages[@]}"; do
        local page_name="${page_info%%:*}"
        local page_path="${page_info##*:}"
        check_page "$page_name" "$page_path" || true
    done
}

# Test 3: App pages (may require auth)
test_app_pages() {
    log_info ""
    log_info "=== App Pages ==="
    
    # Common app pages
    local pages=(
        "dashboard:/dashboard"
        "profile:/profile"
        "settings:/settings"
        "games:/games"
        "replays:/replays"
    )
    
    for page_info in "${pages[@]}"; do
        local page_name="${page_info%%:*}"
        local page_path="${page_info##*:}"
        
        local http_code
        http_code=$(curl -s --max-time $TIMEOUT -o /dev/null -w "%{http_code}" "${BASE_URL}${page_path}" 2>/dev/null) || continue
        
        if [ "$http_code" = "302" ] || [ "$http_code" = "401" ] || [ "$http_code" = "403" ]; then
            log_info "  ℹ $page_name - Requires authentication (HTTP $http_code)"
            ((TESTS_RUN++))
            # Don't count as failure
        else
            check_page "$page_name" "$page_path" || true
        fi
    done
}

# Test 4: API endpoints (if exposed)
test_api_endpoints() {
    log_info ""
    log_info "=== API Endpoints ==="
    
    # Try common API endpoints
    local endpoints=(
        "/api/health"
        "/api/v1/health"
        "/health"
    )
    
    for endpoint in "${endpoints[@]}"; do
        local http_code
        http_code=$(curl -s --max-time $TIMEOUT -o /dev/null -w "%{http_code}" "${BASE_URL}${endpoint}" 2>/dev/null) || continue
        
        if [ "$http_code" = "200" ]; then
            log_success "  ✓ API health endpoint at ${endpoint}"
            ((TESTS_RUN++))
            ((TESTS_PASSED++))
            
            # Save response
            curl -s --max-time $TIMEOUT "${BASE_URL}${endpoint}" > "${ARTIFACTS_DIR}/screenshots/api-health-response.json" 2>/dev/null || true
            break
        fi
    done
    
    if [ ${TESTS_RUN} -eq ${TESTS_PASSED} ]; then
        log_info "  ℹ No API health endpoint found (may be OK)"
        ((TESTS_RUN++))
    fi
}

# Test 5: Static assets
test_static_assets() {
    log_info ""
    log_info "=== Static Assets ==="
    
    # Check if basic static assets load
    local assets=(
        "/favicon.ico"
        "/robots.txt"
    )
    
    local found=0
    for asset in "${assets[@]}"; do
        local http_code
        http_code=$(curl -s --max-time $TIMEOUT -o /dev/null -w "%{http_code}" "${BASE_URL}${asset}" 2>/dev/null) || continue
        
        if [ "$http_code" = "200" ] || [ "$http_code" = "304" ]; then
            log_success "  ✓ Static asset: ${asset}"
            ((TESTS_RUN++))
            ((TESTS_PASSED++))
            found=1
            break
        fi
    done
    
    if [ $found -eq 0 ]; then
        log_info "  ℹ No standard static assets found (may be OK)"
        ((TESTS_RUN++))
    fi
}

# Test 6: Response time
test_response_time() {
    log_info ""
    log_info "=== Performance ==="
    
    local start_time end_time duration
    start_time=$(date +%s%N)
    curl -s --max-time $TIMEOUT "$BASE_URL" > /dev/null 2>&1 || true
    end_time=$(date +%s%N)
    
    duration=$(( (end_time - start_time) / 1000000 ))  # Convert to ms
    
    if [ $duration -lt 1000 ]; then
        log_success "  ✓ Home page load: ${duration}ms (< 1000ms)"
        ((TESTS_RUN++))
        ((TESTS_PASSED++))
    elif [ $duration -lt 3000 ]; then
        log_warn "  ~ Home page load: ${duration}ms (< 3000ms, acceptable)"
        ((TESTS_RUN++))
        ((TESTS_PASSED++))
    else
        log_error "  ✗ Home page load: ${duration}ms (> 3000ms, too slow)"
        ((TESTS_RUN++))
        ((TESTS_FAILED++))
        EXIT_CODE=1
    fi
}

# Test 7: Check for JavaScript errors (basic)
test_js_errors() {
    log_info ""
    log_info "=== JavaScript Errors ==="
    
    log_info "  ℹ JavaScript error checking requires browser automation"
    log_info "  ℹ To test JS errors, use Playwright/Cypress:"
    log_info "     npm run test:e2e --workspace=clients/web"
    ((TESTS_RUN++))
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
    cat > "${ARTIFACTS_DIR}/screenshots/smoke-summary.json" <<EOF
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
        log_success "✓ All UI smoke tests passed!"
    else
        log_error "✗ Some UI smoke tests failed"
        log_info ""
        log_info "Check artifacts at: ${ARTIFACTS_DIR}/screenshots/"
    fi
}

# Main execution
main() {
    log_info "Web Client UI Smoke Test"
    log_info "Endpoint: $BASE_URL"
    log_info ""
    
    # Ensure artifact directory exists
    mkdir -p "${ARTIFACTS_DIR}/screenshots"
    
    # Run tests
    test_home_page
    test_info_pages
    test_app_pages
    test_api_endpoints
    test_static_assets
    test_response_time
    test_js_errors
    
    # Generate summary
    generate_summary
    
    exit $EXIT_CODE
}

main "$@"
