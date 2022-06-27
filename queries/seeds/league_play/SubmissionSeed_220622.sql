-- This should not be taken as a "run and done" script; as there was a lot of handholding and double-checking along the way.
-- However, it does provide the basic guidelines of setting this up 0-to-hero

BEGIN TRANSACTION;
-- Set up Franchises
INSERT INTO sprocket.franchise_profile (title, code)
VALUES ('Frogs', 'FRG'),
       ('Butterflies', 'BTR'),
       ('Grasshoppers', 'GHP'),
       ('Turtles', 'TUR');

INSERT INTO sprocket.franchise ("profileId")
SELECT ID
FROM sprocket.franchise_profile
WHERE CODE IN ('FRG', 'BTR', 'GHP', 'TUR');

-- -- Set up League Structure Groups
INSERT INTO sprocket.franchise_group_type (code, description)
VALUES ('CONF', 'Conference'),
       ('DIV', 'Division');

-- Build Conference Profiles
INSERT INTO sprocket.franchise_group_profile (name)
VALUES ('Orange'),
       ('Blue');

-- Build Conferences
INSERT INTO sprocket.franchise_group ("profileId", "typeId")
SELECT fgp.id, fgt.id
from sprocket.franchise_group_profile fgp
         CROSS JOIN sprocket.franchise_group_type fgt
WHERE fgt.code = 'CONF'
  AND fgp.name in ('Orange', 'Blue');

-- Build Division Profiles
INSERT INTO sprocket.franchise_group_profile (name)
VALUES ('Pond'),
       ('Backyard');

INSERT INTO sprocket.franchise_group ("profileId", "typeId", "parentGroupId")
SELECT fgp.id,
       fgt.id,
       (select _fg.id
        from sprocket.franchise_group _fg
                 INNER JOIN sprocket.franchise_group_profile _fgp
                            ON _fg."profileId" = _fgp.id
        WHERE _fgp.name = 'Blue')
from sprocket.franchise_group_profile fgp
         CROSS JOIN sprocket.franchise_group_type fgt
WHERE fgt.code = 'DIV'
  AND fgp.name in ('Pond', 'Backyard');

INSERT INTO sprocket.franchise_group_assignment
    ("franchiseId", "groupId", "gameId")
SELECT f.id                                                         as franchiseId,
       (select franchise_group.id
        from sprocket.franchise_group
                 INNER JOIN sprocket.franchise_group_profile ON franchise_group."profileId" = franchise_group_profile.id
        WHERE name = 'Pond')                                        as groupId,
       (select id from sprocket.game where title = 'Rocket League') as gameId
from sprocket.franchise f
         INNER JOIN sprocket.franchise_profile ON f."profileId" = franchise_profile.id
WHERE code in ('FRG', 'TUR')
UNION
SELECT f.id,
       (select franchise_group.id
        from sprocket.franchise_group
                 INNER JOIN sprocket.franchise_group_profile ON franchise_group."profileId" = franchise_group_profile.id
        WHERE name = 'Backyard'),
       (select id from sprocket.game where title = 'Rocket League')
from sprocket.franchise f
         INNER JOIN sprocket.franchise_profile ON f."profileId" = franchise_profile.id
WHERE code in ('GHP', 'BTR');



SELECT f.id, fp.code, fp.title, fgp.name
FROM franchise f
         INNER JOIN franchise_profile fp on f."profileId" = fp.id
         INNER JOIN franchise_group_assignment fga on f.id = fga."franchiseId"
         INNER JOIN franchise_group fg on fga."groupId" = fg.id
         INNER JOIN franchise_group_profile fgp on fg."profileId" = fgp.id
ROLLBACK;

BEGIN TRANSACTION;
INSERT INTO sprocket.schedule_group_type (name, code, "organizationId")
SELECT 'Week',
       'WK',
       (SELECT organization.ID
        FROM sprocket.organization
                 INNER JOIN sprocket.organization_profile
                            ON organization."organizationProfileId" = organization_profile.id
        WHERE name = 'Sprocket')
UNION
SELECT 'Season',
       'S',
       (SELECT organization.ID
        FROM sprocket.organization
                 INNER JOIN sprocket.organization_profile
                            ON organization."organizationProfileId" = organization_profile.id
        WHERE name = 'Sprocket');

INSERT INTO sprocket.schedule_group (start, "end", description, "typeId", "gameId")
VALUES ('07/01/2022'::timestamp, '08/01/2022'::timestamp, 'Season 1',
        (SELECT id from sprocket.schedule_group_type WHERE code = 'S'),
        (SELECT id from sprocket.game WHERE title = 'Rocket League'));

INSERT INTO sprocket.schedule_group (start, "end", description, "typeId", "gameId", "parentGroupId")
VALUES ('07/01/2022'::timestamp, '07/07/2022'::timestamp, 'Match 1',
        (select id from sprocket.schedule_group_type WHERE code = 'WK'),
        (SELECT id from sprocket.game WHERE title = 'Rocket League'),
        (SELECT id from sprocket.schedule_group WHERE description = 'Season 1')),
       ('07/08/2022'::timestamp, '07/14/2022'::timestamp, 'Match 2',
        (select id from sprocket.schedule_group_type WHERE code = 'WK'),
        (SELECT id from sprocket.game WHERE title = 'Rocket League'),
        (SELECT id from sprocket.schedule_group WHERE description = 'Season 1')),
       ('07/15/2022'::timestamp, '07/21/2022'::timestamp, 'Match 3',
        (select id from sprocket.schedule_group_type WHERE code = 'WK'),
        (SELECT id from sprocket.game WHERE title = 'Rocket League'),
        (SELECT id from sprocket.schedule_group WHERE description = 'Season 1')),
       ('07/22/2022'::timestamp, '07/30/2022'::timestamp, 'Match 4',
        (select id from sprocket.schedule_group_type WHERE code = 'WK'),
        (SELECT id from sprocket.game WHERE title = 'Rocket League'),
        (SELECT id from sprocket.schedule_group WHERE description = 'Season 1'))


INSERT INTO sprocket.schedule_fixture ("scheduleGroupId", "homeFranchiseId", "awayFranchiseId")
VALUES (17, 45, 48),
       (17, 46, 47),

       (18, 46, 45),
       (18, 47, 48),

       (19, 48, 46),
       (19, 45, 47),

       (20, 47, 46),
       (20, 48, 45);
COMMIT;

INSERT INTO sprocket.match_parent ("fixtureId")
SELECT schedule_fixture.id
FROM sprocket.schedule_fixture
CROSS JOIN sprocket.game_skill_group -- one match for each skill group and each skill group
WHERE "scheduleGroupId" IN (SELECT schedule_group.id
                            from sprocket.schedule_group
                                     INNER JOIN sprocket.schedule_group parent on schedule_group."parentGroupId" = parent.id
                            WHERE parent.description = 'Season 1');

INSERT INTO sprocket.match ("matchParentId", "skillGroupId", "submissionId")
SELECT mpid, gsgid, concat('match-', gen_random_uuid()) FROM (
    select id as mpid, row_number() over (partition by "fixtureId") as rn, "fixtureId"
    FROM sprocket.match_parent
    WHERE "fixtureId" is not null
              ) A
JOIN (
    SELECT id as gsgid, row_number() over () as rn FROM sprocket.game_skill_group
) B ON A.rn = B.rn;

ROLLBACK;
