WITH
  distinct_series AS (
    SELECT DISTINCT
      tru.role,
      s.mode,
      tru.series_id
    FROM
      mledb.team_role_usage AS tru
      INNER JOIN mledb.series AS s ON s.id = tru.series_id
      INNER JOIN mledb.fixture AS f ON f.id = s.fixture_id
      INNER JOIN mledb.match AS m ON m.id = f.match_id
    WHERE
      tru.team_name = 'Puffins'
      AND role != 'NONE'
      AND m.season = 16
      AND tru.league = 'FOUNDATION'
  ),
  counts_per_mode AS (
    SELECT
      ds.role,
      COUNT(ds.series_id),
      ds.mode
    FROM
      distinct_series AS ds
    GROUP BY
      ds.role,
      ds.mode
    ORDER BY
      ds.mode
  ),
  doubles_counts AS (
    SELECT
      *
    FROM
      counts_per_mode
    WHERE
      counts_per_mode.mode = 'DOUBLES'
  ),
  standard_counts AS (
    SELECT
      *
    FROM
      counts_per_mode
    WHERE
      counts_per_mode.mode = 'STANDARD'
  )
SELECT
  dc.role,
  dc.count AS doubles_count,
  sc.count AS standard_count,
  dc.count + sc.count AS total_count
FROM
  doubles_counts AS dc
  INNER JOIN standard_counts AS sc ON sc.role = dc.role
