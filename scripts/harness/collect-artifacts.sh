#!/usr/bin/env bash
#
# collect-artifacts.sh - Gather verification evidence for agent tasks
#
# Usage:
#   ./collect-artifacts.sh                    # Collect standard artifacts
#   ./collect-artifacts.sh --failure          # Collect failure diagnostics
#   ./collect-artifacts.sh --task <name>      # Tag artifacts with task name
#   ./collect-artifacts.sh --help             # Show help
#
# This script gathers:
# - Service logs from failed runs
# - GraphQL query/response logs
# - Screenshots for UI failures (if applicable)
# - Machine-generated failure summary
# - Metadata (timestamp, git SHA, commands run, environment)
#

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "${SCRIPT_DIR}/common.sh"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
MODE="success"  # success or failure
TASK_NAME=""
ARTIFACT_ROOT="${SCRIPT_DIR}/../../artifacts"
LATEST_DIR="${ARTIFACT_ROOT}/latest"
FAILURES_DIR="${ARTIFACT_ROOT}/failures"
TIMESTAMP=$(date +%Y%m%d-%H%M%S)

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --failure|-f)
            MODE="failure"
            shift
            ;;
        --task|-t)
            TASK_NAME="$2"
            shift 2
            ;;
        --help|-h)
            echo "Usage: $0 [--failure] [--task <name>]"
            echo ""
            echo "Collect verification artifacts for agent tasks"
            echo ""
            echo "Options:"
            echo "  --failure, -f      Collect failure diagnostics"
            echo "  --task, -t <name>  Tag artifacts with task name"
            echo "  --help, -h         Show this help message"
            exit 0
            ;;
        *)
            echo -e "${RED}Unknown option: $1${NC}"
            echo "Use --help for usage information"
            exit 1
            ;;
    esac
done

# Determine output directory
if [ "$MODE" = "failure" ]; then
    if [ -n "$TASK_NAME" ]; then
        OUTPUT_DIR="${FAILURES_DIR}/${TIMESTAMP}-${TASK_NAME}"
    else
        OUTPUT_DIR="${FAILURES_DIR}/${TIMESTAMP}-failure"
    fi
else
    OUTPUT_DIR="${LATEST_DIR}"
fi

log_info "Collecting artifacts to: ${OUTPUT_DIR}"

# Create directory structure
mkdir -p "${OUTPUT_DIR}"/{logs,screenshots,graphql,summaries,tests,diff,metadata}

# Collect metadata
collect_metadata() {
    log_info "Collecting metadata..."
    
    cat > "${OUTPUT_DIR}/metadata/metadata.json" << EOF
{
  "timestamp": "$(date -Iseconds)",
  "git_sha": "$(git rev-parse HEAD 2>/dev/null || echo 'unknown')",
  "git_branch": "$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo 'unknown')",
  "mode": "${MODE}",
  "task_name": "${TASK_NAME:-none}",
  "hostname": "$(hostname)",
  "user": "$(whoami)",
  "node_version": "$(node --version 2>/dev/null || echo 'unknown')",
  "npm_version": "$(npm --version 2>/dev/null || echo 'unknown')",
  "docker_version": "$(docker --version 2>/dev/null || echo 'unknown')"
}
EOF

    # Git diff
    git diff --stat > "${OUTPUT_DIR}/diff/git-diff-stat.txt" 2>/dev/null || true
    git diff > "${OUTPUT_DIR}/diff/git-diff-full.txt" 2>/dev/null || true
    
    # Environment variables (sanitized)
    env | grep -E "^(POSTGRES_|REDIS_|RABBITMQ_|MINIO_|NODE_|npm_)" | \
        sed 's/PASSWORD=.*/PASSWORD=[REDACTED]/g' | \
        sed 's/SECRET.*/SECRET=[REDACTED]/g' | \
        sort > "${OUTPUT_DIR}/metadata/env-vars.txt" 2>/dev/null || true
    
    log_success "Metadata collected"
}

# Collect service logs
collect_logs() {
    log_info "Collecting service logs..."
    
    # Check if docker-compose is available
    if command_exists "docker-compose"; then
        # All services logs
        docker-compose logs --tail=200 > "${OUTPUT_DIR}/logs/all-services.log" 2>&1 || true
        
        # Individual service logs
        for service in core web postgres redis rabbitmq minio; do
            docker-compose logs --tail=200 "$service" > "${OUTPUT_DIR}/logs/${service}.log" 2>&1 || true
        done
        
        log_success "Docker logs collected"
    else
        log_warn "docker-compose not found, skipping container logs"
    fi
    
    # Collect npm debug logs if they exist
    if [ -d "${SCRIPT_DIR}/../../.npm/_logs" ]; then
        cp "${SCRIPT_DIR}/../../.npm/_logs/"*.log "${OUTPUT_DIR}/logs/npm-debug.log" 2>/dev/null || true
    fi
}

# Collect GraphQL evidence
collect_graphql() {
    log_info "Collecting GraphQL evidence..."
    
    # Test GraphQL endpoint
    local graphql_response
    graphql_response=$(curl -s -X POST http://localhost:3001/graphql \
        -H "Content-Type: application/json" \
        -d '{"query":"{__typename}"}' 2>/dev/null) || true
    
    if [ -n "$graphql_response" ]; then
        echo "$graphql_response" | jq . > "${OUTPUT_DIR}/graphql/health-check.json" 2>/dev/null || \
            echo "$graphql_response" > "${OUTPUT_DIR}/graphql/health-check.json"
    fi
    
    # Collect any GraphQL query logs if available
    if [ -f "${SCRIPT_DIR}/../../core/graphql-query.log" ]; then
        cp "${SCRIPT_DIR}/../../core/graphql-query.log" "${OUTPUT_DIR}/graphql/query-log.txt" 2>/dev/null || true
    fi
    
    log_success "GraphQL evidence collected"
}

# Collect test results
collect_tests() {
    log_info "Collecting test results..."
    
    # Check for recent test output files
    if [ -d "${SCRIPT_DIR}/../../core/coverage" ]; then
        cp -r "${SCRIPT_DIR}/../../core/coverage" "${OUTPUT_DIR}/tests/coverage" 2>/dev/null || true
    fi
    
    # Collect JUnit XML if available
    find "${SCRIPT_DIR}/../../" -name "junit.xml" -type f -exec cp {} "${OUTPUT_DIR}/tests/" \; 2>/dev/null || true
    
    # Collect test output logs
    if [ -f "${LATEST_DIR}/smoke/test-output.log" ]; then
        cp "${LATEST_DIR}/smoke/test-output.log" "${OUTPUT_DIR}/tests/" 2>/dev/null || true
    fi
    
    log_success "Test results collected"
}

# Collect UI screenshots (if Playwright is available)
collect_screenshots() {
    log_info "Collecting UI screenshots..."
    
    # Check for Playwright screenshots
    if [ -d "${SCRIPT_DIR}/../../clients/web/test-results" ]; then
        cp -r "${SCRIPT_DIR}/../../clients/web/test-results"/* "${OUTPUT_DIR}/screenshots/" 2>/dev/null || true
    fi
    
    # Check for any PNG files in latest directory
    if [ -d "${LATEST_DIR}/screenshots" ]; then
        cp "${LATEST_DIR}/screenshots/"*.png "${OUTPUT_DIR}/screenshots/" 2>/dev/null || true
    fi
    
    log_success "Screenshots collected"
}

# Generate failure summary
generate_failure_summary() {
    if [ "$MODE" = "failure" ]; then
        log_info "Generating failure summary..."
        
        cat > "${OUTPUT_DIR}/summaries/failure-analysis.md" << 'EOF'
# Failure Analysis

## Summary
<!-- Agent: Brief description of what failed -->

## Error Details
<!-- Agent: Paste the full error message/stack trace here -->

## Reproduction Steps
1. 
2. 
3. 

## Affected Services
<!-- Check all that apply -->
- [ ] Core API
- [ ] Web Client
- [ ] Database
- [ ] Message Queue
- [ ] Storage (MinIO)
- [ ] Other: _____

## Root Cause (if known)
<!-- Agent: Describe what caused the failure -->

## Proposed Fix
<!-- Agent: Describe the planned fix -->

## Additional Context
<!-- Agent: Add any other relevant information -->
EOF
        
        log_success "Failure summary template created"
    fi
}

# Generate success summary
generate_success_summary() {
    if [ "$MODE" = "success" ]; then
        log_info "Generating success summary..."
        
        cat > "${OUTPUT_DIR}/summaries/task-completion.md" << 'EOF'
# Task Completion Summary

## What Changed
<!-- Agent: Describe the changes made -->

## Validation Performed
<!-- Agent: List the validation steps performed -->

### Tests Run
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Smoke tests pass

### Commands Executed
```bash
<!-- Agent: List the commands you ran -->
```

## Artifacts Collected
- Metadata: `metadata/metadata.json`
- Logs: `logs/`
- Test results: `tests/`
- GraphQL evidence: `graphql/`

## Residual Risks
<!-- Agent: Note any remaining concerns or follow-up needed -->

## Next Steps
<!-- Agent: Recommend next actions for reviewers -->
EOF
        
        log_success "Success summary template created"
    fi
}

# Main execution
main() {
    log_info "Starting artifact collection..."
    log_info "Mode: ${MODE}"
    log_info "Task: ${TASK_NAME:-none}"
    
    # Ensure artifacts root exists
    mkdir -p "${ARTIFACT_ROOT}"
    
    # Collect all artifacts
    collect_metadata
    collect_logs
    collect_graphql
    collect_tests
    collect_screenshots
    
    if [ "$MODE" = "failure" ]; then
        generate_failure_summary
    else
        generate_success_summary
    fi
    
    # Create index file
    cat > "${OUTPUT_DIR}/INDEX.md" << EOF
# Artifact Collection Index

**Timestamp:** $(date -Iseconds)
**Mode:** ${MODE}
**Task:** ${TASK_NAME:-none}
**Git SHA:** $(git rev-parse HEAD 2>/dev/null || echo 'unknown')

## Directory Structure

\`\`\`
${OUTPUT_DIR}/
├── metadata/
│   ├── metadata.json      # Environment and execution metadata
│   └── env-vars.txt       # Sanitized environment variables
├── logs/
│   ├── all-services.log   # Combined logs from all services
│   ├── core.log           # Core API logs
│   ├── web.log            # Web client logs
│   └── ...                # Other service logs
├── graphql/
│   └── health-check.json  # GraphQL endpoint health response
├── tests/
│   └── ...                # Test results and coverage
├── screenshots/
│   └── ...                # UI screenshots (if applicable)
├── diff/
│   ├── git-diff-stat.txt  # Git diff summary
│   └── git-diff-full.txt  # Full git diff
└── summaries/
    └── ...                # Task completion or failure analysis
\`\`\`

## Usage

Review the \`summaries/\` directory for the main analysis.
Check \`logs/\` for detailed service behavior.
Examine \`metadata/\` for execution context.
EOF
    
    log_success "Artifact collection completed!"
    log_info ""
    log_info "Artifacts saved to:"
    log_info "  ${OUTPUT_DIR}"
    log_info ""
    log_info "Next steps:"
    if [ "$MODE" = "failure" ]; then
        log_info "  1. Review: cat ${OUTPUT_DIR}/summaries/failure-analysis.md"
        log_info "  2. Check logs: ls -la ${OUTPUT_DIR}/logs/"
        log_info "  3. Analyze root cause and implement fix"
    else
        log_info "  1. Review: cat ${OUTPUT_DIR}/summaries/task-completion.md"
        log_info "  2. Verify artifacts: ls -la ${OUTPUT_DIR}/"
        log_info "  3. Submit for review"
    fi
}

main "$@"
