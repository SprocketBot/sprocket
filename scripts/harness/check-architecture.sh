#!/usr/bin/env bash
#
# check-architecture.sh - Enforce architectural rules in CI/pre-commit
#
# Usage:
#   ./check-architecture.sh              # Check all rules
#   ./check-architecture.sh --rule <n>   # Check specific rule
#   ./check-architecture.sh --help       # Show help
#
# Rules enforced:
# 1. Business logic placement (no logic in resolvers)
# 2. No hardcoded secrets
# 3. No blocking operations in async routes
# 4. Proper error handling
# 5. Configuration through env vars
#

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "${SCRIPT_DIR}/common.sh"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Configuration
SPECIFIC_RULE=""
EXIT_CODE=0

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --rule|-r)
            SPECIFIC_RULE="$2"
            shift 2
            ;;
        --help|-h)
            echo "Usage: $0 [--rule <n>]"
            echo ""
            echo "Enforce architectural rules"
            echo ""
            echo "Rules:"
            echo "  1 - Business logic placement"
            echo "  2 - No hardcoded secrets"
            echo "  3 - No blocking operations"
            echo "  4 - Proper error handling"
            echo "  5 - Configuration through env vars"
            echo "  all - Check all rules (default)"
            exit 0
            ;;
        *)
            echo -e "${RED}Unknown option: $1${NC}"
            exit 1
            ;;
    esac
done

# Rule 1: Check for business logic in resolvers
check_business_logic_placement() {
    log_info "Checking Rule 1: Business logic placement..."
    
    local violations=0
    
    # Find resolver files
    while IFS= read -r -d '' file; do
        # Check for business logic patterns in resolvers
        if grep -q "if.*then\|validate\|calculate\|process" "$file" 2>/dev/null; then
            # Check if it's in a resolver method (not delegating to service)
            if grep -B5 -A5 "if.*then\|validate\|calculate\|process" "$file" | \
               grep -q "@Resolver\|@Query\|@Mutation" 2>/dev/null; then
                # Check if it's NOT just delegating to service
                if ! grep -A10 "@Query\|@Mutation" "$file" | grep -q "this\..*Service\." 2>/dev/null; then
                    log_warn "Potential business logic in resolver: $file"
                    ((violations++))
                fi
            fi
        fi
    done < <(find . -name "*.resolver.ts" -type f -print0 2>/dev/null)
    
    if [ $violations -eq 0 ]; then
        log_success "Rule 1: No business logic in resolvers"
    else
        log_error "Rule 1: Found $violations potential violations"
        EXIT_CODE=1
    fi
}

# Rule 2: Check for hardcoded secrets
check_hardcoded_secrets() {
    log_info "Checking Rule 2: No hardcoded secrets..."
    
    local violations=0
    
    # Patterns that indicate secrets
    local patterns=(
        "password.*=.*['\"][^'\"]+['\"]"
        "secret.*=.*['\"][^'\"]+['\"]"
        "apiKey.*=.*['\"][^'\"]+['\"]"
        "api_key.*=.*['\"][^'\"]+['\"]"
        "token.*=.*['\"][^'\"]+['\"]"
        "JWT_SECRET.*=.*['\"]"
        "DATABASE_URL.*=.*['\"]"
    )
    
    for pattern in "${patterns[@]}"; do
        while IFS= read -r line; do
            # Skip if it's process.env or config service
            if ! echo "$line" | grep -q "process\.env\|configService\|ConfigService" 2>/dev/null; then
                # Skip comments
                if ! echo "$line" | grep -q "^[[:space:]]*//\|^[[:space:]]*/\*\|^[[:space:]]*\*" 2>/dev/null; then
                    log_warn "Potential hardcoded secret: $line"
                    ((violations++))
                fi
            fi
        done < <(grep -rn "$pattern" --include="*.ts" --include="*.js" . 2>/dev/null || true)
    done
    
    if [ $violations -eq 0 ]; then
        log_success "Rule 2: No hardcoded secrets detected"
    else
        log_error "Rule 2: Found $violations potential hardcoded secrets"
        EXIT_CODE=1
    fi
}

# Rule 3: Check for blocking operations in async functions
check_blocking_operations() {
    log_info "Checking Rule 3: No blocking operations in async code..."
    
    local violations=0
    
    # Look for synchronous file operations in async functions
    while IFS= read -r file; do
        if grep -q "async" "$file" 2>/dev/null; then
            # Check for blocking fs operations
            if grep -n "fs\.readFileSync\|fs\.writeFileSync\|fs\.appendFileSync" "$file" 2>/dev/null; then
                log_warn "Blocking fs operation in async file: $file"
                ((violations++))
            fi
            
            # Check for synchronous HTTP requests (axios without await, sync request)
            if grep -n "request\.get\|request\.post\|sync-request" "$file" 2>/dev/null; then
                log_warn "Potential blocking HTTP request: $file"
                ((violations++))
            fi
        fi
    done < <(find . -name "*.ts" -type f -path "*/src/*" 2>/dev/null)
    
    if [ $violations -eq 0 ]; then
        log_success "Rule 3: No blocking operations detected"
    else
        log_error "Rule 3: Found $violations potential blocking operations"
        EXIT_CODE=1
    fi
}

# Rule 4: Check for proper error handling
check_error_handling() {
    log_info "Checking Rule 4: Proper error handling..."
    
    local violations=0
    
    # Look for try-catch blocks with empty catch
    while IFS= read -r line; do
        file=$(echo "$line" | cut -d: -f1)
        line_num=$(echo "$line" | cut -d: -f2)
        
        # Check next few lines for empty catch
        if sed -n "${line_num},$((line_num+5))p" "$file" | grep -q "} catch.*{$\|} catch (error) {$"; then
            if ! sed -n "$((line_num+1)),$((line_num+5))p" "$file" | grep -q "console\|logger\|throw\|log" 2>/dev/null; then
                log_warn "Empty or silent catch block: $file:$line_num"
                ((violations++))
            fi
        fi
    done < <(grep -rn "} catch" --include="*.ts" . 2>/dev/null | head -50)
    
    if [ $violations -eq 0 ]; then
        log_success "Rule 4: Proper error handling detected"
    else
        log_error "Rule 4: Found $violations files with potential silent errors"
        EXIT_CODE=1
    fi
}

# Rule 5: Check for configuration through env vars
check_configuration() {
    log_info "Checking Rule 5: Configuration through environment variables..."
    
    local violations=0
    
    # Look for hardcoded connection strings or URLs
    while IFS= read -r pattern; do
        while IFS= read -r line; do
            # Skip if it's using process.env or config
            if ! echo "$line" | grep -q "process\.env\|ConfigService\|config\." 2>/dev/null; then
                # Skip test files and examples
                if ! echo "$line" | grep -q "\.spec\.ts\|\.test\.ts\|example\|sample" 2>/dev/null; then
                    log_warn "Hardcoded configuration: $line"
                    ((violations++))
                fi
            fi
        done < <(grep -rn "$pattern" --include="*.ts" --include="*.js" . 2>/dev/null | head -20 || true)
    done < <(echo -e "postgresql://\|mongodb://\|redis://\|amqp://\|http://localhost:\|https://localhost:")
    
    if [ $violations -eq 0 ]; then
        log_success "Rule 5: Configuration uses environment variables"
    else
        log_error "Rule 5: Found $violations hardcoded configurations"
        EXIT_CODE=1
    fi
}

# Main execution
main() {
    log_info "Running architectural rule checks..."
    log_info ""
    
    case ${SPECIFIC_RULE:-all} in
        1)
            check_business_logic_placement
            ;;
        2)
            check_hardcoded_secrets
            ;;
        3)
            check_blocking_operations
            ;;
        4)
            check_error_handling
            ;;
        5)
            check_configuration
            ;;
        all)
            check_business_logic_placement
            check_hardcoded_secrets
            check_blocking_operations
            check_error_handling
            check_configuration
            ;;
        *)
            log_error "Unknown rule: $SPECIFIC_RULE"
            exit 1
            ;;
    esac
    
    log_info ""
    if [ $EXIT_CODE -eq 0 ]; then
        log_success "All architectural rules passed!"
    else
        log_error "Architectural rule violations detected"
        log_info ""
        log_info "Review violations above and fix before committing."
        log_info "To bypass (not recommended), use: git commit --no-verify"
    fi
    
    exit $EXIT_CODE
}

main "$@"
