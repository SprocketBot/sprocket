import {MigrationInterface, QueryRunner} from "typeorm";

export class Automigration1652144627572 implements MigrationInterface {
    name = 'Automigration1652144627572'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "mledb"."player" ALTER COLUMN "salary" SET DEFAULT '-1.0'`);
        await queryRunner.query(`ALTER TABLE "mledb"."player" ALTER COLUMN "peak_mmr" SET DEFAULT 0`);
        await queryRunner.query(`ALTER TABLE "mledb"."elo_data" ALTER COLUMN "chain" SET DEFAULT 0`);
        await queryRunner.query(`DROP INDEX "mledb"."series_replay_match_guid_unique"`);
        await queryRunner.query(`ALTER TABLE "mledb"."series_replay" DROP CONSTRAINT "UQ_bfa2984b8bdd5f98dae64423d37"`);
        await queryRunner.query(`ALTER TABLE "mledb"."series_replay" DROP CONSTRAINT "UQ_b31c4de7eadec55babfefc69ed0"`);
        await queryRunner.query(`ALTER TABLE "mledb"."series_replay" ALTER COLUMN "overtime_seconds" SET DEFAULT 0`);
        await queryRunner.query(`ALTER TABLE "mledb"."season" ALTER COLUMN "week_length" SET DEFAULT 7`);
        await queryRunner.query(`ALTER TABLE "mledb"."player_history" ALTER COLUMN "salary" SET DEFAULT '-1.0'`);
        await queryRunner.query(`ALTER TABLE "mledb"."player_history" ALTER COLUMN "peak_mmr" SET DEFAULT 0`);
        await queryRunner.query(`CREATE UNIQUE INDEX "series_replay_match_guid_unique" ON "mledb"."series_replay" ("duration", "match_guid") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "mledb"."series_replay_match_guid_unique"`);
        await queryRunner.query(`ALTER TABLE "mledb"."player_history" ALTER COLUMN "peak_mmr" SET DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "mledb"."player_history" ALTER COLUMN "salary" SET DEFAULT '-1'`);
        await queryRunner.query(`ALTER TABLE "mledb"."season" ALTER COLUMN "week_length" SET DEFAULT '7'`);
        await queryRunner.query(`ALTER TABLE "mledb"."series_replay" ALTER COLUMN "overtime_seconds" SET DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "mledb"."series_replay" ADD CONSTRAINT "UQ_b31c4de7eadec55babfefc69ed0" UNIQUE ("duration")`);
        await queryRunner.query(`ALTER TABLE "mledb"."series_replay" ADD CONSTRAINT "UQ_bfa2984b8bdd5f98dae64423d37" UNIQUE ("match_guid")`);
        await queryRunner.query(`CREATE UNIQUE INDEX "series_replay_match_guid_unique" ON "mledb"."series_replay" ("match_guid", "duration") `);
        await queryRunner.query(`ALTER TABLE "mledb"."elo_data" ALTER COLUMN "chain" SET DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "mledb"."player" ALTER COLUMN "peak_mmr" SET DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "mledb"."player" ALTER COLUMN "salary" SET DEFAULT '-1'`);
    }

}
