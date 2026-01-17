-- This SQL script synchronizes the 'name' field in the 'member_profile' table
-- with the 'displayName' field in the 'user_profile' table for all members.
-- user_profile.displayName is considered the source of truth.

-- Preview the changes to be made
SELECT mp."memberId", mp.name AS old_name, up."displayName" AS new_name
FROM sprocket.member_profile AS mp
JOIN sprocket.member AS m ON mp."memberId" = m.id
JOIN sprocket."user" AS u ON u.id = m."userId"
JOIN sprocket.user_profile AS up ON up."userId" = u.id
WHERE mp.name IS DISTINCT FROM up."displayName";

-- Perform the update to synchronize names
UPDATE sprocket.member_profile AS mp
SET name = up."displayName"
FROM sprocket.member AS m
JOIN sprocket."user" AS u ON u.id = m."userId"
JOIN sprocket.user_profile AS up ON up."userId" = u.id
WHERE mp."memberId" = m.id
  AND mp.name IS DISTINCT FROM up."displayName";