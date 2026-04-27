# Agent Self-Review Checklist

## Purpose

This checklist provides a consistent quality gate that agents must complete before claiming a task is finished. It ensures all agent work meets minimum quality standards and provides evidence of validation.

**When to use:** After implementing changes and before marking a task complete.

---

## Quick Reference by Task Class

### Class A (Safe Autonomous)
Complete: **Core Checks** only

### Class B (Autonomous with Review)
Complete: **Core Checks** + **Extended Checks**

### Class C (Human-Owned)
Complete: **Escalation Checklist** (do NOT implement until human approval received)

---

## Core Checks (All Tasks)

### 1. Code Quality

```markdown
## Code Quality

- [ ] **Syntax Validation**
  - Scripts: `bash -n path/to/script.sh` passes
  - TypeScript: `tsc --noEmit` passes
  - JSON: Valid JSON syntax
  - YAML: Valid YAML syntax

- [ ] **Linting**
  - No new lint errors introduced
  - Existing lint errors not worsened
  - Command: `npm run lint --workspace=<workspace>`

- [ ] **Code Style**
  - Follows existing patterns in codebase
  - Consistent naming conventions
  - Proper indentation and formatting
  - Command: `npm run format`

- [ ] **Comments & Documentation**
  - Non-obvious logic has explanatory comments
  - Function/method docstrings present for public APIs
  - TODOs include issue references if applicable
```

**Validation Commands:**
```bash
# Lint check
npm run lint --workspace=core

# Format check
npm run format

# TypeScript check
npm run build --workspace=core
```

---

### 2. Compilation & Build

```markdown
## Build Verification

- [ ] **TypeScript Compilation**
  - No type errors in changed files
  - No type errors in dependent files
  - Command: `npm run build --workspace=<workspace>`

- [ ] **Build Artifacts**
  - Build completes successfully
  - Output files generated in `dist/`
  - No unexpected build warnings

- [ ] **Dependency Resolution**
  - No new dependency conflicts
  - All imports resolve correctly
  - No circular dependencies introduced
```

**Validation Commands:**
```bash
# Build workspace
npm run build --workspace=core

# Check for circular dependencies (if tooling exists)
madge --circular src/
```

---

### 3. Basic Functionality

```markdown
## Basic Functionality

- [ ] **Service Starts**
  - Modified service starts without errors
  - Health endpoint responds
  - No immediate crashes

- [ ] **No Regressions**
  - Existing functionality still works
  - No new error messages in logs
  - Backwards compatibility maintained

- [ ] **Environment Variables**
  - Required env vars documented
  - Default values provided where appropriate
  - No hardcoded secrets
```

**Validation Commands:**
```bash
# Check service health
npm run dev:status

# Test health endpoint
curl http://localhost:3001/healthz

# Check logs for errors
npm run dev:logs -- core | grep -i error
```

---

## Extended Checks (Class B Tasks)

### 4. Test Coverage

```markdown
## Test Coverage

- [ ] **Unit Tests Added**
  - New functionality has corresponding tests
  - Edge cases covered
  - Error conditions tested

- [ ] **Existing Tests Pass**
  - All tests in affected workspace pass
  - No tests disabled or skipped
  - Test count matches expectations

- [ ] **Test Quality**
  - Tests have clear assertions
  - Test names describe behavior
  - Mocks/stubs used appropriately

- [ ] **Coverage Metrics**
  - Coverage not decreased significantly
  - Critical paths covered
  - Command: `npm run test --workspace=core -- --coverage`
```

**Validation Commands:**
```bash
# Run all tests
npm run test --workspace=core

# Run with coverage
npm run test --workspace=core -- --coverage

# Run specific test file
npm run test --workspace=core -- path/to/test.spec.ts

# Check coverage report
open core/coverage/lcov-report/index.html
```

**Acceptance Criteria:**
- 0 failing tests
- No decrease in overall coverage > 5%
- All new code paths have test coverage

---

### 5. Smoke Testing

```markdown
## Smoke Testing

- [ ] **Relevant Smoke Flow Passes**
  - League features: `npm run verify:tier1:league`
  - Scrim features: `npm run verify:tier1:scrim`
  - Submission features: `npm run verify:tier1:submission`
  - General: `npm run dev:smoke`

- [ ] **End-to-End Validation**
  - Full user journey works (if applicable)
  - API responses are well-formed
  - UI renders without errors (if applicable)

- [ ] **Performance Sanity**
  - No obvious performance degradation
  - Response times within expected range
  - No memory leaks (for long-running services)
```

**Validation Commands:**
```bash
# Full smoke suite
npm run dev:smoke

# Specific scenarios
npm run verify:tier1:league
npm run verify:tier1:scrim
npm run verify:tier1:submission

# GraphQL health
curl http://localhost:3001/graphql \
  -H 'Content-Type: application/json' \
  -d '{"query":"{__typename}"}'
```

---

### 6. Integration Points

```markdown
## Integration Points

- [ ] **Database Interactions**
  - Queries are parameterized (no SQL injection)
  - Migrations are additive (no destructive changes)
  - Indexes considered for new queries

- [ ] **Message Queue Integration**
  - Queue names follow conventions
  - Message schemas are versioned
  - Error handling for queue failures

- [ ] **External APIs**
  - API contracts respected
  - Rate limiting considered
  - Error responses handled

- [ ] **File Storage**
  - S3/MinIO paths are validated
  - File uploads have size limits
  - Content-type validation present
```

**Validation Commands:**
```bash
# Check database migrations
docker-compose exec core npm run migration:run --dry-run

# Check queue status
docker-compose exec rabbitmq rabbitmq-diagnostics ping

# Check MinIO connectivity
curl http://localhost:9000/minio/health/live
```

---

### 7. Security Review

```markdown
## Security Review

- [ ] **Authentication & Authorization**
  - Auth checks present on protected routes
  - User permissions validated
  - No bypass mechanisms introduced

- [ ] **Input Validation**
  - All user inputs validated
  - Sanitization for XSS/SQL injection
  - Type checking on API parameters

- [ ] **Secrets Management**
  - No secrets in code
  - No secrets in logs
  - Environment variables used correctly

- [ ] **Data Privacy**
  - PII handled appropriately
  - No sensitive data in logs
  - GDPR considerations addressed (if applicable)
```

**Validation Commands:**
```bash
# Search for potential secrets
git diff | grep -iE "(password|secret|token|key)" | grep -v "process.env"

# Check for console.log in production code
git diff --name-only | grep "\.ts$" | xargs grep -n "console\.(log|error|warn)"

# Review environment variable usage
git diff | grep -E "process\.env\."
```

---

### 8. Documentation

```markdown
## Documentation

- [ ] **Code Documentation**
  - Public APIs have docstrings
  - Complex logic explained
  - Examples provided for non-trivial usage

- [ ] **User Documentation**
  - README updated if behavior changed
  - API documentation current
  - Configuration options documented

- [ ] **Internal Documentation**
  - Architecture diagrams updated (if applicable)
  - Service dependencies documented
  - Deployment notes added (if applicable)

- [ ] **Change Documentation**
  - CHANGELOG updated (if project uses one)
  - Migration guide for breaking changes
  - Deprecation notices for removed features
```

**Validation:**
```bash
# Check for stale references
grep -r "old-path" docs/ || echo "No stale references"

# Verify referenced files exist
grep -oP '`[^`]+`' README.md | tr -d '`' | while read path; do
  [ -f "$path" ] || echo "Missing: $path"
done
```

---

### 9. Backwards Compatibility

```markdown
## Backwards Compatibility

- [ ] **API Compatibility**
  - No breaking changes to public APIs
  - Deprecated fields still functional
  - Version headers respected

- [ ] **Data Compatibility**
  - Schema changes are additive
  - Old data still readable
  - Migration path for existing data

- [ ] **Client Compatibility**
  - Web client still works
  - Mobile clients unaffected
  - Third-party integrations maintained

- [ ] **Configuration Compatibility**
  - Existing configs still valid
  - Default values provided for new settings
  - Backwards compatible env vars
```

**Validation:**
```bash
# Check for breaking API changes
git diff | grep -E "^\-.*query|^\-.*mutation"

# Verify migration is additive
git diff | grep -E "DROP TABLE|DROP COLUMN|ALTER TABLE.*DROP"
```

---

### 10. Artifact Collection

```markdown
## Artifact Collection

- [ ] **Metadata Captured**
  - Git SHA recorded
  - Timestamp logged
  - Environment documented

- [ ] **Test Evidence**
  - Test output saved
  - Coverage reports collected
  - Screenshots for UI changes

- [ ] **Logs & Diagnostics**
  - Service logs captured
  - Error stacks preserved
  - Performance metrics recorded

- [ ] **Summary Document**
  - Task completion summary written
  - Validation steps documented
  - Residual risks noted
```

**Validation Commands:**
```bash
# Collect artifacts
./scripts/harness/collect-artifacts.sh --task <task-name>

# Verify artifacts
ls -la artifacts/latest/
cat artifacts/latest/metadata/metadata.json
cat artifacts/latest/summaries/task-completion.md
```

---

## Escalation Checklist (Class C Tasks)

```markdown
## Escalation Required - DO NOT IMPLEMENT

- [ ] **Task Identified as Class C**
  - [ ] Involves production credentials
  - [ ] Modifies auth/identity systems
  - [ ] Destructive data operations
  - [ ] Production infrastructure changes
  - [ ] Cross-lane traffic decisions
  - [ ] Security-impacting changes

- [ ] **Escalation Documented**
  - [ ] Reason for escalation clearly stated
  - [ ] Affected systems identified
  - [ ] Risk assessment provided
  - [ ] Suggested alternatives (if any)

- [ ] **Human Approval Received**
  - [ ] Explicit approval in writing (chat/email/ticket)
  - [ ] Rollback plan confirmed
  - [ ] Deployment window agreed (if production)
  - [ ] Monitoring requirements defined

- [ ] **Pre-Implementation Validation**
  - [ ] Non-destructive validation completed
  - [ ] Staging environment tested (if applicable)
  - [ ] Backup strategy confirmed
  - [ ] Communication plan in place
```

**Escalation Template:**
```markdown
## Escalation Required

**Task:** [description]

**Classification:** Class C (Human-Owned)

**Reason for Escalation:**
- [ ] Production credentials
- [ ] Auth/identity changes
- [ ] Destructive operations
- [ ] Infrastructure changes
- [ ] Security impact

**Requested Action:**
[What human input is needed]

**Blocked Files:**
- `path/to/file.ts`

**Suggested Alternatives:**
[Any safe workarounds]

**Human Approval:**
[Link to approval message/ticket]
```

---

## Pre-Submission Checklist

Before submitting your work:

```markdown
## Final Verification

- [ ] All applicable checks above completed
- [ ] Self-review checklist this file is in is up to date
- [ ] Artifacts collected and reviewed
- [ ] Structured summary written
- [ ] Next steps clearly defined
- [ ] Human review requested (for Class B)
- [ ] Escalation approved (for Class C)

## Submission Package

- [ ] Git commit message is clear and descriptive
- [ ] PR description follows template
- [ ] Linked to relevant issue/ticket
- [ ] Reviewers tagged
- [ ] Deployment notes included (if applicable)
```

---

## Common Failure Modes

### Checklist Anti-Patterns to Avoid

❌ **Skipping tests because "they're not related"**
✅ Fix broken tests or document why they're failing

❌ **Collecting artifacts but not reviewing them**
✅ Review artifacts to ensure they capture relevant evidence

❌ **Marking all checkboxes without actual validation**
✅ Actually run the commands and verify each item

❌ **Completing checklist after submission**
✅ Complete checklist BEFORE claiming task is done

❌ **Using checklist as bureaucracy instead of quality gate**
✅ Use checklist to catch issues before they reach reviewers

---

## Automation Opportunities

### Checks That Can Be Automated

```bash
#!/usr/bin/env bash
# self-review-checklist.sh - Automated portion of self-review

set -euo pipefail

echo "Running automated self-review checks..."

# 1. Lint check
echo "[1/8] Running linter..."
npm run lint --workspace=core || exit 1

# 2. Build check
echo "[2/8] Building workspace..."
npm run build --workspace=core || exit 1

# 3. Test check
echo "[3/8] Running tests..."
npm run test --workspace=core || exit 1

# 4. Smoke test
echo "[4/8] Running smoke tests..."
npm run dev:smoke || exit 1

# 5. Security scan
echo "[5/8] Scanning for secrets..."
if git diff | grep -iE "(password|secret|token|key)" | grep -v "process.env"; then
  echo "WARNING: Potential secrets detected"
  exit 1
fi

# 6. Documentation check
echo "[6/8] Checking documentation..."
# Add custom doc validation here

# 7. Artifact collection
echo "[7/8] Collecting artifacts..."
./scripts/harness/collect-artifacts.sh

# 8. Generate report
echo "[8/8] Generating report..."
cat << EOF

## Automated Self-Review Report

**Status:** PASSED
**Timestamp:** $(date -Iseconds)
**Git SHA:** $(git rev-parse HEAD)

All automated checks passed. Manual review still required.

EOF
```

---

## Related Documents

- **Task Protocol:** `reports/agent-task-protocol.md`
- **Harness Charter:** `reports/agent-harness-charter.md`
- **Local Runtime:** `reports/agent-harness-local-runtime.md`
- **Architecture Rules:** `reports/agent-architecture-rules.md` (when created)
