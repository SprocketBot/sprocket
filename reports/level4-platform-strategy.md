# Sprocket Level 4 Spec: Platform Strategy and Evolution Model

This level describes the system as a product and platform strategy rather than as an architecture.

It captures what Sprocket is trying to preserve for the organization over time, which outcomes matter most, and how future changes should be evaluated.

## 1. Strategic Role

Sprocket is the league operations backbone for a competitive Rocket League community.

Its strategic role is to:
- convert messy, real-world competition activity into trusted league outcomes,
- reduce the amount of human coordination required to keep competition moving,
- make the operational surface feel native to where the community already lives, especially Discord.

## 2. Core Value Proposition

Sprocket creates value when it makes competitive operations feel both trustworthy and lightweight.

That value comes from four promises:
- evidence-backed results instead of manual score reporting,
- real-time operational feedback instead of staff chasing people down,
- policy enforcement that scales across organizations,
- compatibility with legacy league processes while the platform modernizes.

## 3. Strategic Outcomes

If the system is working as intended, it should reliably produce these outcomes:
- league matches progress from scheduled play to accepted result with minimal moderator intervention,
- scrims are easy to enter but hard to abuse,
- disputes are narrowed to explicit evidence and policy states rather than informal memory,
- communications reach users in the channels where they are already active,
- staff can change rules and integrations without engineering involvement.

## 4. Operating Model

Sprocket is not just an app. It is an operational control system with three connected loops:

Competition loop:
- players play games,
- the platform gathers evidence,
- official outcomes are produced.

Coordination loop:
- the platform pushes status and next actions,
- players and staff respond inside web and Discord surfaces,
- the platform updates shared state in near real time.

Governance loop:
- admins set policy,
- the system applies policy during workflows,
- staff review exceptions rather than manually enforcing every case.

## 5. Product Principles

Changes to the system should preserve these principles:
- Trust beats convenience when competition results are at stake.
- Users should see the next required action without needing staff explanation.
- Discord is part of the product, not just an alert sink.
- Human moderation should focus on exceptions, not routine workflow advancement.
- Organization-specific behavior should come from configuration, not forks.
- Legacy compatibility is a migration tool, not the end-state platform identity.

## 6. Investment Themes

The current system implies a medium-term strategy around a few themes.

Theme 1: Evidence pipeline hardening
- make replay submission, ratification, and finalization more transparent and easier to audit,
- reduce ambiguous or partial completion states.

Theme 2: Policy centralization
- make authorization, ratification thresholds, queue restrictions, and moderation outcomes more explicit and easier to reason about.

Theme 3: Operational surface quality
- keep web and Discord experiences aligned around the same workflow states,
- reduce gaps where users need staff interpretation.

Theme 4: Compatibility containment
- isolate MLEDB-era bridging behind narrower seams so the main platform model can evolve without drag.

Theme 5: Observability and operator confidence
- improve the ability to answer "what happened, why, and what happens next" for every critical lifecycle.

## 7. Roadmap Shape

A sensible roadmap for this system should generally move in this order:

1. Strengthen correctness and traceability in evidence-heavy flows.
2. Simplify policy expression and remove duplicated decision logic.
3. Improve operator tooling and user guidance around live workflows.
4. Reduce compatibility and infrastructure drag behind stable interfaces.
5. Optimize cost, latency, and deployment ergonomics after the above are stable.

This order matters because performance or platform simplification work has limited value if competition outcomes still require manual interpretation.

## 8. Decision Heuristics

Future work should be favored when it does one or more of the following:
- reduces moderator toil without weakening evidence integrity,
- makes workflow state easier for users to understand,
- decreases the number of places where policy is encoded,
- narrows the gap between authoritative backend state and user-visible state,
- removes hidden coupling while keeping capability boundaries intact.

Future work should be viewed skeptically when it:
- bypasses evidence or ratification controls for speed,
- introduces new user actions that are not reflected in shared domain state,
- duplicates org-policy logic in clients or edge workflows,
- deepens dependence on legacy models instead of containing them.

## 9. Strategic Risks

The main risks implied by the current shape of the system are:
- policy complexity becoming too distributed to change safely,
- compatibility code slowing down core model improvements,
- event-driven behavior becoming harder to reason about without stronger traceability,
- user trust degrading if live UI state and final authoritative state diverge for too long.

## 10. Success Measures

At this level, success is better measured by operational outcomes than by service-local metrics.

Useful measures would include:
- time from match completion to accepted official result,
- percentage of submissions requiring manual intervention,
- scrim abandonment or timeout rates,
- notification timeliness for high-value events,
- number of org-specific behaviors handled by configuration rather than custom code.

## 11. End-State Direction

The likely long-term direction is a platform where:
- competition policy is explicit and centrally legible,
- evidence pipelines are deterministic and observable,
- Discord and web are two coordinated surfaces over the same operational model,
- legacy compatibility remains available but no longer dictates core design choices.

## 12. Relationship to Earlier Levels

- Level 1 describes the public code surface.
- Level 2 describes subsystem behavior and collaboration.
- Level 3 describes architectural intent and stable boundaries.
- Level 4 (this document) describes strategic purpose, investment direction, and decision criteria.

This level should support future work such as modernization plans, roadmap proposals, or architecture review without needing to start from implementation detail.
