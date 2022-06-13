WITH 
vars AS (SELECT 
		 	$1::numeric AS scrim_id,
			$2::numeric AS org_id
		),

colors AS (
	SELECT * FROM (VALUES 	(1, '#F54C91'),
							(2, '#0097D7'),
							(3, '#189666'),
							(4, '#DE7327'),
							(5, '#FDBD2A'),
							(6, '#1D308F')
				) t1 (number, color)
),

organization AS (
	SELECT
		jsonb_build_object('type', 'text', 'value', op.name) AS name,
		jsonb_build_object('type', 'text', 'value', op.description) AS description,
		jsonb_build_object('type', 'text', 'value', op."websiteUrl") AS webisite,
		jsonb_build_object('type', 'color', 'value', op."primaryColor") AS primary_color,
		jsonb_build_object('type', 'color', 'value', op."secondaryColor") AS secondary_color,
		jsonb_build_object('type', 'image', 'value', op."logoUrl") AS logo_url

	FROM sprocket.organization_profile op
	INNER JOIN vars v
	ON op.id = v.org_id
),

game_stats AS(
	SELECT
		v.scrim_id as scrim_id,
		sr.id as replay_id,
		sr.winning_color,
		psc.color as player_team_color,
		psc.mvpr,
		psc.score,
		psc.goals,
		psc.assists,
		psc.saves,
		psc.shots,
		psc.gpi,
		p.name as player_name
	FROM		vars v
	INNER JOIN 	mledb.series s
	ON 			v.scrim_id = s.scrim_id
	INNER JOIN	mledb.series_replay sr
	ON			sr.series_id = s.id
	INNER JOIN	mledb.player_stats_core psc
	ON			sr.id = psc.replay_id
	INNER JOIN	mledb.player p
	ON			psc.player_id = p.id
),

game_info AS (
	WITH series_score AS (
		SELECT
			v.scrim_id,
			Count(DISTINCT replay_id) filter (WHERE winning_color = 'BLUE') as blue_wins,
			Count(DISTINCT replay_id) filter (WHERE winning_color != 'BLUE') as orange_wins
		FROM game_stats g
		INNER JOIN vars v on v.scrim_id=g.scrim_id
		GROUP BY v.scrim_id
	)
	SELECT 	s.league,
			s.mode,
			sc.type,
			ss.blue_wins,
			ss.orange_wins,
			concat(ss.blue_wins, ' - ', ss.orange_wins) as series_score
	FROM 		vars v
	INNER JOIN 	mledb.scrim sc
	ON 			v.scrim_id = sc.id
	INNER JOIN 	mledb.series s
	ON 			v.scrim_id = s.scrim_id
	INNER JOIN 	series_score ss
	ON			ss.scrim_id = v.scrim_id
),
game_object AS(
	SELECT
		jsonb_build_object('type', 'text', 'value', CONCAT(LEFT(gi.league,1), 'L ',
						  CASE
						  	WHEN type = 'BEST_OF' AND mode='STANDARD' THEN '3S BEST OF '
						   	WHEN type = 'BEST_OF' AND mode='DOUBLES' THEN '2S BEST OF '
						   	WHEN type = 'ROUND_ROBIN' AND mode='STANDARD' THEN '3S ROUND ROBIN '
						   	WHEN type = 'ROUND_ROBIN' AND mode='DOUBLES' THEN '2S ROUND ROBIN '
						  END
						  )) AS title,
		jsonb_build_object('type', 'text', 'value', CONCAT(UPPER(LEFT(mode, 1)),LOWER(SUBSTRING(mode, 2, LENGTH(mode))))) AS scrim_mode,
		jsonb_build_object('type', 'text', 'value',
						  CASE
						   	WHEN type = 'BEST_OF' THEN 'Best Of'
						   	WHEN type = 'ROUND_ROBIN' THEN 'Round Robin'
						  END) AS scrim_type,
		jsonb_build_object('type', 'text', 'value',
						  CASE
						   	WHEN mode = 'STANDARD' THEN '3S'
						   	WHEN mode = 'DOUBLES' THEN '2S'
						  END ) AS mode_short,
		jsonb_build_object('type', 'text', 'value', CONCAT(UPPER(LEFT(gi.league, 1)),LOWER(SUBSTRING(gi.league, 2, LENGTH(gi.league))))) AS league,
		jsonb_build_object('type', 'text', 'value', CONCAT(LEFT(gi.league,1), 'L')) as league_short,
		jsonb_build_object('type', 'color', 'value', lb.color) as league_color,
		jsonb_build_object('type', 'image', 'value', lb.badge_img_link) as league_logo,
		jsonb_build_object('type', 'color', 'value',
						  CASE
						  	WHEN blue_wins > orange_wins THEN '#0C2CFC'
						  	ELSE '#FC7C0C'
						  END) as winning_color,
		json_build_object('type', 'text', 'value', series_score) as series_score


	FROM game_info gi
	INNER JOIN mledb.league_branding lb
	ON gi.league = lb.league
),

player_stats AS (
	WITH
	records AS (
		SELECT 	COUNT(CASE WHEN winning_color = player_team_color THEN 1 END) as wins,
				COUNT(CASE WHEN winning_color != player_team_color THEN 1 END) as losses,
				player_name
		FROM game_stats
		GROUP BY player_name
	),

	t AS(
		SELECT 	gs.player_name AS name,
				re.wins,
				re.losses,
				AVG(COALESCE(gs.gpi, gs.mvpr)) AS rating,
				SUM(gs.goals) AS goals,
				SUM(gs.assists) AS assists,
				SUM(gs.saves) AS saves,
				SUM(gs.shots) AS shots,
				RANK() OVER(ORDER BY AVG(gs.mvpr) DESC) rank
		FROM game_stats gs
		INNER JOIN records re
		ON gs.player_name = re.player_name
		GROUP BY gs.player_name, re.wins, re.losses
		ORDER BY wins DESC, rating DESC
	)
	SELECT
		t.name,
		t.wins,
		t.losses,
		CONCAT(t.wins, ' - ', t.losses) AS record,
		ROUND(CAST(t.rating AS numeric),2) AS rating,
		t.goals,
		t.saves,
		t.shots,
		t.assists,
		c.color as player_color
	FROM t
	INNER JOIN colors c
	ON t.rank=c.number
),
player_stats_object AS(
	WITH
	blank_player_data_json AS (
       SELECT
			jsonb_build_object('type', 'text', 'value', '') AS name,
			jsonb_build_object('type', 'number', 'value', '') AS wins,
			jsonb_build_object('type', 'number', 'value', '') AS losses,
			jsonb_build_object('type', 'text', 'value', '') AS record,
			jsonb_build_object('type', 'number', 'value', '') AS rating,
			jsonb_build_object('type', 'number', 'value', '') AS goals,
			jsonb_build_object('type', 'number', 'value', '') AS assists,
			jsonb_build_object('type', 'number', 'value', '') AS saves,
			jsonb_build_object('type', 'number', 'value', '') AS shots,
			jsonb_build_object('type', 'color', 'value', '#FFFFFF00') AS player_color,
			jsonb_build_object('type', 'color', 'value', '#FFFFFF00') AS team_color
       FROM   (VALUES (''), (''), (''), (''), (''), (''), (''), ('')) a
	),
	player_data_json AS(
		SELECT
			jsonb_build_object('type', 'text', 'value', name) AS name,
			jsonb_build_object('type', 'number', 'value', wins) AS wins,
			jsonb_build_object('type', 'number', 'value', losses) AS losses,
			jsonb_build_object('type', 'text', 'value', record) AS record,
			jsonb_build_object('type', 'number', 'value', rating) AS rating,
			jsonb_build_object('type', 'number', 'value', goals) AS goals,
			jsonb_build_object('type', 'number', 'value', assists) AS assists,
			jsonb_build_object('type', 'number', 'value', saves) AS saves,
			jsonb_build_object('type', 'number', 'value', shots) AS shots,
			jsonb_build_object('type', 'color', 'value', player_color) AS player_color,
			jsonb_build_object('type', 'color', 'value',
						 CASE
								WHEN player_color = 'BLUE' THEN '#0C2CFC'
								WHEN player_color = 'ORANGE' THEN '#FC7C0C'
								ELSE '#FFFFFF00'
						 END
		   )                                                     AS team_color
		FROM player_stats
	)
	SELECT * from player_data_json
	UNION ALL
   	SELECT   *
   	FROM     blank_player_data_json
	LIMIT 6

),

games_data AS(
	WITH
	empty_player_game_data AS(
		SELECT 	gs.replay_id,
				gs.winning_color,
				gs.player_team_color,
				-1,
				0,
				jsonb_build_object('type', 'text', 'value', '') as player,
				jsonb_build_object('type', 'color', 'value', '#FFFFFF00') as team_color,
				jsonb_build_object('type', 'color', 'value', 'FFFFFF00') as player_color,
				jsonb_build_object('type', 'number', 'value', '') as p_rating,
				jsonb_build_object('type', 'number', 'value', '') as p_score,
				jsonb_build_object('type', 'number', 'value', '') as p_goals,
				jsonb_build_object('type', 'number', 'value', '') as p_assists,
				jsonb_build_object('type', 'number', 'value', '') as p_saves,
				jsonb_build_object('type', 'number', 'value', '') as p_shots
		from game_stats gs
		JOIN player_stats ps ON gs.player_name = ps.name
		ORDER BY gs.replay_id, gs.player_team_color

	),
	player_game_data AS(
		SELECT  gs.replay_id,
				gs.winning_color,
				gs.player_team_color,
				gs.score,
				gs.goals,
				jsonb_build_object('type', 'text', 'value', gs.player_name) as player,
				jsonb_build_object('type', 'color', 'value',
								CASE
									WHEN gs.player_team_color = 'BLUE' THEN '#0C2CFC'
									WHEN gs.player_team_color = 'ORANGE' THEN '#FC7C0C'
								ELSE '#FFFFFF00'
								END

								  ) as team_color,
				jsonb_build_object('type', 'color', 'value', ps.player_color) as player_color,
				jsonb_build_object('type', 'number', 'value', gs.mvpr) as p_rating,
				jsonb_build_object('type', 'number', 'value', gs.score) as p_score,
				jsonb_build_object('type', 'number', 'value', gs.goals) as p_goals,
				jsonb_build_object('type', 'number', 'value', gs.assists) as p_assists,
				jsonb_build_object('type', 'number', 'value', gs.saves) as p_saves,
				jsonb_build_object('type', 'number', 'value', gs.shots) as p_shots

		from game_stats gs
		JOIN player_stats ps ON gs.player_name = ps.name
		UNION ALL
		SELECT * from empty_player_game_data
	),
	complete_player_data AS(
		SELECT *,
		ROW_NUMBER() OVER (PARTITION BY cpd.replay_id, cpd.player_team_color ORDER BY cpd.score DESC) AS n
		FROM player_game_data cpd
		ORDER BY replay_id, player_team_color DESC, player->>'value' DESC
	),
	team_replay_data AS(
		SELECT
			replay_id,
			winning_color,
			SUM(goals) filter (WHERE player_team_color = 'BLUE') as blue_goals,
			SUM(goals) filter (WHERE player_team_color = 'ORANGE') as orange_goals,
			json_agg(jsonb_build_object(
				'name', player,
				'player_color', player_color,
				'team_color',team_color,
				'rating', p_rating,
				'score', p_score,
				'goals', p_goals,
				'assists', p_assists,
				'saves', p_saves,
				'shots', p_shots
			)) filter (WHERE player_team_color = 'BLUE') AS blue_players,
			json_agg(jsonb_build_object(
				'name', player,
				'player_color', player_color,
				'team_color',team_color,
				'rating', p_rating,
				'score', p_score,
				'goals', p_goals,
				'assists', p_assists,
				'saves', p_saves,
				'shots', p_shots
			)) filter (WHERE player_team_color = 'ORANGE') AS orange_players
		FROM complete_player_data WHERE n < 4
		GROUP BY replay_id, winning_color
	),
	played_game_data AS(
		SELECT
			jsonb_build_object('type', 'text', 'value', CONCAT(blue_goals, ' - ',orange_goals)) as result,
			jsonb_build_object('type', 'color', 'value',
							 CASE
								WHEN winning_color = 'BLUE' THEN '#0C2CFC'
								WHEN winning_color = 'ORANGE' THEN '#FC7C0C'
								ELSE ''
							  END
							 ) winning_color,
			jsonb_build_object('type','number','value',blue_goals) AS blue_goals,
			jsonb_build_object('type','number','value',orange_goals) AS orange_goals,
			blue_players,
			orange_players
		FROM team_replay_data
	),
	empty_game_data AS (
		WITH empty_players AS(
			SELECT 1 as n, jsonb_build_object(
										'name', json_build_object('type', 'text', 'value', ''),
										'player_color', json_build_object('type', 'color', 'value', '#FFFFFF00'),
										'team_color',json_build_object('type', 'color', 'value', 'FFFFFF00'),
										'rating', json_build_object('type', 'number', 'value', ''),
										'score', json_build_object('type', 'number', 'value', ''),
										'goals', json_build_object('type', 'number', 'value', ''),
										'assists', json_build_object('type', 'number', 'value', ''),
										'saves', json_build_object('type', 'number', 'value', ''),
										'shots', json_build_object('type', 'number', 'value', '')
									 ) as ep
			FROM (VALUES
				('', ''),
				('',''),
				('', '')
			) a
		)
		SELECT json_build_object('result', jsonb_build_object('type', 'text', 'value', ''),
								 'winning_color', jsonb_build_object('type', 'color', 'value', '#FFFFFF00'),
								 'blue_goals',  jsonb_build_object('type', 'number', 'value', ''),
								  'orange_goals', jsonb_build_object('type', 'number', 'value', ''),
								  'blue_players', json_agg(e.ep),
								  'orange_players', json_agg(e.ep)
								 )
		FROM empty_players e
		GROUP BY n
	)
	SELECT row_to_json(played_game_data.*) as game
	FROM played_game_data
	UNION ALL
	SELECT * FROM empty_game_data
	UNION ALL
	SELECT * FROM empty_game_data
	UNION ALL
	SELECT * FROM empty_game_data
	UNION ALL
	SELECT * FROM empty_game_data
	LIMIT 7

),

full_object AS (
	SELECT
		(SELECT row_to_json(organization.*) FROM organization) AS organization,
		(SELECT row_to_json(game_object.*) FROM game_object) AS game,
		(SELECT json_agg(player_stats_object.*) FROM player_stats_object) as player_data,
		(SELECT json_agg(games_data.game) FROM games_data) as games_data
	FROM game_object
)

SELECT row_to_json(full_object.*) AS data FROM full_object
