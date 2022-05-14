SELECT
  scrim.id AS value,
  CONCAT(
    DATE_TRUNC('minute', scrim.created_at),
    ' ',
    LEFT(series.league, 1),
    'L ',
    REPLACE(INITCAP(series.mode), '_', ' '),
    ' ',
    REPLACE(INITCAP(TYPE), '_', ' '),
    ' '
  ) AS description
  
FROM
  scrim
  INNER JOIN series ON scrim.id = series.scrim_id
ORDER BY
  scrim.id DESC