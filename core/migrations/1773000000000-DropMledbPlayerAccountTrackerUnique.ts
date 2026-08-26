import {MigrationInterface, QueryRunner} from "typeorm";

/**
 * mledb.player_account had a unique constraint on tracker. Multiple platform rows
 * often omit or share tracker values during Sprocket-primary mirroring; uniqueness
 * on tracker is not required for identity (platform + platform_id is authoritative).
 */
export class DropMledbPlayerAccountTrackerUnique1773000000000 implements MigrationInterface {
    name = "DropMledbPlayerAccountTrackerUnique1773000000000";

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            'DROP INDEX IF EXISTS "mledb"."player_account_tracker_unique"',
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            'CREATE UNIQUE INDEX "player_account_tracker_unique" ON "mledb"."player_account" ("tracker")',
        );
    }
}
