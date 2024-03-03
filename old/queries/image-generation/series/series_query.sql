WITH vars                   AS (SELECT $1::NUMERIC AS series_id,
                                       $2::NUMERIC AS org_id),

     colors                 AS (SELECT *
                                    FROM (VALUES ( 1, '#F54C91' ),
                                                 ( 2, '#0097D7' ),
                                                 ( 3, '#189666' ),
                                                 ( 4, '#DE7327' ),
                                                 ( 5, '#FDBD2A' ),
                                                 ( 6, '#1D308F' ),
                                                 ( 7, '#FDBD2A' ),
                                                 ( 8, '#1D308F' )) t1 (number, color)),

     match_data             AS (SELECT sr.id   AS series_replay_id,
                                       sr.duration,
                                       sr.overtime,
                                       sr.overtime_seconds,
                                       sr.winning_team_name,
                                       CASE
                                           WHEN sr.winning_team_name = f.home_name
                                               THEN f.away_name
                                           ELSE f.home_name
                                           END AS losing_team_name,
                                       sr.winning_color,
                                       sr.series_id,
                                       s.league,
                                       s.mode,
                                       f.home_name,
                                       f.away_name,
                                       f.match_id
                                    FROM mledb.series_replay sr
                                             INNER JOIN vars v
                                                        ON v.series_id = sr.series_id
                                             INNER JOIN mledb.series s
                                                        ON v.series_id = s.id
                                             INNER JOIN mledb.fixture f
                                                        ON f.id = s.fixture_id
                                    WHERE sr.series_id = v.series_id),


     organization           AS (SELECT JSONB_BUILD_OBJECT('type', 'text', 'value', op.name)              AS name,
                                       JSONB_BUILD_OBJECT('type', 'text', 'value', op.description)       AS description,
                                       JSONB_BUILD_OBJECT('type', 'text', 'value', op."websiteUrl")      AS webisite,
                                       JSONB_BUILD_OBJECT('type', 'color', 'value', op."primaryColor")   AS primary_color,
                                       JSONB_BUILD_OBJECT('type', 'color', 'value', op."secondaryColor") AS secondary_color,
                                       JSONB_BUILD_OBJECT('type', 'image', 'value', op."logoUrl")        AS logo_url

                                    FROM sprocket.organization_profile op
                                             INNER JOIN vars v
                                                        ON op."organizationId" = v.org_id),
     player_table           AS (WITH data AS (SELECT s.id      AS series_id,
                                                     sr.id     AS replay_id,
                                                     sr.winning_color,
                                                     psc.mvpr,
                                                     psc.score,
                                                     psc.goals,
                                                     psc.assists,
                                                     psc.saves,
                                                     psc.shots,
                                                     psc.gpi,
                                                     p.name    AS player_name,
                                                     p.salary,
                                                     psc.color AS player_team_color

                                                  FROM vars v
                                                           INNER JOIN mledb.series s
                                                                      ON v.series_id = s.id
                                                           INNER JOIN mledb.series_replay sr
                                                                      ON sr.series_id = s.id
                                                           INNER JOIN mledb.player_stats_core psc
                                                                      ON sr.id = psc.replay_id
                                                           INNER JOIN mledb.player p
                                                                      ON psc.player_id = p.id)
                                SELECT d.series_id,
                                       d.replay_id,
                                       d.winning_color,
                                       m.winning_team_name,
                                       tb.primary_color   AS winning_team_primary,
                                       tb.secondary_color AS winning_team_secondary,
                                       d.mvpr,
                                       d.score,
                                       d.goals,
                                       d.assists,
                                       d.saves,
                                       d.shots,
                                       d.gpi,
                                       d.player_name,
                                       d.salary,
                                       d.player_team_color,
                                       m.home_name,
                                       CASE
                                           WHEN d.player_team_color = m.winning_color THEN m.winning_team_name
                                           ELSE m.losing_team_name
                                           END            AS player_team_name

                                    FROM data d
                                             INNER JOIN match_data m
                                                        ON d.replay_id = m.series_replay_id
                                             INNER JOIN mledb.team_branding tb
                                                        ON m.winning_team_name = tb.team_name),
     game_stats             AS (SELECT pt.*,
                                       tb.primary_color   AS team_primary,
                                       tb.secondary_color AS team_secondary
                                    FROM player_table pt
                                             INNER JOIN mledb.team_branding tb
                                                        ON pt.player_team_name = tb.team_name),

     match_info             AS (WITH series_score AS (SELECT md.series_id,
                                                             md.mode,
                                                             md.league,
                                                             COUNT(DISTINCT md.series_replay_id)
                                                             FILTER (WHERE md.winning_team_name = md.home_name) AS home_wins,
                                                             COUNT(DISTINCT md.series_replay_id)
                                                             FILTER (WHERE md.winning_team_name = md.away_name) AS away_wins,
                                                             CONCAT(
                                                                             COUNT(DISTINCT md.series_replay_id)
                                                                             FILTER (WHERE md.winning_team_name = md.home_name),
                                                                             ' - ',
                                                                             COUNT(DISTINCT md.series_replay_id)
                                                                             FILTER (WHERE md.winning_team_name = md.away_name)
                                                                 )                                              AS series_score,
                                                             md.home_name,
                                                             md.away_name,
                                                             md.match_id
                                                          FROM match_data md
                                                          GROUP BY md.series_id, md.mode, md.league, md.home_name,
                                                                   md.away_name, md.match_id)

                                SELECT ss.series_id,
                                       m.season,
                                       m.match_number,
                                       ss.league,
                                       ss.mode,
                                       ss.home_wins,
                                       ss.away_wins,
                                       ss.series_score,
                                       ss.home_name,
                                       tb.primary_color    AS home_team_primary,
                                       tb.secondary_color  AS home_team_secondary,
                                       tb.logo_img_link    AS home_team_logo,
                                       ss.away_name,
                                       tb2.primary_color   AS away_team_primary,
                                       tb2.secondary_color AS away_team_secondary,
                                       tb2.logo_img_link   AS away_team_logo,
                                       CASE
                                           WHEN ss.home_wins > ss.away_wins THEN ss.home_name
                                           ELSE ss.away_name
                                           END             AS winning_team_name,
                                       CASE
                                           WHEN ss.home_wins > ss.away_wins THEN tb.primary_color
                                           ELSE tb2.primary_color
                                           END             AS winning_team_primary,
                                       CASE
                                           WHEN ss.home_wins > ss.away_wins THEN tb.secondary_color
                                           ELSE tb2.secondary_color
                                           END             AS winning_team_secondary,
                                       CASE
                                           WHEN ss.home_wins > ss.away_wins THEN tb.logo_img_link
                                           ELSE tb2.logo_img_link
                                           END             AS winning_team_logo
                                    FROM series_score ss
                                             INNER JOIN mledb.match m
                                                        ON ss.match_id = m.id
                                             INNER JOIN mledb.team_branding tb
                                                        ON ss.home_name = tb.team_name
                                             INNER JOIN mledb.team_branding tb2
                                                        ON ss.away_name = tb2.team_name),


     empty_players          AS (SELECT JSONB_BUILD_OBJECT('type', 'text', 'value', ''),
                                       v.series_id
                                    FROM vars v),

     home_players           AS (WITH hp AS
                                         (SELECT DISTINCT(JSONB_BUILD_OBJECT('type', 'text', 'value', player_name)) AS home_players,
                                                         series_id
                                              FROM player_table
                                              WHERE player_team_name = home_name
                                          UNION ALL
                                          SELECT *
                                              FROM empty_players
                                          UNION ALL
                                          SELECT *
                                              FROM empty_players)
                                SELECT JSON_AGG(home_players) AS home_players,
                                       series_id
                                    FROM hp
                                    GROUP BY series_id),

     away_players           AS (WITH ap AS
                                         (SELECT DISTINCT(JSONB_BUILD_OBJECT('type', 'text', 'value', player_name)) AS away_players,
                                                         series_id
                                              FROM player_table
                                              WHERE player_team_name != home_name
                                          UNION ALL
                                          SELECT *
                                              FROM empty_players
                                          UNION ALL
                                          SELECT *
                                              FROM empty_players)
                                SELECT JSON_AGG(away_players) AS away_players,
                                       series_id
                                    FROM ap
                                    GROUP BY series_id),


     game_object            AS (SELECT JSONB_BUILD_OBJECT('type', 'text', 'value',
                                                          CONCAT('WEEK ', mi.match_number, ' ', LEFT(mi.league, 1),
                                                                 'L ',
                                                                 CASE
                                                                     WHEN mode = 'STANDARD' THEN '3S '
                                                                     WHEN mode = 'DOUBLES' THEN '2S '
                                                                     END
                                                              ))                                                                              AS title,
                                       JSONB_BUILD_OBJECT('type', 'text', 'value', CONCAT(UPPER(LEFT(mode, 1)),
                                                                                          LOWER(SUBSTRING(mode, 2, LENGTH(mode)))))           AS game_mode,
                                       JSONB_BUILD_OBJECT('type', 'text', 'value',
                                                          CASE
                                                              WHEN mode = 'STANDARD' THEN '3S'
                                                              WHEN mode = 'DOUBLES' THEN '2S'
                                                              WHEN mode = 'SOLO' THEN '1S'
                                                              END)                                                                            AS mode_short,
                                       JSONB_BUILD_OBJECT('type', 'text', 'value', CONCAT(UPPER(LEFT(mi.league, 1)),
                                                                                          LOWER(SUBSTRING(mi.league, 2, LENGTH(mi.league))))) AS league,
                                       JSONB_BUILD_OBJECT('type', 'text', 'value',
                                                          CONCAT(LEFT(mi.league, 1), 'L'))                                                    AS league_short,
                                       JSONB_BUILD_OBJECT('type', 'color', 'value', lb.color)                                                 AS league_color,
                                       JSONB_BUILD_OBJECT('type', 'image', 'value', lb.badge_img_link)                                        AS league_logo,
                                       JSONB_BUILD_OBJECT('type', 'text', 'value', mi.home_name)                                              AS home_team_name,
                                       JSONB_BUILD_OBJECT('type', 'color', 'value', mi.home_team_primary)                                     AS home_team_primary,
                                       JSONB_BUILD_OBJECT('type', 'color', 'value', mi.home_team_secondary)                                   AS home_team_secondary,
                                       JSONB_BUILD_OBJECT('type', 'image', 'value', mi.home_team_logo)                                        AS home_team_logo,
                                       JSONB_BUILD_OBJECT('type', 'text', 'value', mi.away_name)                                              AS away_team_name,
                                       JSONB_BUILD_OBJECT('type', 'color', 'value', mi.away_team_primary)                                     AS away_team_primary,
                                       JSONB_BUILD_OBJECT('type', 'color', 'value', mi.away_team_secondary)                                   AS away_team_secondary,
                                       JSONB_BUILD_OBJECT('type', 'image', 'value', mi.away_team_logo)                                        AS away_team_logo,
                                       JSONB_BUILD_OBJECT('type', 'color', 'value', mi.winning_team_name)                                     AS winning_team_name,
                                       JSONB_BUILD_OBJECT('type', 'color', 'value', mi.winning_team_primary)                                  AS winning_team_primary,
                                       JSONB_BUILD_OBJECT('type', 'color', 'value',
                                                          mi.winning_team_secondary)                                                          AS winning_team_secondary,
                                       JSONB_BUILD_OBJECT('type', 'image', 'value', mi.winning_team_logo)                                     AS winning_team_logo,
                                       hp.home_players,
                                       ap.away_players,
                                       JSON_BUILD_OBJECT('type', 'text', 'value', series_score)                                               AS series_score
                                    FROM match_info mi
                                             INNER JOIN mledb.league_branding lb
                                                        ON mi.league = lb.league
                                             INNER JOIN home_players hp
                                                        ON hp.series_id = mi.series_id
                                             INNER JOIN away_players ap
                                                        ON ap.series_id = mi.series_id),

     player_stats           AS (WITH records
                                         AS (SELECT COUNT(CASE WHEN winning_color = player_team_color THEN 1 END)  AS wins,
                                                    COUNT(CASE WHEN winning_color != player_team_color THEN 1 END) AS losses,
                                                    player_name
                                                 FROM game_stats
                                                 GROUP BY player_name),

                                     t   AS (SELECT gs.player_name  AS                       name,
                                                    gs.salary       AS                       salary,
                                                    re.wins,
                                                    re.losses,
                                                    gs.team_primary,
                                                    gs.team_secondary,
                                                    AVG(
                                                            CASE
                                                                WHEN gpi = 0 THEN mvpr
                                                                ELSE gpi
                                                                END
                                                        )           AS                       rating,
                                                    SUM(gs.goals)   AS                       goals,
                                                    SUM(gs.assists) AS                       assists,
                                                    SUM(gs.saves)   AS                       saves,
                                                    SUM(gs.shots)   AS                       shots,
                                                    RANK() OVER (ORDER BY AVG(gs.mvpr) DESC) rank
                                                 FROM game_stats gs
                                                          INNER JOIN records re
                                                                     ON gs.player_name = re.player_name
                                                 GROUP BY gs.player_name, salary, re.wins, re.losses, gs.team_primary,
                                                          gs.team_secondary
                                                 ORDER BY wins DESC, rating DESC)
                                SELECT t.name,
                                       t.wins,
                                       t.losses,
                                       CONCAT(t.wins, ' - ', t.losses)     AS record,
                                       ROUND(CAST(t.rating AS NUMERIC), 2) AS rating,
                                       t.goals,
                                       t.saves,
                                       t.shots,
                                       t.assists,
                                       t.salary,
                                       t.team_primary,
                                       t.team_secondary,
                                       c.color                             AS player_color
                                    FROM t
                                             INNER JOIN colors c
                                                        ON t.rank = c.number),

     player_stats_object    AS (WITH blank_player_data_json
                                         AS (SELECT JSONB_BUILD_OBJECT('type', 'text', 'value', '')           AS name,
                                                    JSON_BUILD_OBJECT('type', 'number', 'value', '')          AS salary,
                                                    JSONB_BUILD_OBJECT('type', 'number', 'value', '')         AS wins,
                                                    JSONB_BUILD_OBJECT('type', 'number', 'value', '')         AS losses,
                                                    JSONB_BUILD_OBJECT('type', 'text', 'value', '')           AS record,
                                                    JSONB_BUILD_OBJECT('type', 'number', 'value', '')         AS rating,
                                                    JSONB_BUILD_OBJECT('type', 'number', 'value', '')         AS goals,
                                                    JSONB_BUILD_OBJECT('type', 'number', 'value', '')         AS assists,
                                                    JSONB_BUILD_OBJECT('type', 'number', 'value', '')         AS saves,
                                                    JSONB_BUILD_OBJECT('type', 'number', 'value', '')         AS shots,
                                                    JSONB_BUILD_OBJECT('type', 'color', 'value', '#FFFFFF00') AS player_color,
                                                    JSONB_BUILD_OBJECT('type', 'color', 'value', '#FFFFFF00') AS team_primary,
                                                    JSONB_BUILD_OBJECT('type', 'color', 'value', '#FFFFFF00') AS team_secondary
                                                 FROM (VALUES ( '' ), ( '' ), ( '' ), ( '' ), ( '' ), ( '' ), ( '' ), ( '' )) a),
                                     player_data_json
                                         AS (SELECT JSONB_BUILD_OBJECT('type', 'text', 'value', name)          AS name,
                                                    JSON_BUILD_OBJECT('type', 'number', 'value', salary)       AS salary,
                                                    JSONB_BUILD_OBJECT('type', 'number', 'value', wins)        AS wins,
                                                    JSONB_BUILD_OBJECT('type', 'number', 'value', losses)      AS losses,
                                                    JSONB_BUILD_OBJECT('type', 'text', 'value', record)        AS record,
                                                    JSONB_BUILD_OBJECT('type', 'number', 'value', rating)      AS rating,
                                                    JSONB_BUILD_OBJECT('type', 'number', 'value', goals)       AS goals,
                                                    JSONB_BUILD_OBJECT('type', 'number', 'value', assists)     AS assists,
                                                    JSONB_BUILD_OBJECT('type', 'number', 'value', saves)       AS saves,
                                                    JSONB_BUILD_OBJECT('type', 'number', 'value', shots)       AS shots,
                                                    JSONB_BUILD_OBJECT('type', 'color', 'value', player_color) AS player_color,
                                                    JSONB_BUILD_OBJECT('type', 'color', 'value',
                                                                       CASE
                                                                           WHEN team_primary IS NULL
                                                                               THEN '#FEBF2B'
                                                                           ELSE team_primary
                                                                           END
                                                        )                                                      AS team_primary,
                                                    JSONB_BUILD_OBJECT('type', 'color', 'value', CASE
                                                                                                     WHEN team_secondary IS NULL
                                                                                                         THEN '#F15A24'
                                                                                                     ELSE team_secondary
                                                        END
                                                        )                                                      AS team_secondary
                                                 FROM player_stats)
                                SELECT *
                                    FROM player_data_json
                                UNION ALL
                                SELECT *
                                    FROM blank_player_data_json
                                    LIMIT 8),
     empty_player_game_data AS (SELECT gs.replay_id,
                                       gs.winning_color,
                                       gs.winning_team_primary,
                                       gs.winning_team_name,
                                       gs.player_team_color,
                                       -1,
                                       0,
                                       JSONB_BUILD_OBJECT('type', 'text', 'value', '')           AS player,
                                       JSONB_BUILD_OBJECT('type', 'color', 'value', '#FFFFFF00') AS team_primary,
                                       JSONB_BUILD_OBJECT('type', 'color', 'value', '#FFFFFF00') AS team_secondary,
                                       JSONB_BUILD_OBJECT('type', 'color', 'value', 'FFFFFF00')  AS player_color,
                                       JSONB_BUILD_OBJECT('type', 'number', 'value', '')         AS p_rating,
                                       JSONB_BUILD_OBJECT('type', 'number', 'value', '')         AS p_score,
                                       JSONB_BUILD_OBJECT('type', 'number', 'value', '')         AS p_goals,
                                       JSONB_BUILD_OBJECT('type', 'number', 'value', '')         AS p_assists,
                                       JSONB_BUILD_OBJECT('type', 'number', 'value', '')         AS p_saves,
                                       JSONB_BUILD_OBJECT('type', 'number', 'value', '')         AS p_shots
                                    FROM game_stats gs
                                             JOIN player_stats ps ON gs.player_name = ps.name
                                    ORDER BY gs.replay_id, gs.player_team_color),
     player_game_data       AS (SELECT gs.replay_id,
                                       gs.winning_color,
                                       gs.winning_team_primary,
                                       gs.winning_team_name,
                                       gs.player_team_color,
                                       gs.score,
                                       gs.goals,
                                       JSONB_BUILD_OBJECT('type', 'text', 'value', gs.player_name)                  AS player,

                                       JSONB_BUILD_OBJECT('type', 'color', 'value', CASE
                                                                                        WHEN ps.team_primary IS NULL
                                                                                            THEN '#000000FF'
                                                                                        ELSE ps.team_primary END)   AS team_primary,
                                       JSONB_BUILD_OBJECT('type', 'color', 'value', CASE
                                                                                        WHEN ps.team_secondary IS NULL
                                                                                            THEN '#000000FF'
                                                                                        ELSE ps.team_secondary END) AS team_secondary,
                                       JSONB_BUILD_OBJECT('type', 'color', 'value', ps.player_color)                AS player_color,
                                       JSONB_BUILD_OBJECT('type', 'number', 'value', gs.mvpr)                       AS p_rating,
                                       JSONB_BUILD_OBJECT('type', 'number', 'value', gs.score)                      AS p_score,
                                       JSONB_BUILD_OBJECT('type', 'number', 'value', gs.goals)                      AS p_goals,
                                       JSONB_BUILD_OBJECT('type', 'number', 'value', gs.assists)                    AS p_assists,
                                       JSONB_BUILD_OBJECT('type', 'number', 'value', gs.saves)                      AS p_saves,
                                       JSONB_BUILD_OBJECT('type', 'number', 'value', gs.shots)                      AS p_shots

                                    FROM game_stats gs
                                             JOIN player_stats ps ON gs.player_name = ps.name
                                UNION ALL
                                SELECT *
                                    FROM empty_player_game_data),
     complete_player_data   AS (SELECT *,
                                       ROW_NUMBER()
                                       OVER (PARTITION BY cpd.replay_id, cpd.player_team_color ORDER BY cpd.score DESC) AS n
                                    FROM player_game_data cpd
                                    ORDER BY replay_id, player_team_color DESC, UPPER(player ->> 'value') DESC),
     team_replay_data       AS (SELECT replay_id,
                                       winning_color,
                                       winning_team_primary,
                                       winning_team_name,
                                       SUM(goals) FILTER (WHERE player_team_color = 'BLUE')   AS blue_goals,
                                       SUM(goals) FILTER (WHERE player_team_color = 'ORANGE') AS orange_goals,
                                       JSON_AGG(JSONB_BUILD_OBJECT(
                                               'name', player,
                                               'player_color', player_color,
                                               'team_primary', team_primary,
                                               'team_secondary', team_secondary,
                                               'rating', p_rating,
                                               'score', p_score,
                                               'goals', p_goals,
                                               'assists', p_assists,
                                               'saves', p_saves,
                                               'shots', p_shots
                                           )) FILTER (WHERE player_team_color = 'BLUE')       AS blue_players,
                                       JSON_AGG(JSONB_BUILD_OBJECT(
                                               'name', player,
                                               'player_color', player_color,
                                               'team_primary', team_primary,
                                               'team_secondary', team_secondary,
                                               'rating', p_rating,
                                               'score', p_score,
                                               'goals', p_goals,
                                               'assists', p_assists,
                                               'saves', p_saves,
                                               'shots', p_shots
                                           )) FILTER (WHERE player_team_color = 'ORANGE')     AS orange_players
                                    FROM complete_player_data
                                    WHERE n < 4
                                    GROUP BY replay_id, winning_color, winning_team_primary, winning_team_name),
     played_game_data       AS (SELECT JSONB_BUILD_OBJECT('type', 'text', 'value',
                                                          CASE
                                                              WHEN
                                                                  (SELECT winning_team_name = f.home_name
                                                                       FROM mledb.series_replay
                                                                                INNER JOIN mledb.series ON series_replay.series_id = series.id
                                                                                INNER JOIN mledb.fixture f ON series.fixture_id = f.id
                                                                       WHERE series_replay.id = replay_id) AND winning_color = 'BLUE'
                                                                  THEN CONCAT(blue_goals, ' - ', orange_goals)
                                                              ELSE CONCAT(orange_goals, ' - ', blue_goals)
                                                              END)                                        AS result,
                                       JSONB_BUILD_OBJECT('type', 'color', 'value', winning_team_primary) AS winning_color,
                                       JSONB_BUILD_OBJECT('type', 'number', 'value', blue_goals)          AS blue_goals,
                                       JSONB_BUILD_OBJECT('type', 'number', 'value', orange_goals)        AS orange_goals,
                                       blue_players,
                                       orange_players
                                    FROM team_replay_data),
     empty_game_data        AS (WITH empty_players AS (SELECT 1     AS n,
                                                              JSONB_BUILD_OBJECT(
                                                                      'name',
                                                                      JSON_BUILD_OBJECT('type', 'text', 'value', ''),
                                                                      'player_color',
                                                                      JSON_BUILD_OBJECT('type', 'color', 'value', '#FFFFFF00'),
                                                                      'team_color',
                                                                      JSON_BUILD_OBJECT('type', 'color', 'value', 'FFFFFF00'),
                                                                      'rating',
                                                                      JSON_BUILD_OBJECT('type', 'number', 'value', ''),
                                                                      'score',
                                                                      JSON_BUILD_OBJECT('type', 'number', 'value', ''),
                                                                      'goals',
                                                                      JSON_BUILD_OBJECT('type', 'number', 'value', ''),
                                                                      'assists',
                                                                      JSON_BUILD_OBJECT('type', 'number', 'value', ''),
                                                                      'saves',
                                                                      JSON_BUILD_OBJECT('type', 'number', 'value', ''),
                                                                      'shots',
                                                                      JSON_BUILD_OBJECT('type', 'number', 'value', '')
                                                                  ) AS ep
                                                           FROM (VALUES ( '', '' ),
                                                                        ( '', '' ),
                                                                        ( '', '' )) a)
                                SELECT JSON_BUILD_OBJECT('result', JSONB_BUILD_OBJECT('type', 'text', 'value', ''),
                                                         'winning_color',
                                                         JSONB_BUILD_OBJECT('type', 'color', 'value', '#FFFFFF00'),
                                                         'blue_goals',
                                                         JSONB_BUILD_OBJECT('type', 'number', 'value', ''),
                                                         'orange_goals',
                                                         JSONB_BUILD_OBJECT('type', 'number', 'value', ''),
                                                         'blue_players', JSON_AGG(e.ep),
                                                         'orange_players', JSON_AGG(e.ep)
                                           )
                                    FROM empty_players e
                                    GROUP BY n),
     games_data             AS (SELECT ROW_TO_JSON(played_game_data.*) AS game
                                    FROM played_game_data
                                UNION ALL
                                SELECT *
                                    FROM empty_game_data
                                UNION ALL
                                SELECT *
                                    FROM empty_game_data
                                UNION ALL
                                SELECT *
                                    FROM empty_game_data
                                UNION ALL
                                SELECT *
                                    FROM empty_game_data
                                    LIMIT 7),

     full_object            AS (SELECT (SELECT ROW_TO_JSON(organization.*) FROM organization)            AS organization,
                                       (SELECT ROW_TO_JSON(game_object.*) FROM game_object)              AS game,
                                       (SELECT JSON_AGG(player_stats_object.*) FROM player_stats_object) AS player_data,
                                       (SELECT JSON_AGG(games_data.game) FROM games_data)                AS games_data
                                    FROM game_object)


SELECT ROW_TO_JSON(full_object.*) AS data
    FROM full_object
