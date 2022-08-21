WITH
match_info as (
	SELECT 
		s.id,
		s.league,
		s.mode,
		f.home_name,
		f.away_name,
		f.match_id,
		m.season,
		m.match_number
	FROM mledb.series s
	INNER JOIN mledb.fixture f
	ON s.fixture_id = f.id
	INNER JOIN mledb.match m
	ON f.match_id = m.id
	WHERE s.fixture_id IS NOT null
)


SELECT
  CONCAT(
    'S', mi.season, '-', mi.match_number,
    ' ',
    LEFT(mi.league, 1),
    'L ',
    CASE WHEN mi.mode = 'DOUBLES'
	  THEN '2s'
	  ELSE '3s'
	END,
    ' ',
	mi.home_name, ' vs ', mi.away_name
  ) AS Description,
  mi.ID AS Value
FROM match_info mi 
	INNER JOIN (
		SELECT DISTINCT(sr.series_id)
		FROM mledb.series_replay sr
	) as se_sid
	on mi.id = se_sid.series_id
ORDER BY
  mi.ID DESC