BEGIN TRANSACTION;
DO
$$
    DECLARE
        mle_org_id               numeric;
        rl_game_id               numeric;
        rl_doubles_game_mode_id  numeric;
        rl_standard_game_mode_id numeric;
        conference_type_id       numeric;
        orange_conf_id           numeric;
        blue_conf_id             numeric;
        division_type_id         numeric;
    BEGIN
        INSERT INTO sprocket.organization DEFAULT VALUES RETURNING id INTO mle_org_id;
        INSERT INTO sprocket.organization_profile ("organizationId", "name", "description", "websiteUrl",
                                                   "primaryColor",
                                                   "secondaryColor",
                                                   "logoUrl")
        VALUES (mle_org_id, 'Minor League Esports', 'Minor League Esports', 'https://mlesports.gg', '#2A4B82',
                '#FFFFFF',
                'https://mlesports.gg/wp-content/uploads/logo-mle-256.png');

        INSERT INTO sprocket.game ("title") VALUES ('Rocket League') RETURNING id INTO rl_game_id;
        INSERT INTO sprocket.game_mode ("code", "description", "teamSize", "teamCount", "gameId")
        VALUES ('RL_DOUBLES', 'Doubles', 1, 2, rl_game_id)
        RETURNING id INTO rl_doubles_game_mode_id;
        INSERT INTO sprocket.game_mode ("code", "description", "teamSize", "teamCount", "gameId")
        VALUES ('RL_STANDARD', 'Standard', 1, 2, rl_game_id)
        RETURNING id INTO rl_standard_game_mode_id;

        -- CONFERENCES --
        INSERT INTO sprocket.franchise_group_type ("code", "description")
        VALUES ('CONF', 'Conference')
        RETURNING id INTO conference_type_id;

        INSERT INTO sprocket.franchise_group ("typeId") VALUES (conference_type_id) RETURNING id INTO orange_conf_id;
        INSERT INTO sprocket.franchise_group ("typeId") VALUES (conference_type_id) RETURNING id INTO blue_conf_id;

        INSERT INTO sprocket.franchise_group_profile ("name", "groupId")
        VALUES ('Orange', orange_conf_id),
               ('Blue', blue_conf_id);

        -- DIVISIONS --
        INSERT INTO sprocket.franchise_group_type ("code", "description")
        VALUES ('DIV', 'Division')
        RETURNING id INTO division_type_id;

        INSERT INTO mledb_bridge.division_to_franchise_group ("divison", "franchiseGroupId") (SELECT "name", nextval('sprocket."franchise_group_id_seq"')
                                                                                              FROM mledb.division
                                                                                              WHERE conference != 'META');

        INSERT INTO sprocket.franchise_group ("id", "typeId", "parentGroupId") (SELECT "franchiseGroupId", division_type_id, orange_conf_id
                                                                                FROM mledb_bridge.division_to_franchise_group AS BRIDGE
                                                                                         LEFT JOIN mledb.division AS MLEDB ON MLEDB.name = BRIDGE.divison
                                                                                WHERE MLEDB.conference = 'ORANGE');

        INSERT INTO sprocket.franchise_group ("id", "typeId", "parentGroupId") (SELECT "franchiseGroupId", division_type_id, blue_conf_id
                                                                                FROM mledb_bridge.division_to_franchise_group AS BRIDGE
                                                                                         LEFT JOIN mledb.division AS MLEDB ON MLEDB.name = BRIDGE.divison
                                                                                WHERE MLEDB.conference = 'BLUE');

        INSERT INTO sprocket.franchise_group_profile ("name", "groupId") (SELECT BRIDGE.divison, SPR.id
                                                                          FROM sprocket.franchise_group AS SPR
                                                                                   LEFT JOIN mledb_bridge.division_to_franchise_group AS BRIDGE
                                                                                             ON BRIDGE."franchiseGroupId" = SPR.id);

        -- FRANCHISES --
        INSERT INTO mledb_bridge.team_to_franchise ("team", "franchiseId") (SELECT "name", nextval('sprocket."franchise_id_seq"')
                                                                            FROM mledb.team
                                                                            WHERE division_name != 'Meta');

        INSERT INTO sprocket.franchise ("id", "organizationId") (SELECT "franchiseId", mle_org_id FROM mledb_bridge.team_to_franchise);

        INSERT INTO sprocket.franchise_profile ("franchiseId", "title", "code", "primaryColor", "secondaryColor") (SELECT SPR.id,
                                                                                                                          MLEDB.name,
                                                                                                                          MLEDB.callsign,
                                                                                                                          BRANDING.primary_color,
                                                                                                                          BRANDING.secondary_color
                                                                                                                   FROM sprocket.franchise AS SPR
                                                                                                                            LEFT JOIN mledb_bridge.team_to_franchise AS BRIDGE
                                                                                                                                      ON BRIDGE."franchiseId" = SPR.id
                                                                                                                            LEFT JOIN mledb.team AS MLEDB ON MLEDB.name = BRIDGE.team
                                                                                                                            LEFT JOIN mledb.team_branding AS BRANDING ON BRANDING.team_name = MLEDB.name);

        -- USERS --
        INSERT INTO mledb_bridge.player_to_user ("playerId", "userId") (SELECT id, nextval('sprocket."user_id_seq"') FROM mledb.player);
        INSERT INTO sprocket."user" (id) (SELECT "userId" FROM mledb_bridge.player_to_user);
        INSERT INTO sprocket."user_profile" ("userId", "displayName", "email") (SELECT "userId",
                                                                                       (SELECT name
                                                                                        FROM mledb.player
                                                                                        WHERE "id" = mledb_bridge.player_to_user."playerId"),
                                                                                       'unknown@sprocket.gg' AS "email"
                                                                                FROM mledb_bridge.player_to_user);
    end
$$;

ROLLBACK;