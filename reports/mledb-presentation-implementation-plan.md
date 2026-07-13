# MLEDB Sunset: Presentation Layer Implementation Plan

## Overview

This plan details the implementation for the presentation layer migration following the strategy:

1. **Phase 1:** Build presentation layers (MLEDB-backed)
2. **Phase 2:** Dual read + metrics
3. **Phase 3:** Switch to Sprocket-only (feature flag)
4. **Phase 4:** Delete old code paths

---

## Phase 1: Sprocket Web Features

### 1.1 Player Lookup

**Priority:** P1 (Highest)

**MLEDB Source Tables:**
- `mledb.player` — name, salary, skill_group
- `mledb.player_account` — platform accounts
- `mledb.player_to_org` — org membership, status

**Implementation:**

| Task | Description |
|------|-------------|
| 1.1.1 | Create GraphQL query `getPlayerByName(name: String!)` in `PlayerResolver` |
| 1.1.2 | Create GraphQL query `searchPlayers(query: String!, limit: Int)` for autocomplete |
| 1.1.3 | Add MLEDB data source to resolver (read from `mledb.player`, `mledb.player_account`) |
| 1.1.4 | Create Svelte page `/players/[id]` with player detail |
| 1.1.5 | Create player search component for `/players` index |
| 1.1.6 | Add navigation link in header |

**API Response Shape:**
```graphql
type PlayerDetail {
  id: Int!
  name: String!
  salary: Float!
  scrimPoints: Int
  eligibilityStatus: EligibilityStatus!
  skillGroup: SkillGroup!
  franchise: Franchise
  memberId: Int
  platformAccounts: [PlatformAccount!]!
}
```

**MLEDB Query:**
```sql
SELECT 
  p.id, p.name, p.salary, p.skill_group,
  pto.status as org_status,
  mp.platform_type, mp.platform_id
FROM mledb.player p
LEFT JOIN mledb.player_to_org pto ON p.id = pto."playerId"
LEFT JOIN mledb.player_account mp ON p.id = mp."playerId"
WHERE LOWER(p.name) LIKE LOWER($1)
```

---

### 1.2 Team/Franchise Info

**Priority:** P1

**MLEDB Source Tables:**
- `mledb.team` — name, code, colors
- `mledb.team_to_captain` — captain info
- `mledb.team_branding` — logo, colors
- `mledb.player` with franchise link — roster

**Implementation:**

| Task | Description |
|------|-------------|
| 1.2.1 | Create GraphQL query `getFranchiseByName(name: String!)` |
| 1.2.2 | Create GraphQL query `getAllFranchises` for index |
| 1.2.3 | Add franchise staff resolver (FM, GM, AGM, Captains) from MLEDB |
| 1.2.4 | Create Svelte page `/franchises/[name]` |
| 1.2.5 | Create franchise index page `/franchises` |
| 1.2.6 | Add navigation link in header |

**API Response Shape:**
```graphql
type FranchiseDetail {
  id: Int!
  name: String!
  code: String!
  logo: String
  primaryColor: String
  secondaryColor: String
  conference: String
  division: String
  franchiseManager: StaffMember
  generalManagers: [StaffMember!]!
  assistantGMs: [StaffMember!]!
  captains: [StaffMember!]!
  roster: [PlayerRosterEntry!]!
  salaryCapSummary: SalaryCapSummary!
}
```

---

### 1.3 FA/RFA/Waivers Lists

**Priority:** P1

**MLEDB Source Tables:**
- `mledb.player` — all players
- `mledb.player_to_org` — org membership status

**Implementation:**

| Task | Description |
|------|-------------|
| 1.3.1 | Create GraphQL query `getFreeAgents(league: String)` |
| 1.3.2 | Create GraphQL query `getRestrictedFreeAgents(league: String)` |
| 1.3.3 | Create GraphQL query `getWaiverClaims(league: String)` |
| 1.3.4 | Create Svelte page `/players/free-agents` with filter tabs |
| 1.3.5 | Add sorting by salary, scrim points, name |

**MLEDB Query Logic:**
- **FA:** `player_to_org.status = 'FA'`
- **RFA:** `player_to_org.status = 'RFA'`
- **Waivers:** `player_to_org.status = 'WAIVERS'`

---

### 1.4 Salary Cap Summary

**Priority:** P2

**MLEDB Source Tables:**
- `mledb.salary_cap` — cap by league
- `mledb.player` — player salaries

**Implementation:**

| Task | Description |
|------|-------------|
| 1.4.1 | Add salary cap field to franchise detail query |
| 1.4.2 | Calculate cap usage from roster salaries |
| 1.4.3 | Show signable amount for each league |

---

### 1.5 Team Eligibility

**Priority:** P2

**MLEDB Source Tables:**
- `mledb.eligibility_data` — player eligibility
- `mledb.player` — roster

**Implementation:**

| Task | Description |
|------|-------------|
| 1.5.1 | Create GraphQL query `getTeamEligibility(teamId: Int!)` |
| 1.5.2 | List players meeting eligibility threshold |
| 1.5.3 | Create eligibility status badge component |

---

### 1.6 Usage Stats (Optional)

**Priority:** P3

**MLEDB Source Tables:**
- `mledb.team_role_usage`

---

## Phase 1 Summary: Sprocket Web Routes

| Route | Description | Status |
|-------|-------------|--------|
| `/players` | Player index + search | TODO |
| `/players/[id]` | Player detail | TODO |
| `/players/free-agents` | FA/RFA/Waivers | TODO |
| `/franchises` | Franchise index | TODO |
| `/franchises/[name]` | Franchise detail | TODO |

---

## Phase 2: Dual Read + Metrics

### Implementation Pattern

For each new query, implement dual-read:

```typescript
// Example: player.service.ts
async getPlayerByName(name: string, source: 'mledb' | 'sprocket' | 'auto' = 'auto') {
  const readSource = source === 'auto' ? config.readSource : source;
  
  const [mledbResult, sprocketResult] = await Promise.all([
    this.getPlayerFromMledb(name),
    this.getPlayerFromSprocket(name),
  ]);

  // Emit metrics
  await this.analyticsService.track('player_lookup_read', {
    readSource,
    mledbResult: !!mledbResult,
    sprocketResult: !!sprocketResult,
    match: this.comparePlayers(mledbResult, sprocketResult),
    divergedFields: this.getDivergedFields(mledbResult, sprocketResult),
  });

  if (readSource === 'mledb') return mledbResult;
  return sprocketResult;
}
```

### Metrics to Emit

| Metric | Description |
|--------|-------------|
| `read_source_used` | Which source was returned |
| `read_latency_ms` | Time taken by each source |
| `data_match` | Whether MLEDB and Sprocket data match |
| `diverged_fields` | List of fields that differ |
| `null_mismatch` | When one source returns null but other doesn't |

### Feature Flags

```typescript
// config
presentation: {
  playerLookup: {
    readSource: 'mledb' | 'sprocket' | 'dual',
  },
  franchiseDetail: {
    readSource: 'mledb' | 'sprocket' | 'dual',
  },
}
```

---

## Phase 3: Flip to Sprocket-Only

Flip feature flags one feature at a time after metrics show <1% divergence:

```yaml
# config for production flip
presentation:
  playerLookup:
    readSource: 'sprocket'  # switch from 'dual'
```

---

## Phase 4: Delete Old Code

After dual-read shows stable data for N days:
1. Remove MLEDB query code from resolvers
2. Remove MLEDB data source dependencies
3. Remove bridge table reads
4. (Later) Drop MLEDB tables per migration plan

---

## Task Breakdown by Priority

### Sprint 1-2: Player Lookup (P1)

- [ ] 1.1.1 GraphQL query `getPlayerByName`
- [ ] 1.1.2 GraphQL query `searchPlayers`
- [ ] 1.1.3 MLEDB data source in resolver
- [ ] 1.1.4 Svelte page `/players/[id]`
- [ ] 1.1.5 Player search component
- [ ] 1.1.6 Header navigation

### Sprint 2-3: Franchise Info (P1)

- [ ] 1.2.1 GraphQL query `getFranchiseByName`
- [ ] 1.2.2 GraphQL query `getAllFranchises`
- [ ] 1.2.3 Franchise staff resolver
- [ ] 1.2.4 Svelte page `/franchises/[name]`
- [ ] 1.2.5 Franchise index page
- [ ] 1.2.6 Header navigation

### Sprint 3-4: FA/RFA/Waivers (P1)

- [ ] 1.3.1 GraphQL query `getFreeAgents`
- [ ] 1.3.2 GraphQL query `getRestrictedFreeAgents`
- [ ] 1.3.3 GraphQL query `getWaiverClaims`
- [ ] 1.3.4 Svelte page with filter tabs
- [ ] 1.3.5 Sorting

### Sprint 5: Salary Cap + Eligibility (P2)

- [ ] 1.4.1-1.4.3 Salary cap summary
- [ ] 1.5.1-1.5.3 Team eligibility

### Sprint 6-8: Dual Read + Metrics (Phase 2)

- [ ] Add dual-read pattern to all resolvers
- [ ] Add analytics tracking
- [ ] Configure feature flags
- [ ] Monitor metrics

### Sprint 9-10: Phase 3 + 4

- [ ] Flip feature flags to sprocket-only
- [ ] Remove MLEDB code paths

---

## Evidence (Phase 1 continued)

After Sprocket Web features, move to Evidence:

| Feature | Evidence Page | Priority |
|---------|---------------|----------|
| Standings | `/season/standings` | P1 |
| Leaderboards | `/season/leaderboard` | P1 |
| Season stats | `/season/match_stats` | P2 |
| Playoffs | `/season/playoffs` | P2 |
| Scrim stats | `/season/scrim_stats` | P2 |

Evidence already has these pages — they just need to be reconfigured to read from MLEDB schema initially, then dual-read, then switch to Sprocket.

---

*Generated: 2026-06-16*
*Last Updated: 2026-06-16*