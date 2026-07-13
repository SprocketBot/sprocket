# MLEDB Sunset: Presentation Layer Feature Parity Analysis

## Overview

This document compares the presentation layers:

- **Current (MLEDB-powered):** MLEBot (Discord) — what users have today
- **New (Sprocket-powered):** Sprocket Web + Evidence — what we're building to replace it

The core question: **Can Evidence + Sprocket Web together replace what MLEBot currently provides via Discord?**

---

## 1. Discord Commands: MLEBot (Current) vs Sprocket + Evidence (New)

### MLEBot — What Users Have Today

These are the features users currently access via the Discord bot:

| Command | Description | Output |
|---------|-------------|--------|
| `/lookup <name>` | Player lookup | Player info (name, team, league, salary, scrim points) |
| `/query` | Filter players (FA, RFA, Waivers, Pend) | Paginated list sorted by salary/points/name |
| `/teaminfo <team>` | Full team card | FM, GMs, AGMs, Captains, PR Supports, roster by league, salary cap usage |
| `/salary` | Salary cap info | Salary cap display |
| `/teameligibility` | Team eligibility status | Which players make team eligible |
| `/showusage` | Player usage stats | Usage by role (starting, sub, etc.) |
| `/seasonstats` | Season statistics | Season-level stats |
| `/runroster` | Post roster to channel | Formatted roster message |
| `/regrosterchannel` | Register roster channel | Sets up channel for roster posts |
| `/updatesprocket` | Refresh internal data | Pulls fresh data from Sprocket |
| `/rebuild` | Rebuild bot metadata | Rebuilds cached data |

---

## 2. The New Presentation Layer: What We're Building

### Sprocket Web + Evidence Combined

| Component | What It Provides |
|-----------|------------------|
| **Sprocket Web** | Scrim management, match/fixture submission, auth, admin |
| **Evidence** | Web dashboards: franchises, players, standings, stats, playoffs |

---

## 3. Feature-by-Feature Gap Analysis

### Can the new web UI replace each MLEBot command?

| MLEBot Feature | Evidence | Sprocket Web | Status | Notes |
|----------------|----------|--------------|--------|-------|
| `/lookup` player | ✅ Player pages | ❌ | **PARTIAL** | Evidence has `/players/[id]` but no search/lookup UI |
| `/query` (FA/RFA/Waivers) | ✅ Non-rostered players | ❌ | **MISSING** | Data exists in Evidence but no filter UI |
| `/teaminfo` | ✅ Franchise pages | ❌ | **PARTIAL** | Evidence has `/franchises/[name]` with staff + roster |
| `/salary` | Partial | ❌ | **MISSING** | Franchise pages show roster but no salary cap summary |
| `/teameligibility` | Partial | ❌ | **MISSING** | Player pages show eligibility status, not team-level view |
| `/showusage` | ❌ | ❌ | **MISSING** | No usage statistics in either |
| `/seasonstats` | ✅ Stats pages | ❌ | **PARTIAL** | Evidence has match/scrim stats but not a unified season view |
| `/runroster` | ❌ | ❌ | **MISSING** | Discord-only feature |
| `/regrosterchannel` | ❌ | ❌ | **MISSING** | Discord-only feature |

### What's in the New Stack That MLEBot Doesn't Have

| New Feature | Source | Value |
|-------------|--------|-------|
| Scrim management | Sprocket Web | Create/join/manage scrims |
| Match submission | Sprocket Web | Submit match results with stats |
| Playoffs bracket | Evidence | Visual bracket display |
| Scrim stats (60-day) | Evidence | Detailed scrim performance |
| Leaderboards | Evidence | Top players by stat |
| Standings (conference/division) | Evidence | Full league standings |

---

## 4. Data Point Availability

Comparing whether each data point is available in the new stack:

| Data Point | MLEBot | Evidence | Sprocket Web | New Stack Available? |
|------------|--------|----------|--------------|----------------------|
| Player lookup by name | ✅ | Partial | ❌ | ❌ Search missing |
| Player detail | ✅ | ✅ | ❌ | ✅ |
| Team/franchise detail | ✅ | ✅ | ❌ | ✅ |
| Staff (FM, GM, etc.) | ✅ | ✅ | ❌ | ✅ |
| Roster by league | ✅ | ✅ | ❌ | ✅ |
| Salary cap usage | ✅ | Partial | ❌ | ⚠️ Partial |
| Scrim points | ✅ | ✅ | ❌ | ✅ |
| Eligibility status | ✅ | ✅ | ❌ | ✅ |
| FA/RFA/Waivers lists | ✅ | Partial | ❌ | ⚠️ Data exists, no UI |
| Season standings | - | ✅ | ❌ | ✅ (new!) |
| Match stats | - | ✅ | Partial | ✅ |
| Scrim stats | - | ✅ | ❌ | ✅ (new!) |
| Leaderboards | - | ✅ | ❌ | ✅ (new!) |

---

## 5. Discord-Specific Features (Can't Move to Web)

Some MLEBot features are inherently Discord-only and need Sprocket Discord to handle:

| Feature | Why Discord-only | Sprocket Discord Status |
|---------|------------------|-------------------------|
| Roster posting to channel | Discord channel integration | **NOT BUILT** |
| Register roster channel | Discord channel registration | **NOT BUILT** |
| Bot prefix commands | Text-based command interface | Basic (help, rc) |

---

## 6. The Core Gaps

### Gaps in the New Web UI (Evidence + Sprocket Web)

1. **Player search/lookup** — No way to search for a player by name in web UI
2. **Filtered lists** — No UI for FA/RFA/Waivers/pending player filtering  
3. **Team eligibility summary** — No team-level eligibility view
4. **Usage stats** — No player usage/role statistics
5. **Salary cap summary** — Teams show roster but not compact cap usage

### Gaps in Sprocket Discord

1. **Roster posting** — Can't post formatted roster to Discord channel
2. **Channel registration** — Can't register a channel for roster posts

---

## 7. Recommendations

### To Replace MLEBot, We Need:

**Web (Priority Order):**
1. Add player search/lookup to Evidence or Sprocket Web
2. Add FA/RFA/Waivers filter UI
3. Add team eligibility summary view
4. Improve salary cap display on franchise pages

**Discord (Priority Order):**
1. Add roster posting command (`/runroster` equivalent)
2. Add channel registration command

**New Features We're Getting (Bonus):**
- Standings pages (Evidence already has)
- Playoffs bracket (Evidence already has)
- Scrim stats (Evidence already has)
- Leaderboards (Evidence already has)

---

*Generated: 2025-06-16*
*Sources: MLEBot repo, Evidence repo, Sprocket repo*