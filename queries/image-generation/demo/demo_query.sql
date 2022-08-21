WITH 
vars AS (SELECT 
	$1::VARCHAR AS team_name,
	$2::VARCHAR AS league
),

team_info as (
	SELECT tb.team_name, primary_color, league
	FROM mledb.team_branding tb
	INNER JOIN vars v
	ON v.team_name = tb.team_name	 
),

players_list as(
	SELECT name 
	FROM mledb.player p
	INNER JOIN vars v
	ON p.team_name = v.team_name AND p.league = v.league
),

empty_players_obj AS (
	SELECT
		jsonb_build_object('type', 'text', 'value', '') AS roster
	FROM (VALUES
				('', ''),
				('',''),
				('', ''),
		  		('', ''),
				('',''),
				('', ''),
		  		('', ''),
		 		('', '')
			) a
),

player_obj AS(
	SELECT 
		jsonb_build_object('type', 'text', 'value', name) AS roster
	FROM players_list
),

roster AS (
	SELECT * from player_obj
	UNION ALL 
	SELECT * from empty_players_obj
	LIMIT 8
),

full_object AS(
	SELECT
		jsonb_build_object('type', 'text', 'value', team_name ) AS team_name,
		jsonb_build_object('type', 'text', 'value', league) AS league,	
		jsonb_build_object('type', 'text', 'value', primary_color ) AS team_primary_color,
		(SELECT json_agg(roster) as roster FROM roster) AS players
	FROM team_info
)

SELECT row_to_json(full_object.*) AS data
FROM full_object
