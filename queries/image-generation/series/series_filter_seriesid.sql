SELECT
  CONCAT(
    DATE_TRUNC('minute', se.created_at),
    ' ',
    LEFT(se.league, 1),
    'L ',
    REPLACE(INITCAP(se.mode), '_', ' '),
    ' '
  ) AS Description,
  se.ID AS Value
FROM
	mledb.series se 
	WHERE se.fixture_id IS NOT NULL
ORDER BY
  se.ID DESC