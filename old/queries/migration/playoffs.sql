BEGIN TRANSACTION;
DO
$$
    DECLARE
        playoff_group numeric;
    BEGIN
        INSERT INTO sprocket.schedule_group_type (name, code, "organizationId")
        VALUES ('Playoffs', 'PLAYOFFS', 2)
        RETURNING id INTO playoff_group;

        WITH SEASON12 AS (SELECT id FROM sprocket.schedule_group WHERE description = 'Season 12')
        UPDATE sprocket.schedule_group
        SET "parentGroupId"=SEASON12.id,
            "typeId"=playoff_group,
            description='Season 12 Playoffs'
        FROM SEASON12
        WHERE description = 'Season -12';


        WITH SEASON13 AS (SELECT id FROM sprocket.schedule_group WHERE description = 'Season 13')
        UPDATE sprocket.schedule_group
        SET "parentGroupId"=SEASON13.id,
            "typeId"=playoff_group,
            description='Season 13 Playoffs'
        FROM SEASON13
        WHERE description = 'Season -13';
    END
$$;

COMMIT;
ROLLBACK;