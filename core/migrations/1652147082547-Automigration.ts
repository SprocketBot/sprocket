import {MigrationInterface, QueryRunner} from "typeorm";

export class Automigration1652147082547 implements MigrationInterface {
    name = 'Automigration1652147082547'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "mledb"."player" ALTER COLUMN "salary" SET DEFAULT '-1.0'`);
        await queryRunner.query(`ALTER TABLE "mledb"."player" ALTER COLUMN "peak_mmr" SET DEFAULT 0`);
        await queryRunner.query(`ALTER TABLE "mledb"."season" ALTER COLUMN "week_length" SET DEFAULT 7`);
        await queryRunner.query(`ALTER TABLE "mledb"."elo_data" ALTER COLUMN "chain" SET DEFAULT 0`);
        await queryRunner.query(`ALTER TABLE "mledb"."series_replay" ALTER COLUMN "overtime_seconds" SET DEFAULT 0`);
        await queryRunner.query(`ALTER TABLE "mledb"."player_history" ALTER COLUMN "salary" SET DEFAULT '-1.0'`);
        await queryRunner.query(`ALTER TABLE "mledb"."player_history" ALTER COLUMN "peak_mmr" SET DEFAULT 0`);
        await queryRunner.query(`DROP INDEX "mledb"."team_to_captain_team_name_league_unique"`);
        await queryRunner.query(`ALTER TABLE "mledb"."team_to_captain" DROP CONSTRAINT "UQ_fed6b7cac1ddc8653523bf9b6fa"`);
        await queryRunner.query(`ALTER TABLE "mledb"."team_to_captain" DROP CONSTRAINT "UQ_bd362a6726194d0dc9faf2712f8"`);
        await queryRunner.query(`CREATE UNIQUE INDEX "team_to_captain_team_name_league_unique" ON "mledb"."team_to_captain" ("league", "team_name") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "mledb"."team_to_captain_team_name_league_unique"`);
        await queryRunner.query(`ALTER TABLE "mledb"."team_to_captain" ADD CONSTRAINT "UQ_bd362a6726194d0dc9faf2712f8" UNIQUE ("league")`);
        await queryRunner.query(`ALTER TABLE "mledb"."team_to_captain" ADD CONSTRAINT "UQ_fed6b7cac1ddc8653523bf9b6fa" UNIQUE ("team_name")`);
        await queryRunner.query(`CREATE UNIQUE INDEX "team_to_captain_team_name_league_unique" ON "mledb"."team_to_captain" ("team_name", "league") `);
        await queryRunner.query(`ALTER TABLE "mledb"."player_history" ALTER COLUMN "peak_mmr" SET DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "mledb"."player_history" ALTER COLUMN "salary" SET DEFAULT '-1'`);
        await queryRunner.query(`ALTER TABLE "mledb"."series_replay" ALTER COLUMN "overtime_seconds" SET DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "mledb"."elo_data" ALTER COLUMN "chain" SET DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "mledb"."season" ALTER COLUMN "week_length" SET DEFAULT '7'`);
        await queryRunner.query(`ALTER TABLE "mledb"."player" ALTER COLUMN "peak_mmr" SET DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "mledb"."player" ALTER COLUMN "salary" SET DEFAULT '-1'`);
    }

}
