import {MigrationInterface, QueryRunner} from "typeorm";

/**
 * mledb.player_account had a unique constraint on tracker. Multiple platform rows
 * often omit or share tracker values during Sprocket-primary mirroring; uniqueness
 * on tracker is not required for identity (platform + platform_id is authoritative).
 */
export class DropMledbPlayerAccountTrackerUnique1773000000000 implements MigrationInterface {
    name = "DropMledbPlayerAccountTrackerUnique1773000000000";

public async up(queryRunner: QueryRunner): Promise<void> {
        // Drop the unique constraint (which will also drop the underlying index)
        await queryRunner.query(
            'ALTER TABLE "mledb"."player_account" DROP CONSTRAINT IF EXISTS "player_account_tracker_unique"',
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Recreate the unique constraint
        await queryRunner.query(
            'ALTER TABLE "mledb"."player_account" ADD CONSTRAINT "player_account_tracker_unique" UNIQUE ("tracker")',
        );
    }
}
