-- Validate name alignment across sources
-- Compares sprocket.user_profile.displayName with mledb.player.name
-- Also shows current sprocket.member_profile.name for context

-- Preview only mismatches between user_profile.displayName and mledb.player.name
SELECT u.id                AS user_id,
       p.id                AS player_id,
       up."displayName"    AS user_profile_name,
       p.name              AS mledb_player_name,
       mp.name             AS member_profile_name
FROM sprocket."user" AS u
JOIN mledb_bridge.player_to_user AS b ON b."userId" = u.id
JOIN mledb.player AS p ON p.id = b."playerId"
LEFT JOIN sprocket.user_profile AS up ON up."userId" = u.id
LEFT JOIN sprocket.member AS m ON m."userId" = u.id
LEFT JOIN sprocket.member_profile AS mp ON mp."memberId" = m.id
WHERE up."displayName" IS DISTINCT FROM p.name
ORDER BY u.id;

-- Optional: see rows where all three are aligned (sanity check)
SELECT u.id                AS user_id,
       p.id                AS player_id,
       up."displayName"    AS user_profile_name,
       p.name              AS mledb_player_name,
       mp.name             AS member_profile_name
FROM sprocket."user" AS u
JOIN mledb_bridge.player_to_user AS b ON b."userId" = u.id
JOIN mledb.player AS p ON p.id = b."playerId"
LEFT JOIN sprocket.user_profile AS up ON up."userId" = u.id
LEFT JOIN sprocket.member AS m ON m."userId" = u.id
LEFT JOIN sprocket.member_profile AS mp ON mp."memberId" = m.id
WHERE up."displayName" = p.name
  AND mp.name = up."displayName"
ORDER BY u.id
LIMIT 100;