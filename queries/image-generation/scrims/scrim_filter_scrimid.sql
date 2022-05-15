SELECT
  CONCAT(
    DATE_TRUNC('minute', s.created_at),
    ' ',
    LEFT(se.league, 1),
    'L ',
    REPLACE(INITCAP(se.mode), '_', ' '),
    ' ',
    REPLACE(INITCAP(TYPE), '_', ' '),
    ' '
  ) AS Description,
  s.ID AS Value
FROM
  mledb.scrim s
  INNER JOIN mledb.series se ON s.id = se.scrim_id
ORDER BY
  s.ID DESC