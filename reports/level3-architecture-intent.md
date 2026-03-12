# Sprocket Level 3 Spec: Architecture Intent and Capability Design

This level describes what the system is for, what outcomes it must reliably produce, and what architectural boundaries should remain stable as implementation details change.

It intentionally abstracts away class/module mechanics from Level 1 and subsystem runtime wiring from Level 2.

## 1. Product Mission

Sprocket exists to run organized esports competition with credible, enforceable outcomes.

Its core promise is to:
- convert gameplay evidence into trusted league state,
- reduce manual operational burden for staff and moderators,
- keep players, league ops, and community channels synchronized in near real time.

## 2. Stakeholders and Operating Surfaces

Human stakeholders:
- Players: queue for scrims, submit/ratify evidence, receive lobby/results/moderation updates.
- League operations staff: resolve disputes, manage scheduling and submission workflows, enforce policy.
- Admins: control organization-specific behavior and integration settings.

User-facing operating surfaces:
- `clients/web`: primary league/scrim workflow interface.
- `clients/discord-bot`: chat-native command and notification surface where communities coordinate.
- `clients/image-generation-frontend`: operator tooling for report card templates and run controls.

## 3. Capability Architecture

### 3.1 Competitive Lifecycle Capability

Purpose:
- represent seasons, fixtures, and matches as actionable competition units with clear ownership and lifecycle state.

Required outcomes:
- every relevant competition unit has a deterministic evidence workflow,
- completion state is visible to authorized users,
- finalized results become durable and queryable for downstream uses.

### 3.2 Real-Time Scrim Capability

Purpose:
- provide low-friction pickup competition while enforcing fairness, check-in compliance, and anti-abuse constraints.

Required outcomes:
- queue participation invariants are enforced continuously,
- scrim state transitions are deterministic and observable,
- moderation actions can be automated from runtime events.

### 3.3 Replay Evidence Capability

Purpose:
- treat replay files as authoritative evidence that must pass parse, validation, and ratification gates before affecting official state.

Required outcomes:
- full traceability from upload to final accept/reject,
- actionable failure feedback for participants and staff,
- no official result mutation without evidence gate completion.

### 3.4 Communication Capability

Purpose:
- project critical domain transitions into user communication channels without polling reliance.

Required outcomes:
- high-value events are pushed quickly and to the right audience,
- Discord remains a first-class operational surface,
- report cards and policy outcomes are published from trusted domain transitions.

### 3.5 Governance Capability

Purpose:
- allow organizations to tune operational policy (for example ratification thresholds, queue-ban timing, webhook routing) without code changes.

Required outcomes:
- policy remains org-scoped and explicit,
- policy effects are consistent across backend decisions and user-facing behavior.

### 3.6 Compatibility Capability

Purpose:
- preserve interoperability with legacy MLEDB-facing stakeholders while Sprocket-native models evolve.

Required outcomes:
- compatibility behavior remains behind bounded interfaces,
- migration can proceed incrementally without service interruption.

## 4. Authority and Ownership Model

Stable architectural ownership:
- `core`: canonical policy and durable competition domain source.
- `matchmaking-service`: ephemeral, high-churn scrim runtime state.
- `submission-service`: replay evidence state machine and validation/ratification progression.
- `notification-service`: notification orchestration and targeting.
- `image-generation-service`: media rendering execution.
- `server-analytics-service`: telemetry ingestion and write path.
- `common`: inter-service contracts and transport abstractions.

Client surfaces consume and influence this model but do not own canonical competition truth.

## 5. Interaction Model

Sprocket intentionally combines:
- synchronous request/response paths for user intent capture and immediate reads,
- asynchronous event/job paths for fan-out work, long-running processing, and external delivery.

System rule of thumb:
- intent enters through stable APIs,
- specialized services execute domain-specific workflows,
- durable state converges in canonical stores,
- side effects (notifications, media, telemetry, role sync) are event-triggered.

## 6. System Priorities

Design priority order:
1. Competitive correctness and policy integrity.
2. Operational responsiveness for live workflows.
3. Auditability of state transitions and moderation/evidence decisions.
4. Org-specific configurability without per-org forks.
5. Performance optimization after correctness and traceability.

## 7. Architectural Invariants

Commitments that should remain true regardless of implementation:
- Official results cannot finalize without evidence validation and ratification completion.
- A player cannot hold conflicting active scrim participation states.
- Authorization/policy decisions stay org-aware end to end.
- High-impact side effects are triggered from domain events, not ad hoc client actions.
- Live client state converges from backend authoritative events, not only optimistic local state.

## 8. Tradeoffs and Tension Lines

Intentional tradeoffs:
- eventual consistency in exchange for decoupled side-effect pipelines,
- mixed storage patterns (durable relational + fast ephemeral + compatibility projections) for fit-for-purpose behavior,
- centralized policy with distributed execution to minimize policy drift.

Persistent tension lines:
- compatibility burden vs modernization velocity,
- shared infrastructure pressure where high-churn runtime and queueing intersect,
- convenience of central enrichment vs coupling and blast radius.

## 9. Anti-Goals

This architecture is not optimizing for:
- fully independent microservices with no shared contracts,
- elimination of all eventual consistency windows,
- offline-first client operation as a primary mode,
- replacing policy correctness with pure throughput maximization.

## 10. Evolution Guardrails

Preferred evolution path:
- preserve capability boundaries while simplifying internals,
- keep policy logic explicit and discoverable,
- isolate compatibility paths behind stricter contracts,
- improve end-to-end observability for evidence and moderation decisions.

Red flags for future changes:
- business policy duplicated across multiple entry points with divergence risk,
- side effects initiated directly from UI without domain event linkage,
- expansion of cross-service assumptions without contract hardening/versioning.

## 11. Level Relationship

- Level 1: module/class public interface inventory.
- Level 2: subsystem runtime behavior and collaboration.
- Level 3 (this doc): capability intent, architectural commitments, and evolution constraints.

This progression preserves traceability while moving from implementation detail toward design strategy.
