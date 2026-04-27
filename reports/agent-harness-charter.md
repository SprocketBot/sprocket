# Agent Harness Charter

## Purpose

This document defines the operating charter for AI agents working in the Sprocket repository. It establishes clear task classifications, escalation boundaries, and proof requirements to ensure safe, effective, and consistent agent operations.

## Task Classifications

All agent tasks fall into one of three classes. Agents MUST identify the class of their task before beginning work and follow the corresponding validation requirements.

### 1. Safe Autonomous (Class A)

**Definition:** Changes with low risk of production impact that agents can execute without human review.

**Allowed changes:**
- Documentation updates (`.md` files, README, guides)
- Agent instructions and operating surface docs
- Harness scripts (`scripts/harness/*`)
- Verification metadata and manifests
- Non-destructive test improvements (adding tests, improving assertions)
- Local developer experience improvements
- Targeted bugfixes with clear, isolated proof
- Configuration files that only affect local development

**Validation requirements:**
- Confirm referenced paths and commands exist
- Run syntax checks on scripts (e.g., `bash -n script.sh`)
- Mention any stale references corrected
- For test changes: run affected test suite

**Examples:**
- Updating `AGENTS.md` with new workflow instructions
- Adding a smoke test to `scripts/harness/`
- Fixing a typo in `LOCAL_DEVELOPMENT.md`
- Adding a new field to `service-manifest.json`

---

### 2. Autonomous with Review (Class B)

**Definition:** Changes that are safe to implement autonomously but require human review before merge or deployment.

**Allowed changes:**
- Targeted bugfixes in application code
- Local dev ergonomics (docker-compose tweaks, env defaults)
- Non-critical service code changes
- UI component updates (non-auth, non-policy)
- Performance improvements with benchmarks
- Refactoring with test coverage

**Validation requirements:**
- Run targeted unit tests for affected modules
- Run at least one relevant smoke or validation command
- Record any blocked proof and why it was blocked
- Provide before/after comparison for behavior changes
- Document test coverage impact

**Examples:**
- Fixing a bug in a core service method
- Improving docker-compose health check timing
- Refactoring a utility function with full test coverage
- Updating a Svelte component's rendering logic

**Review gates:**
- MUST pass all existing tests in affected workspace
- MUST run relevant smoke test (graphql, submission, scrim, or web)
- MUST provide structured summary with proof artifacts
- Human review required before merge to main

---

### 3. Human-Owned / Escalate by Default (Class C)

**Definition:** Changes that require explicit human authorization before implementation. Agents MUST stop and request human input.

**Required escalation:**
- Secrets management or credential handling
- Production infrastructure behavior changes
- Hosted environment promotion logic
- Schema or migration changes with real data implications
- Auth / identity / impersonation changes
- Queue namespace or storage target changes
- Destructive data operations
- Unclear rollback situations
- Cross-lane traffic sharing decisions
- Anything that could affect live user traffic or side effects

**Agent protocol:**
1. Identify that the task is Class C
2. Stop implementation immediately
3. Document what change was requested
4. Explain why it requires human review
5. Suggest safe alternatives if available
6. Wait for explicit human authorization

**Examples:**
- Changing production database connection strings
- Modifying authentication token validation logic
- Updating Pulumi infrastructure definitions
- Altering replay storage bucket configuration
- Changing queue names or message formats
- Modifying data migration scripts

---

## Escalation Boundaries

### When to Stop and Request Human Input

Agents MUST escalate immediately when encountering:

1. **Secret exposure:** Any discovery of hardcoded credentials, tokens, or secrets in code
2. **Production data access:** Requests to query, modify, or migrate production data
3. **Auth/identity changes:** Any modification to authentication, authorization, or user identity systems
4. **Infrastructure drift:** Changes that would cause local/hosted environment divergence
5. **Unclear ownership:** When affected code spans multiple services without clear boundaries
6. **Destructive operations:** Schema drops, data deletions, or irreversible migrations
7. **Cross-lane effects:** Changes that might affect multiple release lanes (main, v1.5, beta)
8. **Security implications:** Any change with potential security impact

### Escalation Protocol

When escalation is required:

```markdown
## Escalation Required

**Task:** [brief description]

**Classification:** Class C (Human-Owned)

**Reason for escalation:**
- [ ] Involves secrets or credentials
- [ ] Affects production infrastructure
- [ ] Modifies auth/identity systems
- [ ] Schema/migration with real data
- [ ] Destructive data operation
- [ ] Cross-lane traffic impact
- [ ] Security implications
- [ ] Other: [specify]

**Requested action:**
[What human input is needed]

**Suggested alternatives:**
[If any safe alternatives exist]

**Blocked files:**
- `path/to/file1.ts`
- `path/to/file2.ts`
```

---

## Proof Requirements by Task Class

### Class A (Safe Autonomous)

**Minimum proof:**
- [ ] Syntax validation (for scripts/code)
- [ ] Path existence confirmation
- [ ] Stale reference check

**Example validation:**
```bash
# For script changes
bash -n scripts/harness/my-script.sh

# For docs
grep -r "old-path" reports/ || echo "No stale references"
```

---

### Class B (Autonomous with Review)

**Minimum proof:**
- [ ] All existing tests pass in affected workspace
- [ ] New tests added for new behavior
- [ ] Relevant smoke test passes
- [ ] Lint passes without new errors
- [ ] TypeScript compilation succeeds
- [ ] Structured summary with artifacts

**Example validation:**
```bash
# Run affected tests
npm run test --workspace=core -- --testPathPattern=affected-module

# Run smoke test
npm run dev:smoke

# Check lint
npm run lint --workspace=core

# Build verification
npm run build --workspace=core
```

**Artifact collection:**
For Class B changes, agents MUST collect:
- Test output logs
- Smoke test results
- Git diff summary
- Any error messages encountered

---

### Class C (Human-Owned)

**Proof requirements:**
- [ ] Escalation documented with full context
- [ ] Affected systems identified
- [ ] Risk assessment provided
- [ ] Rollback strategy outlined (if applicable)

**Human validation:**
Human reviewers must provide:
- Explicit approval for the specific change
- Rollback plan confirmation
- Deployment window (if production-impacting)
- Monitoring requirements

---

## Risk Classification Matrix

| Change Type | Data Impact | User Impact | Reversibility | Classification |
|-------------|-------------|-------------|---------------|----------------|
| Docs update | None | None | Instant | Class A |
| Test addition | None | None | Instant | Class A |
| Harness script | Local only | None | Easy | Class A |
| Bugfix (isolated) | Test data only | None | Easy | Class B |
| Service refactor | Test data only | None | Medium | Class B |
| Schema migration | Production data | Potential | Hard | Class C |
| Auth change | Credentials | High | Hard | Class C |
| Infra change | Infrastructure | High | Hard | Class C |
| Secret rotation | Credentials | High | Medium | Class C |

---

## Artifact Requirements

### For Success Cases

Collect artifacts that prove the change works:

```
artifacts/
  latest/
    metadata.json          # timestamp, git SHA, agent ID
    summary.md             # what changed, why, proof
    tests/                 # test output logs
    smoke/                 # smoke test results
    diff/                  # git diff summary
```

### For Failure Cases

Collect diagnostic artifacts:

```
artifacts/
  failures/
    <timestamp>-<task>/
      error.log            # full error output
      environment.json     # env state at failure
      logs/                # service logs
      screenshots/         # UI failures (if applicable)
      reproduction.md      # steps to reproduce
```

---

## Multi-Agent Coordination

### Claiming Work

When multiple agents may work concurrently:

1. **Announce scope:** State which files/subsystems you're touching
2. **Check for conflicts:** Search for other agents working in same area
3. **Prefer additive changes:** Add new files/docs rather than refactoring existing
4. **Avoid cross-cutting churn:** Don't reformat or cleanup unrelated code
5. **Update progress log:** Log discoveries in `reports/agent-harness-progress.md`

### Handoff Protocol

When handing off work to another agent:

```markdown
## Handoff Summary

**Completed:**
- [task items completed]

**In Progress:**
- [task items partially done]

**Blocked:**
- [blocked items with reason]

**Next Steps:**
1. [immediate next action]
2. [subsequent actions]

**Artifacts:**
- `path/to/artifact1`
- `path/to/artifact2`

**Branch:** `issue/agent-operating-surface`
**Commit:** `abc123...`
```

---

## Validation Commands Reference

### Local Environment

```bash
# Boot full stack
npm run dev:up

# Stop all services
npm run dev:down

# Reset to clean state
npm run dev:reset

# Check service health
npm run dev:status

# View logs
npm run dev:logs -- <service>

# Run smoke tests
npm run dev:smoke
```

### Hosted Verification

```bash
# Tier 0 (syntax, lint, basic health)
npm run verify:tier0 -- <lane>

# Tier 1 (scenario-based smoke)
npm run verify:tier1 -- <lane> <profile> <suite>

# Full verification
npm run verify:all -- <lane> <profile>
```

### Testing

```bash
# Core tests
npm run test --workspace=core

# Lint
npm run lint --workspace=<workspace>

# Build
npm run build --workspace=<workspace>
```

---

## Compliance Checklist

Before claiming a task complete, agents MUST verify:

### For All Tasks
- [ ] Task classification identified (A, B, or C)
- [ ] Appropriate proof collected
- [ ] Artifacts stored in correct location
- [ ] Progress logged in `reports/agent-harness-progress.md`

### For Class B Tasks (Review Required)
- [ ] All tests pass
- [ ] Smoke test passes
- [ ] Lint passes
- [ ] TypeScript compiles
- [ ] Structured summary provided
- [ ] Human review requested

### For Class C Tasks (Escalation Required)
- [ ] Escalation documented
- [ ] Human approval received BEFORE implementation
- [ ] Rollback plan confirmed
- [ ] Deployment impact assessed

---

## Revision History

- **v1.0 (2026-04-21):** Initial charter created as part of Issue #3: Agent Operating Surface
- Defines task classes, escalation boundaries, and proof requirements
- Establishes artifact collection discipline
- Provides multi-agent coordination protocols
