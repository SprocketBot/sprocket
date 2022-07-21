WITH
vars AS (SELECT 
		 	$1::numeric AS series_id,
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

match_data AS (
	SELECT 	sr.id as series_replay_id, 
			sr.duration, 
			sr.overtime, 
			sr.overtime_seconds, 
			sr.winning_team_name, 
			case when sr.winning_team_name = f.home_name 
					then f.away_name
				else f.home_name
			end as losing_team_name,
			sr.winning_color, 
			sr.series_id,
			s.league,
			s.mode,
			f.home_name,
			f.away_name,
			f.match_id
	FROM 		mledb.series_replay sr
	INNER JOIN 	vars v 
	ON 			v.series_id = sr.series_id
	INNER JOIN 	mledb.series s
	ON 			v.series_id = s.id
	INNER JOIN  mledb.fixture f
	ON			f.id = s.fixture_id
	WHERE 		sr.series_id = v.series_id
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
player_table AS(
	WITH data AS(
		SELECT
			s.id as series_id,
			sr.id as replay_id,
			sr.winning_color,
			psc.mvpr,
			psc.score,
			psc.goals,
			psc.assists,
			psc.saves,
			psc.shots,
			psc.gpi,
			p.name as player_name,
			p.salary,
			psc.color as player_team_color
			
		FROM		vars v
		INNER JOIN 	mledb.series s
		ON 			v.series_id = s.id
		INNER JOIN	mledb.series_replay sr
		ON			sr.series_id = s.id
		INNER JOIN	mledb.player_stats_core psc
		ON			sr.id = psc.replay_id
		INNER JOIN	mledb.player p
		ON			psc.player_id = p.id
	)
	SELECT
		d.series_id,
		d.replay_id,
		d.winning_color,
		m.winning_team_name,
		tb.primary_color as winning_team_primary,
		tb.secondary_color as winning_team_secondary,
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
		case when d.player_team_color = m.winning_color then m.winning_team_name
			else	m.losing_team_name 
			end as player_team_name

	FROM data d 
	INNER JOIN match_data m 
	ON d.replay_id = m.series_replay_id
	INNER JOIN mledb.team_branding tb
	on m.winning_team_name=tb.team_name
),
game_stats AS(
	SELECT 	pt.*,
			tb.primary_color as team_primary,
			tb.secondary_color as team_secondary
	from player_table pt
	INNER JOIN mledb.team_branding tb 
	on pt.player_team_name = tb.team_name
),

match_info AS(
	WITH series_score AS (
		SELECT
			md.series_id,
			md.mode,
			md.league,
			Count(DISTINCT md.series_replay_id) filter (WHERE md.winning_team_name = md.home_name) as home_wins,
			Count(DISTINCT md.series_replay_id) filter (WHERE md.winning_team_name = md.away_name) as away_wins,
			CONCAT (
				Count(DISTINCT md.series_replay_id) filter (WHERE md.winning_team_name = md.home_name), 
				' - ',
				Count(DISTINCT md.series_replay_id) filter (WHERE md.winning_team_name = md.away_name)
			) as series_score,
			md.home_name,
			md.away_name,
			md.match_id
		FROM match_data md
		GROUP BY md.series_id, md.mode, md.league, md.home_name, md.away_name, md.match_id
	)
	
	SELECT 	ss.series_id,
			m.season,
			m.match_number,
			ss.league,
			ss.mode,
			ss.home_wins,
			ss.away_wins,
			ss.series_score,
			ss.home_name,
			tb.primary_color as home_team_primary,
			tb.secondary_color as home_team_secondary,
			tb.logo_img_link as home_team_logo,
			ss.away_name,
			tb2.primary_color as away_team_primary,
			tb2.secondary_color as away_team_secondary,
			tb2.logo_img_link as away_team_logo,
			CASE
				WHEN ss.home_wins > ss.away_wins THEN ss.home_name
				ELSE ss.away_name
		  	END as winning_team_name,
			CASE
				WHEN ss.home_wins > ss.away_wins THEN tb.primary_color
				ELSE tb2.primary_color
		  	END as winning_team_primary,
			CASE
				WHEN ss.home_wins > ss.away_wins THEN tb.secondary_color
				ELSE tb2.secondary_color
		  	END as winning_team_secondary,
			CASE
				WHEN ss.home_wins > ss.away_wins THEN tb.logo_img_link
				ELSE tb2.logo_img_link
		  	END as winning_team_logo
	FROM 		series_score ss
	INNER JOIN 	mledb.match m
	ON			ss.match_id = m.id
	INNER JOIN 	mledb.team_branding tb
	ON			ss.home_name = tb.team_name
	INNER JOIN 	mledb.team_branding tb2
	ON			ss.away_name = tb2.team_name
	
),


empty_players AS(
	SELECT 
		jsonb_build_object('type', 'text', 'value', ''),
		v.series_id
	FROM vars v
),

home_players AS(
	with hp as
	(
		SELECT 
			DISTINCT(jsonb_build_object('type', 'text', 'value', player_name)) as home_players, 
			series_id 
		FROM player_table
		WHERE player_team_name = home_name
		UNION ALL 
		SELECT * FROM empty_players
		UNION ALL 
		SELECT * FROM empty_players
	)	
	SELECT json_agg(home_players) as home_players,
		series_id
	FROM hp
	GROUP BY series_id
),

away_players AS(
	with ap as
	(
		SELECT 
			DISTINCT(jsonb_build_object('type', 'text', 'value', player_name)) as away_players, 
			series_id 
		FROM player_table
		WHERE player_team_name != home_name
		UNION ALL 
		SELECT * FROM empty_players
		UNION ALL 
		SELECT * FROM empty_players
	)	
	SELECT json_agg(away_players) as away_players,
		series_id
	FROM ap
	GROUP BY series_id
),


game_object AS(
	SELECT
		jsonb_build_object('type', 'text', 'value', CONCAT('WEEK ', mi.match_number, ' ', LEFT(mi.league,1), 'L ',
						  CASE
						  	WHEN mode='STANDARD' THEN '3S '
						   	WHEN mode='DOUBLES' THEN '2S '
						  END
						  )) AS title,
		jsonb_build_object('type', 'text', 'value', CONCAT(UPPER(LEFT(mode, 1)),LOWER(SUBSTRING(mode, 2, LENGTH(mode))))) AS game_mode,
		jsonb_build_object('type', 'text', 'value',
						  CASE
						   	WHEN mode = 'STANDARD' THEN '3S'
						   	WHEN mode = 'DOUBLES' THEN '2S'
							WHEN mode = 'SOLO' THEN '1S'
						  END ) AS mode_short,
		jsonb_build_object('type', 'text', 'value', CONCAT(UPPER(LEFT(mi.league, 1)),LOWER(SUBSTRING(mi.league, 2, LENGTH(mi.league))))) AS league,
		jsonb_build_object('type', 'text', 'value', CONCAT(LEFT(mi.league,1), 'L')) as league_short,
		jsonb_build_object('type', 'color', 'value', lb.color) as league_color,
		jsonb_build_object('type', 'image', 'value', lb.badge_img_link) as league_logo,
		jsonb_build_object('type', 'text', 'value', mi.home_name) as home_team_name,
		jsonb_build_object('type', 'color', 'value', mi.home_team_primary) as home_team_primary,
		jsonb_build_object('type', 'color', 'value', mi.home_team_secondary) as home_team_secondary,
		jsonb_build_object('type', 'image', 'value', mi.home_team_logo) as home_team_logo,
		jsonb_build_object('type', 'text', 'value', mi.away_name) as away_team_name,
		jsonb_build_object('type', 'color', 'value', mi.away_team_primary) as away_team_primary,
		jsonb_build_object('type', 'color', 'value', mi.away_team_secondary) as away_team_secondary,
		jsonb_build_object('type', 'image', 'value', mi.away_team_logo) as away_team_logo,
		jsonb_build_object('type', 'color', 'value', mi.winning_team_name) as winning_team_name,
		jsonb_build_object('type', 'color', 'value', mi.winning_team_primary) as winning_team_primary,
		jsonb_build_object('type', 'color', 'value', mi.winning_team_secondary) as winning_team_secondary,
		jsonb_build_object('type', 'image', 'value', mi.winning_team_logo) as winning_team_logo,
		hp.home_players,
		ap.away_players,
		json_build_object('type', 'text', 'value', series_score) as series_score
	FROM match_info mi
	INNER JOIN mledb.league_branding lb
	ON mi.league = lb.league
	INNER JOIN home_players hp
	ON hp.series_id = mi.series_id
	INNER JOIN away_players ap
	ON ap.series_id = mi.series_id
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
				gs.salary AS salary,
				re.wins,
				re.losses,
				gs.team_primary,
				gs.team_secondary,
				AVG(COALESCE(gs.gpi, gs.mvpr)) AS rating,
				SUM(gs.goals) AS goals,
				SUM(gs.assists) AS assists,
				SUM(gs.saves) AS saves,
				SUM(gs.shots) AS shots,
				RANK() OVER(ORDER BY AVG(gs.mvpr) DESC) rank
		FROM game_stats gs
		INNER JOIN records re
		ON gs.player_name = re.player_name
		GROUP BY gs.player_name, salary, re.wins, re.losses, gs.team_primary, gs.team_secondary
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
		t.salary,
		t.team_primary,
		t.team_secondary,
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
			json_build_object('type', 'number', 'value', '') AS salary,
			jsonb_build_object('type', 'number', 'value', '') AS wins,
			jsonb_build_object('type', 'number', 'value', '') AS losses,
			jsonb_build_object('type', 'text', 'value', '') AS record,
			jsonb_build_object('type', 'number', 'value', '') AS rating,
			jsonb_build_object('type', 'number', 'value', '') AS goals,
			jsonb_build_object('type', 'number', 'value', '') AS assists,
			jsonb_build_object('type', 'number', 'value', '') AS saves,
			jsonb_build_object('type', 'number', 'value', '') AS shots,
			jsonb_build_object('type', 'color', 'value', '#FFFFFF00') AS player_color,
			jsonb_build_object('type', 'color', 'value', '#FFFFFF00') AS team_primary,
			jsonb_build_object('type', 'color', 'value', '#FFFFFF00') AS team_secondary
       FROM   (VALUES (''), (''), (''), (''), (''), (''), (''), ('')) a
	),
	player_data_json AS(
		SELECT
			jsonb_build_object('type', 'text', 'value', name) AS name,
			json_build_object('type', 'number', 'value', salary) AS salary,
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
							   		WHEN team_primary IS NULL THEN '#FEBF2B'
							  		ELSE team_primary
							   END
							  ) AS team_primary,
			jsonb_build_object('type', 'color', 'value', CASE 
							   		WHEN team_secondary IS NULL THEN '#F15A24'
							  		ELSE team_secondary
							   END
							  ) AS team_secondary
		FROM player_stats
	)
	SELECT * from player_data_json
	UNION ALL
   	SELECT   *
   	FROM     blank_player_data_json
	LIMIT 8

),
empty_player_game_data AS(
	SELECT 	gs.replay_id,
			gs.winning_color,
			gs.winning_team_primary,
			gs.player_team_color,
			-1,
			0,
			jsonb_build_object('type', 'text', 'value', '') as player,
			jsonb_build_object('type', 'color', 'value', '#FFFFFF00') as team_primary,
			jsonb_build_object('type', 'color', 'value', '#FFFFFF00') as team_secondary,
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
			gs.winning_team_primary,
			gs.player_team_color,
			gs.score,
			gs.goals,
			jsonb_build_object('type', 'text', 'value', gs.player_name) as player,

			jsonb_build_object('type', 'color', 'value', case when ps.team_primary is null then '#000000FF' else ps.team_primary end) as team_primary,
			jsonb_build_object('type', 'color', 'value', case when ps.team_secondary is null then '#000000FF' else ps.team_secondary end) as team_secondary,
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
	ORDER BY replay_id, player_team_color DESC, UPPER(player->>'value') DESC
),
team_replay_data AS(
	SELECT
		replay_id,
		winning_color,
		winning_team_primary,
		SUM(goals) filter (WHERE player_team_color = 'BLUE') as blue_goals,
		SUM(goals) filter (WHERE player_team_color = 'ORANGE') as orange_goals,
		json_agg(jsonb_build_object(
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
		)) filter (WHERE player_team_color = 'BLUE') AS blue_players,
		json_agg(jsonb_build_object(
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
		)) filter (WHERE player_team_color = 'ORANGE') AS orange_players
	FROM complete_player_data WHERE n < 4
	GROUP BY replay_id, winning_color, winning_team_primary
),
played_game_data AS(
	SELECT
		jsonb_build_object('type', 'text', 'value', CONCAT(blue_goals, ' - ',orange_goals)) as result,
		jsonb_build_object('type', 'color', 'value', winning_team_primary) as winning_color,
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
),
games_data AS(
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
