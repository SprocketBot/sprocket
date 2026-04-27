# Agent Task Protocol

## Purpose

This document defines the standard workflow that AI agents should follow when executing tasks in the Sprocket repository. Following this protocol ensures consistency, safety, and reproducibility across all agent operations.

## Standard Workflow

### Phase 1: Task Intake (5 minutes)

#### Step 1: Read Task and Identify Scope

**Actions:**
1. Read the task description carefully
2. Identify which services are affected (core, web, microservices, infra)
3. Determine task classification (Class A, B, or C) using `reports/agent-harness-charter.md`
4. List the specific files likely to be modified

**Output:**
```markdown
## Task Analysis

**Task:** [brief description]

**Classification:** Class A / B / C

**Affected Services:**
- [ ] Core API
- [ ] Web Client
- [ ] Microservices: [list]
- [ ] Infrastructure
- [ ] Documentation only

**Estimated Files:**
- `path/to/file1.ts`
- `path/to/file2.md`
```

#### Step 2: Read Relevant Documentation

**Actions:**
1. Read service-level `AGENTS.md` if modifying application code
2. Review `reports/agent-harness-local-runtime.md` for environment setup
3. Check `scripts/harness/service-manifest.json` for service metadata
4. Identify any architectural rules in `reports/agent-architecture-rules.md`

**Decision Point:**
- If task is **Class C** (Human-Owned): STOP and escalate immediately
- If task is **Class A or B**: Continue to Phase 2

---

### Phase 2: Environment Setup (2-3 minutes)

#### Step 3: Boot Minimal Required Infrastructure

**Actions:**
1. Check current environment status
2. Start only the services needed for this task
3. Wait for health checks to pass

**Commands:**
```bash
# Check status
npm run dev:status

# Start full stack (if needed)
npm run dev:up

# Or start minimal services
docker-compose up -d postgres redis rabbitmq minio core

# Verify health
npm run dev:smoke
```

**Validation:**
- [ ] Required services are healthy
- [ ] Health endpoints respond
- [ ] No error logs on startup

---

### Phase 3: Baseline Validation (3-5 minutes)

#### Step 4: Validate Baseline

**Actions:**
1. Run existing tests for affected modules
2. Run relevant smoke tests
3. Document current behavior

**Commands:**
```bash
# Run targeted tests
npm run test --workspace=core -- --testPathPattern=affected-module

# Run smoke tests
npm run dev:smoke

# Or run specific smoke test
npm run verify:tier1:league
npm run verify:tier1:scrim
npm run verify:tier1:submission
```

**Output:**
```markdown
## Baseline Status

**Tests Before Change:**
- Unit tests: PASS/FAIL (X passing, Y failing)
- Smoke tests: PASS/FAIL

**Known Issues:**
[Any pre-existing failures noted]
```

#### Step 5: Reproduce Issue or Confirm Target Gap

**For bugfixes:**
1. Reproduce the reported issue
2. Document exact reproduction steps
3. Capture error messages/logs

**For features:**
1. Confirm the gap exists
2. Document expected vs actual behavior
3. Identify acceptance criteria

**Commands:**
```bash
# Collect failure artifacts if reproducing a bug
./scripts/harness/collect-artifacts.sh --failure --task <task-name>
```

**Output:**
```markdown
## Issue Reproduction

**Steps to Reproduce:**
1. 
2. 
3. 

**Observed Behavior:**
[What actually happens]

**Expected Behavior:**
[What should happen]

**Error Messages:**
[Any stack traces or error output]
```

---

### Phase 4: Implementation (variable)

#### Step 6: Implement Change

**Actions:**
1. Make narrowly scoped changes
2. Follow existing code patterns
3. Add comments for non-obvious logic
4. Update tests alongside implementation

**Best Practices:**
- Commit frequently with descriptive messages
- Keep changes additive when possible
- Avoid cross-cutting refactors unless explicitly requested
- Follow language-specific style guides

**Output:**
```markdown
## Implementation Notes

**Changes Made:**
- [Brief description of each change]

**Files Modified:**
- `path/to/file1.ts` - [what changed]
- `path/to/file2.ts` - [what changed]

**Design Decisions:**
[Any non-obvious choices and rationale]
```

---

### Phase 5: Validation (5-10 minutes)

#### Step 7: Run Targeted Tests

**Actions:**
1. Run unit tests for changed modules
2. Run integration tests if applicable
3. Verify no regressions in related tests

**Commands:**
```bash
# Run tests for affected workspace
npm run test --workspace=core

# Run with coverage
npm run test --workspace=core -- --coverage

# Run specific test file
npm run test --workspace=core -- path/to/test.spec.ts
```

**Validation:**
- [ ] All new tests pass
- [ ] All existing tests still pass
- [ ] No new test failures introduced

#### Step 8: Run Relevant Smoke Flow

**Actions:**
1. Run the smoke test most relevant to your changes
2. Verify end-to-end behavior works
3. Check service logs for errors

**Commands:**
```bash
# Full smoke suite
npm run dev:smoke

# Or specific scenario
npm run verify:tier1:league      # For league/season features
npm run verify:tier1:scrim       # For matchmaking/scrim features
npm run verify:tier1:submission  # For replay submission features

# Check service health
npm run dev:status
```

**Validation:**
- [ ] Smoke tests pass
- [ ] Service health endpoints respond
- [ ] No new errors in logs

#### Step 9: Collect Artifacts

**Actions:**
1. Run artifact collection
2. Review collected evidence
3. Ensure all required artifacts are present

**Commands:**
```bash
# For successful changes
./scripts/harness/collect-artifacts.sh --task <task-name>

# For failures
./scripts/harness/collect-artifacts.sh --failure --task <task-name>
```

**Output:**
```markdown
## Artifacts Collected

**Location:** `artifacts/latest/` or `artifacts/failures/<timestamp>-<task>/`

**Contents:**
- [x] Metadata (`metadata/metadata.json`)
- [x] Logs (`logs/`)
- [x] Test results (`tests/`)
- [x] GraphQL evidence (`graphql/`)
- [x] Summary (`summaries/`)
```

---

### Phase 6: Self-Review (5 minutes)

#### Step 10: Perform Self-Review

**Actions:**
1. Use the checklist in `reports/agent-self-review-checklist.md`
2. Verify all quality gates are met
3. Address any issues found

**Checklist:**
```markdown
## Self-Review Checklist

### Code Quality
- [ ] Lint passes without new errors
- [ ] TypeScript compiles without errors
- [ ] Code follows existing patterns
- [ ] Comments added for non-obvious logic

### Testing
- [ ] Unit tests added/updated
- [ ] All tests pass
- [ ] Smoke tests pass
- [ ] No regressions introduced

### Documentation
- [ ] Docs updated if behavior changed
- [ ] README files current
- [ ] API changes documented

### Security
- [ ] No secrets committed
- [ ] Auth checks in place
- [ ] Input validation present

### Backwards Compatibility
- [ ] Migrations are additive (if any)
- [ ] APIs don't break existing clients
- [ ] Data changes are backwards compatible

### Artifacts
- [ ] Evidence captured for changes
- [ ] Failure diagnostics collected (if applicable)
- [ ] Metadata is complete
```

---

### Phase 7: Handoff (5 minutes)

#### Step 11: Produce Structured Summary

**Actions:**
1. Write task completion summary
2. Include all required sections
3. Link to artifacts
4. Recommend next steps

**Template:**
```markdown
# Task Completion Summary

## Overview
**Task:** [task description]
**Classification:** Class A / B / C
**Status:** COMPLETE / NEEDS_REVIEW / BLOCKED

## What Changed

### Summary
[Brief 2-3 sentence description]

### Files Modified
- `path/to/file1.ts` - [what changed]
- `path/to/file2.ts` - [what changed]
- `path/to/file3.md` - [what changed]

### Commands Executed
```bash
npm run dev:up
npm run test --workspace=core
npm run dev:smoke
./scripts/harness/collect-artifacts.sh --task my-task
```

## Validation

### Tests Run
- [x] Unit tests: 25 passing, 0 failing
- [x] Integration tests: 5 passing, 0 failing
- [x] Smoke tests: PASS
- [x] Lint: PASS
- [x] TypeScript: PASS

### Proof of Work
**Artifacts Location:** `artifacts/latest/`

**Key Evidence:**
- Test output: `artifacts/latest/tests/`
- Service logs: `artifacts/latest/logs/`
- GraphQL health: `artifacts/latest/graphql/health-check.json`
- Summary: `artifacts/latest/summaries/task-completion.md`

## Residual Risks

[Any remaining concerns, follow-up needed, or known limitations]

## Next Steps

[Recommended actions for reviewers or next agent]

### For Reviewers
1. Review changes in: [list files]
2. Run smoke tests: `npm run dev:smoke`
3. Check artifacts: `ls -la artifacts/latest/`

### For Deployment
- [ ] Requires migration: YES/NO
- [ ] Requires config changes: YES/NO
- [ ] Backwards compatible: YES/NO
```

---

## Task-Specific Workflows

### Bugfix Workflow

```
1. Read bug report
2. Reproduce issue (capture artifacts)
3. Identify root cause
4. Implement fix
5. Add regression test
6. Run full test suite
7. Collect success artifacts
8. Document fix
```

### Feature Workflow

```
1. Read requirements
2. Identify affected services
3. Design implementation approach
4. Implement feature
5. Add tests
6. Run smoke tests
7. Update documentation
8. Collect artifacts
```

### Documentation Workflow

```
1. Identify documentation gap
2. Verify current behavior
3. Update documentation
4. Verify all referenced paths exist
5. Check for stale references
6. Commit with clear message
```

### Infrastructure Workflow

```
1. Read infra change requirements
2. Identify affected stacks/lanes
3. Review Pulumi definitions
4. Make non-destructive changes first
5. Run `pulumi preview`
6. Document what was NOT validated locally
7. Escalate for human review (Class C)
```

---

## Escalation Protocol

### When to Escalate

**Immediately escalate (Class C):**
- Production credential changes
- Auth/identity system modifications
- Destructive data operations
- Production infrastructure changes
- Cross-lane traffic decisions
- Security-impacting changes

### How to Escalate

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
- [ ] Other: [specify]

**Requested Action:**
[What human input is needed]

**Blocked Files:**
- `path/to/sensitive/file.ts`

**Suggested Alternatives:**
[Any safe workarounds]
```

---

## Common Commands Reference

### Environment Management

```bash
# Start/stop services
npm run dev:up
npm run dev:down
npm run dev:reset
npm run dev:status

# View logs
npm run dev:logs -- <service>
docker-compose logs -f <service>
```

### Testing

```bash
# Unit tests
npm run test --workspace=core
npm run test --workspace=clients/web

# Smoke tests
npm run dev:smoke
npm run verify:tier0 -- local-dev

# Coverage
npm run test --workspace=core -- --coverage
```

### Artifact Collection

```bash
# Collect success artifacts
./scripts/harness/collect-artifacts.sh --task <name>

# Collect failure artifacts
./scripts/harness/collect-artifacts.sh --failure --task <name>
```

### Database Operations

```bash
# Seed test data
npm run dev:seed

# Reset database
npm run dev:reset-data

# Run migrations
docker-compose exec core npm run migration:run
```

---

## Quality Gates

### Minimum Requirements for Task Completion

**Class A (Safe Autonomous):**
- [ ] Syntax validation passes
- [ ] Referenced paths exist
- [ ] No stale references introduced
- [ ] Progress logged

**Class B (Autonomous with Review):**
- [ ] All tests pass
- [ ] Smoke tests pass
- [ ] Lint passes
- [ ] TypeScript compiles
- [ ] Artifacts collected
- [ ] Self-review completed
- [ ] Structured summary provided

**Class C (Human-Owned):**
- [ ] Escalation documented
- [ ] Human approval received BEFORE implementation
- [ ] Rollback plan confirmed
- [ ] Deployment impact assessed

---

## Related Documents

- **Task Classifications:** `reports/agent-harness-charter.md`
- **Self-Review Checklist:** `reports/agent-self-review-checklist.md`
- **Local Runtime:** `reports/agent-harness-local-runtime.md`
- **Service Metadata:** `scripts/harness/service-manifest.json`
- **Architecture Rules:** `reports/agent-architecture-rules.md` (when created)
