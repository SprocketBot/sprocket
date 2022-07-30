-- This should not be taken as a "run and done" script; as there was a lot of handholding and double-checking along the way.
-- However, it does provide the basic guidelines of setting this up 0-to-hero
BEGIN TRANSACTION;
DO
$$
    DECLARE
        ----------
        -- Predetermined
        ----------
        rl_game_id         NUMERIC;
        spr_org_id         NUMERIC;
        this_week          TIMESTAMP;
        ----------
        -- Dynamic
        ----------
        -- Franchise Group Types
        conference_type_id NUMERIC;
        division_type_id   NUMERIC;
        -- Conferences
        orange_conf_id     NUMERIC;
        blue_conf_id       NUMERIC;
        -- Divisions
        pond_div_id        NUMERIC;
        back_div_id        NUMERIC;
        -- Franchises
        frg_franchise_id   NUMERIC;
        btr_franchise_id   NUMERIC;
        ghp_franchise_id   NUMERIC;
        tur_franchise_id   NUMERIC;
        -- Schedule Group Types
        week_type_id       NUMERIC;
        season_type_id     NUMERIC;
        -- Schedule Groups
        s1_id              NUMERIC;
        w1_id              NUMERIC;
        w2_id              NUMERIC;
        w3_id              NUMERIC;
        w4_id              NUMERIC;
        -- Skill Groups
        gear_sg_id         NUMERIC;
        bolt_sg_id         NUMERIC;

    BEGIN
        SELECT id FROM game WHERE title = 'Rocket League' INTO rl_game_id;
        SELECT "organizationId" FROM organization_profile WHERE name = 'Sprocket' INTO spr_org_id;
        SELECT DATE_TRUNC('week', CURRENT_TIMESTAMP) + INTERVAL '1 week' INTO this_week;

        -- Conference Setup
        INSERT INTO sprocket.franchise_group_type ( code, description )
            VALUES ( 'CONF', 'Conference' )
            RETURNING id INTO conference_type_id;

        INSERT INTO sprocket.franchise_group ( "typeId" )
            VALUES ( conference_type_id )
            RETURNING id INTO orange_conf_id;

        INSERT INTO sprocket.franchise_group ( "typeId" )
            VALUES ( conference_type_id )
            RETURNING id INTO blue_conf_id;

        INSERT INTO sprocket.franchise_group_profile ( name, "groupId" )
            VALUES ( 'Orange', orange_conf_id ),
                   ( 'Blue', blue_conf_id );

        -- Division Setup
        INSERT INTO sprocket.franchise_group_type ( code, description )
            VALUES ( 'DIV', 'Division' )
            RETURNING id INTO division_type_id;

        INSERT INTO sprocket.franchise_group ( "typeId", "parentGroupId" )
            VALUES ( division_type_id, blue_conf_id )
            RETURNING id INTO pond_div_id;

        INSERT INTO sprocket.franchise_group ( "typeId", "parentGroupId" )
            VALUES ( division_type_id, orange_conf_id )
            RETURNING id INTO back_div_id;

        INSERT INTO sprocket.franchise_group_profile ( name, "groupId" )
            VALUES ( 'Pond', pond_div_id ),
                   ( 'Backyard', back_div_id );

        -- Franchise Setup

        INSERT INTO sprocket.franchise ( "organizationId" ) VALUES ( 1 ) RETURNING id INTO frg_franchise_id;
        INSERT INTO sprocket.franchise ( "organizationId" ) VALUES ( 1 ) RETURNING id INTO tur_franchise_id;

        INSERT INTO sprocket.franchise ( "organizationId" ) VALUES ( 1 ) RETURNING id INTO ghp_franchise_id;
        INSERT INTO sprocket.franchise ( "organizationId" ) VALUES ( 1 ) RETURNING id INTO btr_franchise_id;

        INSERT INTO sprocket.franchise_profile ( title, code, "primaryColor", "secondaryColor", "franchiseId" )
            VALUES ( 'Frogs', 'FRG', '#E91C24', '#350307', frg_franchise_id ),
                   ( 'Butterflies', 'BTR', '#131547', '#e8bdf9', btr_franchise_id ),
                   ( 'Grasshoppers', 'GHP', '#1d7d0f', 'eaea3d', ghp_franchise_id ),
                   ( 'Turtles', 'TUR', '#777f2d', '#ebe39d', tur_franchise_id );

        -- Assign Franchises
        INSERT INTO sprocket.franchise_group_assignment ( "franchiseId", "groupId", "gameId" )
            VALUES ( frg_franchise_id, pond_div_id, rl_game_id ),
                   ( tur_franchise_id, pond_div_id, rl_game_id ),
                   ( ghp_franchise_id, pond_div_id, rl_game_id ),
                   ( btr_franchise_id, pond_div_id, rl_game_id );


        -- Schedule Group Types
        INSERT INTO sprocket.schedule_group_type ( name, code, "organizationId" )
            VALUES ( 'Week', 'WK', 1 )
            RETURNING id INTO week_type_id;

        INSERT INTO sprocket.schedule_group_type ( name, code, "organizationId" )
            VALUES ( 'Season', 'S', 1 )
            RETURNING id INTO season_type_id;


        -- Schedule Groups
        INSERT INTO sprocket.schedule_group ( start, "end", description, "typeId", "gameId" )
            VALUES (
                   this_week, this_week + INTERVAL '2 months', 'Season 1', season_type_id,
                   rl_game_id )
            RETURNING id INTO s1_id;

        INSERT INTO sprocket.schedule_group ( start, "end", description, "typeId", "gameId", "parentGroupId" )
            VALUES (
                       this_week + INTERVAL '1 week', this_week + INTERVAL '2 week', 'Match 1', week_type_id,
                       rl_game_id, s1_id )
            RETURNING id INTO w1_id;

        INSERT INTO sprocket.schedule_group ( start, "end", description, "typeId", "gameId", "parentGroupId" )
            VALUES (
                       this_week + INTERVAL '2 week' + INTERVAL '1 day', this_week + INTERVAL '3 week', 'Match 2',
                       week_type_id, rl_game_id, s1_id )
            RETURNING id INTO w2_id;

        INSERT INTO sprocket.schedule_group ( start, "end", description, "typeId", "gameId", "parentGroupId" )
            VALUES (
                       this_week + INTERVAL '3 week' + INTERVAL '1 day', this_week + INTERVAL '4 week', 'Match 3',
                       week_type_id, rl_game_id, s1_id )
            RETURNING id INTO w3_id;

        INSERT INTO sprocket.schedule_group ( start, "end", description, "typeId", "gameId", "parentGroupId" )
            VALUES (
                       this_week + INTERVAL '4 week' + INTERVAL '1 day', this_week + INTERVAL '5 week', 'Match 4',
                       week_type_id, rl_game_id, s1_id )
            RETURNING id INTO w4_id;

        INSERT INTO sprocket.schedule_fixture ( "scheduleGroupId", "homeFranchiseId", "awayFranchiseId" )
            VALUES ( w1_id, frg_franchise_id, tur_franchise_id ),
                   ( w1_id, btr_franchise_id, ghp_franchise_id ),

                   ( w2_id, btr_franchise_id, frg_franchise_id ),
                   ( w2_id, ghp_franchise_id, tur_franchise_id ),

                   ( w3_id, tur_franchise_id, btr_franchise_id ),
                   ( w3_id, frg_franchise_id, ghp_franchise_id ),

                   ( w4_id, ghp_franchise_id, btr_franchise_id ),
                   ( w4_id, tur_franchise_id, frg_franchise_id );


        -- Skill Group Setup
        WITH rrul AS (
            INSERT INTO sprocket.roster_role_use_limits (code, "perMode", total, "groupTypeId")
                VALUES ( 'GEAR', 0, 8, season_type_id )
                RETURNING id)
        INSERT
            INTO sprocket.game_skill_group ( ordinal, "salaryCap", "gameId", "roleUseLimitsId", "organizationId" )
        SELECT 1, 100, rl_game_id, id, spr_org_id
            FROM rrul
            RETURNING id INTO gear_sg_id;


        WITH rrul AS (
            INSERT INTO sprocket.roster_role_use_limits (code, "perMode", total, "groupTypeId")
                    VALUES ( 'BOLT', 0, 8, season_type_id )
                RETURNING id)
        INSERT
            INTO sprocket.game_skill_group ( ordinal, "salaryCap", "gameId", "roleUseLimitsId", "organizationId" )
        SELECT 1, 100, rl_game_id, id, spr_org_id
            FROM rrul
            RETURNING id INTO bolt_sg_id;

        INSERT INTO sprocket.game_skill_group_profile ( code, description, "skillGroupId" )
            VALUES ( 'GEAR', 'Gear League', gear_sg_id ),
                   ( 'BOLT', 'Bolt League', bolt_sg_id );


        -- Match Parents

        WITH fixture_combos       AS (SELECT schedule_fixture.id AS sfid, game_skill_group.id AS gsgid
                                          FROM sprocket.schedule_fixture
                                                   CROSS JOIN sprocket.game_skill_group
                                          WHERE schedule_fixture.id IN (w1_id, w2_id, w3_id, w4_id)
                                            AND game_skill_group."organizationId" = spr_org_id),
             create_match_parents AS (
                 INSERT INTO sprocket.match_parent ("fixtureId")
                     SELECT sfid FROM fixture_combos
                     RETURNING id AS mpid, "fixtureId" AS sfid)
        INSERT
            INTO sprocket.match ( "submissionId", "skillGroupId", "matchParentId" )
        SELECT CONCAT('match-', gen_random_uuid()),
               gsgid,
               mpid
            FROM fixture_combos
                     INNER JOIN create_match_parents ON create_match_parents.sfid = fixture_combos.sfid;
    END;
$$;
-- COMMIT;

ROLLBACK;
