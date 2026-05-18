# Scheduling & Franchise Migration Implementation Plan

**Created:** May 18, 2026  
**Context:** Gap analysis combining May 17th database schema comparison + Nigel's corrections

---

## 1. Schema Mapping Summary

| mLEDB Entity | Sprocket Entity | Notes |
|--------------|-----------------|-------|
| `season` | `ScheduleGroup` | ✓ Already exists |
| `division` | **NEW: `Division`** | ❌ Missing in sprocket schema |
| `match` | `ScheduleGroup` → child | Match within a season |
| `fixture` | `ScheduleFixture` | ✓ Already exists |
| `series` | `Match` | ✓ Already exists (Sprocket calls it Match) |
| `team_to_captain` | `FranchiseStaffSeat` | **DEPRECATED** - migrate to staff seat |

---

## 2. Gaps Identified

### A. Scheduling Domain

| Gap | Severity | Description |
|-----|----------|-------------|
| **Division Model** | HIGH | No Division entity in sprocket schema. Teams belong to divisions in mLEDB. |
| **Division → Franchise Link** | HIGH | Need Division FK on Franchise (not ScheduleGroup - teams belong to divisions) |
| **Season → Division Logic** | MEDIUM | How to handle seasons spanning multiple divisions? |

### B. Franchise Staff Domain

| Gap | Severity | Description |
|-----|----------|-------------|
| **CAPTAIN Role** | HIGH | FranchiseStaffRole enum has CAPTAIN (value=4) but no sprocket FranchiseStaffRole entry |
| **Captain Appointments** | MEDIUM | No migration path from mLEDB TeamToCaptain → FranchiseStaffAppointment (NOT FranchiseLeadershipAppointment - captains are staff, not leadership) |

---

## 3. Implementation Plan

### Phase 1: Schema Changes (New Models)

#### 3.1 Create Division Model

```typescript
// core/src/database/scheduling/division/division.model.ts
@Entity({schema: "sprocket"})
@ObjectType()
export class Division extends BaseModel {
  @Column()
  @Field(() => String)
  name: string;

  @Column({nullable: true})
  @Field(() => String, {nullable: true})
  description?: string;

  @Column({nullable: true})
  @Field(() => String, {nullable: true})
  conference?: string;  // From mLEDB Conference enum

  @ManyToOne(() => Game)
  @Field(() => Game)
  game: Game;

  @OneToMany(() => ScheduleGroup, sg => sg.division)
  @Field(() => [ScheduleGroup], {nullable: true})
  seasons: ScheduleGroup[];
}
```

#### 3.2 Add Division Link to Franchise (not ScheduleGroup)

Teams belong to divisions in mLEDB, so Division FK belongs on Franchise:

```typescript
// Add to Franchise model:
@ManyToOne(() => Division, {nullable: true})
@Field(() => Division, {nullable: true})
division: Division;

@Column({nullable: true})
divisionId: number;
```

#### 3.3 (REMOVED) Match Fields

*matchNumber and isDoubleHeader are not needed in sprocket - these can be safely omitted.*

#### 3.4 Add CAPTAIN to FranchiseStaffRole (if not exists)

Check if CAPTAIN role exists in seed data. If not, add migration to insert it.

---

### Phase 2: Migration Scripts (Data Backfill)

#### 3.5 Division Migration

```sql
-- Create sprocket.division table (run via TypeORM migration)
INSERT INTO sprocket.division (id, name, conference, game_id, created_at, updated_at)
SELECT 
  row_number() OVER () as id,
  name,
  conference,
  (SELECT id FROM sprocket.game WHERE name = 'Rocket League'),
  now(),
  now()
FROM mledb.division;
```

#### 3.6 Division → Franchise Migration

```sql
-- Migrate divisions and link to franchises
INSERT INTO sprocket.division (id, name, conference, game_id, created_at, updated_at)
SELECT 
  row_number() OVER () as id,
  name,
  conference,
  (SELECT id FROM sprocket.game WHERE name = 'Rocket League'),
  now(),
  now()
FROM mledb.division;

-- Link franchises to divisions via existing team mappings
UPDATE sprocket.franchise f
SET division_id = d.id
FROM mledb.team t
JOIN mledb.division d ON d.name = t.division_name
WHERE f.mle_franchise_id = t.franchise_id;
```

#### 3.7 ScheduleGroup (Season) Migration

```sql
-- Migrate seasons from mLEDB (already exists - just documenting)
-- ScheduleGroup in sprocket captures both Season (parent) and MatchWeek (child)
-- via parentGroup/childGroups relationships
```

#### 3.8 ScheduleFixture Migration

```sql
-- Migrate fixtures from mLEDB
INSERT INTO sprocket.schedule_fixture (id, schedule_group_id, home_franchise_id, away_franchise_id, created_at, updated_at)
SELECT 
  f.id,
  m.season,  -- schedule_group_id
  (SELECT fr.id FROM sprocket.franchise fr JOIN mledb.team t ON t.franchise_id = fr.id WHERE t.team_name = f.home_name),
  (SELECT fr.id FROM sprocket.franchise fr JOIN mledb.team t ON t.franchise_id = fr.id WHERE t.team_name = f.away_name),
  f.created_at,
  f.updated_at
FROM mledb.fixture f
JOIN mledb.match m ON m.id = f.match_id;
```

#### 3.9 MatchParent/Match Migration

```sql
-- Migrate series to Match/MatchParent
INSERT INTO sprocket.match_parent (id, created_at, updated_at)
SELECT s.id, s.created_at, s.updated_at
FROM mledb.series s;

INSERT INTO sprocket.match (id, is_dummy, skill_group_id, match_parent_id, submission_status, can_submit, can_ratify, created_at, updated_at)
SELECT 
  s.id,
  false,
  (SELECT id FROM sprocket.game_skill_group WHERE name = s.league), -- Need mapping
  s.id,
  CASE WHEN s.submission_timestamp IS NOT NULL THEN 'completed' ELSE 'submitting' END,
  true,
  false,
  s.created_at,
  s.updated_at
FROM mledb.series s;
```

#### 3.10 Captain Migration (TeamToCaptain → FranchiseStaffSeat)

```sql
-- Get or create CAPTAIN role
INSERT INTO sprocket.franchise_staff_role (id, name, ordinal, bearer_id, game_id, created_at, updated_at)
SELECT 100, 'CAPTAIN', 100, pb.id, g.id, now(), now()
FROM sprocket.permission_bearer pb
CROSS JOIN sprocket.game g
WHERE pb.name = 'FRANCHISE_STAFF' AND g.name = 'Rocket League'
ON CONFLICT DO NOTHING;

-- Create captain appointments
INSERT INTO sprocket.franchise_staff_appointment (id, franchise_id, member_id, seat_id, created_at, updated_at)
SELECT 
  tc.id,
  fr.id,
  (SELECT m.id FROM sprocket.member m JOIN mledb.player p ON p.member_id = m.id WHERE p.id = tc.player_id),
  (SELECT fss.id FROM sprocket.franchise_staff_seat fss 
   JOIN sprocket.franchise_staff_role fsr ON fss.role_id = fsr.id 
   WHERE fsr.name = 'CAPTAIN'),
  tc.created_at,
  tc.updated_at
FROM mledb.team_to_captain tc
JOIN mledb.team t ON t.team_name = tc.team_name AND t.league = tc.league
JOIN sprocket.franchise fr ON fr.mle_franchise_id = t.franchise_id;
```

---

### Phase 3: Code Updates (Service Layer)

#### 3.11 Update Service Files

Need to update service files that reference the old models:
- `franchise.service.ts` - add division queries
- `scheduling.service.ts` - add season/division queries
- `mledb-bridge.service.ts` - update bridge logic

#### 3.12 API/GraphQL Updates

- Add Division to GraphQL schema
- Add division to ScheduleGroup queries
- Add captain field via FranchiseStaffAppointment queries

---

## 4. Migration Dependencies

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   mledb.division│────▶│ sprocket.division│────▶│   Franchise     │
└─────────────────┘     └──────────────────┘     └─────────────────┘
                                                        │
┌─────────────────┐                                     │
│   mledb.season  │────▶│ScheduleGroup                  │
└─────────────────┘     │ (parent = season,             │
                        │  child = matchweek)           │
                        └──────────────────────────────┘
                                      │
┌─────────────────┐                    ▼
│   mledb.fixture │────▶│ScheduleFixture
└─────────────────┘    └────────────────────┘
                             │
┌─────────────────┐           ▼
│   mledb.match   │     ┌────────────────────┐
└─────────────────┘     │   MatchParent      │
                        └────────────────────┘
                             │
┌─────────────────┐           ▼
│   mledb.series  │────▶│     Match          │
└─────────────────┘     └────────────────────┘

┌──────────────────────┐     ┌───────────────────────┐
│ mledb.team_to_captain│────▶│FranchiseStaffAppointment
└──────────────────────┘     │ (via FranchiseStaffSeat)
                             └───────────────────────┘
```

---

## 5. Implementation Order

1. **Create Division model** + migration
2. **Add Division FK to Franchise** + migration (teams belong to divisions)
3. **Seed CAPTAIN role** (if missing)
4. **Run data migrations** (division, season, fixture, match, captain)
5. **Update services** to use new models
6. **Update API** for new fields
7. **Deprecate mledb-bridge** mappings (optional, post-migration)

---

## 6. Testing Plan

- [ ] Division CRUD operations
- [ ] Franchise.division relationship
- [ ] ScheduleFixture queries with division filter (via franchise)
- [ ] Captain queries via FranchiseStaffAppointment
- [ ] End-to-end: mLEDB data visible in sprocket schema

---

## 7. Open Questions

1. **Division naming** - Should divisions be tied to seasons, or are they global? (mLEDB has divisions per league)
2. **SkillGroup mapping** - How to map mLEDB league (string) → sprocket GameSkillGroup?
3. **Franchise mapping** - How is mLEDB team.franchise_id linked to sprocket Franchise?
4. **Rollback strategy** - Need to preserve mledb data or can we truncate post-migration?

---

*This plan should be reviewed before implementation. Some migrations may require additional research on existing data relationships.*