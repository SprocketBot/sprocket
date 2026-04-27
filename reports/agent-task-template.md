# Agent Task Template

## Purpose

This template standardizes task intake, execution, and output for all agent work in the Sprocket repository. Use this template for every task to ensure consistency, clarity, and reviewability.

---

## Task Intake Template

Copy and fill out this section when starting a new task.

```markdown
# Task: [Task Title]

## Task Classification

**Class:** A / B / C

**Classification Rationale:**
[Brief explanation of why this task fits this classification]

## Task Description

**What:** [What needs to be done]

**Why:** [Why this task is needed / problem it solves]

**Acceptance Criteria:**
- [ ] Criterion 1
- [ ] Criterion 2
- [ ] Criterion 3

## Affected Services

- [ ] Core API (`core/`)
- [ ] Web Client (`clients/web/`)
- [ ] Submission Service (`microservices/submission-service/`)
- [ ] Matchmaking Service (`microservices/matchmaking-service/`)
- [ ] Infrastructure (`infra/`)
- [ ] Documentation only

## Affected Files

**Expected Changes:**
- `path/to/file1.ts` - [type of change]
- `path/to/file2.ts` - [type of change]
- `path/to/file3.md` - [type of change]

## Proof Expectations

**Tests Required:**
- [ ] Unit tests
- [ ] Integration tests
- [ ] Smoke tests
- [ ] Manual validation

**Smoke Flow:**
- [ ] GraphQL smoke test
- [ ] League read smoke
- [ ] Scrim lifecycle smoke
- [ ] Replay submission smoke
- [ ] Web UI smoke

## Escalation Conditions

**Stop and request human input if:**
- [ ] Production credentials needed
- [ ] Auth/identity changes required
- [ ] Destructive data operations
- [ ] Infrastructure changes
- [ ] Cross-lane traffic impact
- [ ] Security implications

**Current Status:** 🟡 IN PROGRESS

---
```

---

## Task Execution Log

Fill out this section as you work on the task.

```markdown
## Execution Log

### Phase 1: Environment Setup

**Commands Run:**
```bash
npm run dev:up
npm run dev:status
```

**Environment Status:**
- [ ] All services healthy
- [ ] Database accessible
- [ ] Message queues connected

**Issues Encountered:**
[Any environment setup issues]

---

### Phase 2: Baseline Validation

**Commands Run:**
```bash
npm run test --workspace=core
npm run dev:smoke
```

**Baseline Status:**
- Tests: X passing, Y failing
- Smoke: PASS/FAIL
- Known issues: [list]

**Issue Reproduction** (for bugfixes):
1. Step 1
2. Step 2
3. Observed: [what happened]
4. Expected: [what should happen]

---

### Phase 3: Implementation

**Changes Made:**

#### Change 1: [Description]
**File:** `path/to/file.ts`

**What Changed:**
```diff
- old code
+ new code
```

**Why:**
[Rationale for this change]

#### Change 2: [Description]
**File:** `path/to/file2.ts`

[Repeat for each change]

**Design Decisions:**
[Any non-obvious choices and rationale]

**Issues Encountered:**
[Any implementation challenges and how resolved]

---

### Phase 4: Validation

**Commands Run:**
```bash
npm run test --workspace=core
npm run dev:smoke
./scripts/harness/collect-artifacts.sh --task <task-name>
```

**Test Results:**
- Unit tests: X passing, Y failing
- Integration tests: X passing, Y failing
- Smoke tests: PASS/FAIL
- Lint: PASS/FAIL
- TypeScript: PASS/FAIL

**Validation Evidence:**
- Artifacts location: `artifacts/latest/`
- Test output: `artifacts/latest/tests/`
- Logs: `artifacts/latest/logs/`

**Issues Found:**
[Any validation failures and how addressed]

---

### Phase 5: Self-Review

**Checklist Completed:** [reports/agent-self-review-checklist.md](../../reports/agent-self-review-checklist.md)

**Self-Review Status:**
- [ ] Code quality checks passed
- [ ] All tests passing
- [ ] Smoke tests passing
- [ ] Documentation updated
- [ ] No secrets committed
- [ ] Backwards compatible
- [ ] Artifacts collected

**Residual Risks:**
[Any remaining concerns or follow-up needed]

---

**Current Status:** 🟢 COMPLETE / 🔴 BLOCKED / 🟡 NEEDS_REVIEW
```

---

## Task Output Template

Fill out this section when completing the task.

```markdown
# Task Completion Summary

## Overview

**Task:** [Task title]
**Classification:** Class A / B / C
**Status:** COMPLETE / NEEDS_REVIEW / BLOCKED
**Date:** YYYY-MM-DD
**Agent:** [Agent ID if applicable]

## What Changed

### Summary
[2-3 sentence description of what was accomplished]

### Files Modified

| File | Change Type | Lines Changed |
|------|-------------|---------------|
| `path/to/file1.ts` | Modified | +50 -20 |
| `path/to/file2.ts` | Added | +100 |
| `path/to/file3.md` | Modified | +10 -5 |

### Detailed Changes

#### Change 1: [Title]
**Location:** `path/to/file1.ts:line1-line2`

**What:**
[Brief description]

**Why:**
[Rationale]

**Impact:**
[What this affects]

[Repeat for each significant change]

## Validation

### Tests Run

| Test Suite | Result | Details |
|------------|--------|---------|
| Unit Tests | ✅ PASS | 25 passing, 0 failing |
| Integration | ✅ PASS | 5 passing, 0 failing |
| Smoke Tests | ✅ PASS | All scenarios passed |
| Lint | ✅ PASS | No errors |
| TypeScript | ✅ PASS | No type errors |

### Commands Executed

```bash
# Environment setup
npm run dev:up
npm run dev:status

# Testing
npm run test --workspace=core
npm run test --workspace=clients/web

# Smoke tests
npm run dev:smoke
npm run verify:tier0 -- local-dev

# Artifact collection
./scripts/harness/collect-artifacts.sh --task <task-name>
```

### Proof of Work

**Artifacts Location:** `artifacts/latest/` or `artifacts/failures/<timestamp>-<task>/`

**Key Evidence:**
- ✅ Test output: `artifacts/latest/tests/test-results.log`
- ✅ Service logs: `artifacts/latest/logs/core.log`
- ✅ GraphQL health: `artifacts/latest/graphql/health-check.json`
- ✅ Git diff: `artifacts/latest/diff/git-diff-full.txt`
- ✅ Summary: `artifacts/latest/summaries/task-completion.md`

## Quality Gates

### Code Quality
- [x] Lint passes without new errors
- [x] TypeScript compiles
- [x] Code follows existing patterns
- [x] Comments added for non-obvious logic

### Testing
- [x] Unit tests added/updated
- [x] All tests pass
- [x] Smoke tests pass
- [x] No regressions introduced

### Documentation
- [x] Docs updated if behavior changed
- [x] README files current
- [x] API changes documented

### Security
- [x] No secrets committed
- [x] Auth checks in place (if applicable)
- [x] Input validation present (if applicable)

### Backwards Compatibility
- [x] Migrations are additive (if any)
- [x] APIs don't break existing clients
- [x] Data changes are backwards compatible

## Residual Risks

**Known Limitations:**
[Any limitations or constraints]

**Follow-up Needed:**
[Any recommended follow-up work]

**Monitoring:**
[Any specific monitoring recommended]

## Next Steps

### For Reviewers

1. **Review Changes:**
   - Check modified files: [list files]
   - Verify test coverage
   - Review artifact evidence

2. **Validate Locally:**
   ```bash
   npm run dev:up
   npm run dev:smoke
   npm run test --workspace=core
   ```

3. **Check Artifacts:**
   ```bash
   ls -la artifacts/latest/
   cat artifacts/latest/summaries/task-completion.md
   ```

### For Deployment

- **Migration Required:** YES / NO
  - [Details if applicable]

- **Config Changes Required:** YES / NO
  - [Details if applicable]

- **Backwards Compatible:** YES / NO
  - [Details if applicable]

- **Deployment Window:** [If applicable]

- **Rollback Plan:** [If applicable]

---

## Appendix

### Related Issues/Tickets
- [Link to issue/ticket]

### Related PRs
- [Link to PR]

### Dependencies
- [Any dependencies on other tasks/PRs]

### References
- [Links to relevant documentation]
```

---

## Quick Reference: Task Class Requirements

### Class A (Safe Autonomous)

**Minimum Requirements:**
- ✅ Syntax validation passes
- ✅ Referenced paths exist
- ✅ No stale references
- ✅ Progress logged

**Proof:**
- Lint output
- Path existence check
- Git diff summary

---

### Class B (Autonomous with Review)

**Minimum Requirements:**
- ✅ All tests pass
- ✅ Smoke tests pass
- ✅ Lint passes
- ✅ TypeScript compiles
- ✅ Artifacts collected
- ✅ Self-review completed
- ✅ Structured summary provided

**Proof:**
- Test output logs
- Smoke test results
- Artifact collection
- Self-review checklist

**Human Review Required:** YES

---

### Class C (Human-Owned)

**Requirements:**
- ✅ Escalation documented
- ✅ Human approval received BEFORE implementation
- ✅ Rollback plan confirmed
- ✅ Deployment impact assessed

**Proof:**
- Escalation documentation
- Human approval message/ticket
- Risk assessment

**Human Review Required:** YES (before implementation)

---

## Example Completed Task

See [reports/agent-harness-progress.md](../../reports/agent-harness-progress.md) for examples of completed task summaries.

---

## Related Documents

- **Task Protocol:** [reports/agent-task-protocol.md](./agent-task-protocol.md)
- **Self-Review Checklist:** [reports/agent-self-review-checklist.md](./agent-self-review-checklist.md)
- **Harness Charter:** [reports/agent-harness-charter.md](./agent-harness-charter.md)
- **Local Runtime:** [reports/agent-harness-local-runtime.md](./agent-harness-local-runtime.md)
