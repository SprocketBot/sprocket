import {MigrationInterface, QueryRunner} from "typeorm";

export class Automigration1652144137225 implements MigrationInterface {
    name = 'Automigration1652144137225'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "mledb"."player" ALTER COLUMN "salary" SET DEFAULT '-1.0'`);
        await queryRunner.query(`ALTER TABLE "mledb"."player" ALTER COLUMN "peak_mmr" SET DEFAULT 0`);
        await queryRunner.query(`ALTER TABLE "mledb"."elo_data" ALTER COLUMN "chain" SET DEFAULT 0`);
        await queryRunner.query(`ALTER TABLE "mledb"."series_replay" ALTER COLUMN "overtime_seconds" SET DEFAULT 0`);
        await queryRunner.query(`ALTER TABLE "mledb"."season" ALTER COLUMN "week_length" SET DEFAULT 7`);
        await queryRunner.query(`ALTER TABLE "mledb"."draft_order" DROP CONSTRAINT "FK_52f68d99f225e1938ab35ffa7e5"`);
        await queryRunner.query(`ALTER TABLE "mledb"."draft_order" DROP CONSTRAINT "UQ_4fd5ae50f2d3808233b3a73f6eb"`);
        await queryRunner.query(`ALTER TABLE "mledb"."draft_order" DROP CONSTRAINT "UQ_52f68d99f225e1938ab35ffa7e5"`);
        await queryRunner.query(`ALTER TABLE "mledb"."draft_order" DROP CONSTRAINT "UQ_bc3942df933649402075ae1a354"`);
        await queryRunner.query(`ALTER TABLE "mledb"."draft_order" DROP CONSTRAINT "UQ_55008553ad87701e2c85417b3bf"`);
        await queryRunner.query(`ALTER TABLE "mledb"."draft_order" DROP CONSTRAINT "UQ_5e37e1fe1e49c070aa0f5aa988d"`);
        await queryRunner.query(`ALTER TABLE "mledb"."player_history" ALTER COLUMN "salary" SET DEFAULT '-1.0'`);
        await queryRunner.query(`ALTER TABLE "mledb"."player_history" ALTER COLUMN "peak_mmr" SET DEFAULT 0`);
        await queryRunner.query(`ALTER TABLE "mledb"."draft_order" ADD CONSTRAINT "UQ_4fd5ae50f2d3808233b3a73f6eb" UNIQUE ("league", "pick", "round", "season_season_number")`);
        await queryRunner.query(`ALTER TABLE "mledb"."draft_order" ADD CONSTRAINT "FK_52f68d99f225e1938ab35ffa7e5" FOREIGN KEY ("season_season_number") REFERENCES "mledb"."season"("season_number") ON DELETE NO ACTION ON UPDATE CASCADE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "mledb"."draft_order" DROP CONSTRAINT "FK_52f68d99f225e1938ab35ffa7e5"`);
        await queryRunner.query(`ALTER TABLE "mledb"."draft_order" DROP CONSTRAINT "UQ_4fd5ae50f2d3808233b3a73f6eb"`);
        await queryRunner.query(`ALTER TABLE "mledb"."player_history" ALTER COLUMN "peak_mmr" SET DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "mledb"."player_history" ALTER COLUMN "salary" SET DEFAULT '-1'`);
        await queryRunner.query(`ALTER TABLE "mledb"."draft_order" ADD CONSTRAINT "UQ_5e37e1fe1e49c070aa0f5aa988d" UNIQUE ("pick")`);
        await queryRunner.query(`ALTER TABLE "mledb"."draft_order" ADD CONSTRAINT "UQ_55008553ad87701e2c85417b3bf" UNIQUE ("round")`);
        await queryRunner.query(`ALTER TABLE "mledb"."draft_order" ADD CONSTRAINT "UQ_bc3942df933649402075ae1a354" UNIQUE ("league")`);
        await queryRunner.query(`ALTER TABLE "mledb"."draft_order" ADD CONSTRAINT "UQ_52f68d99f225e1938ab35ffa7e5" UNIQUE ("season_season_number")`);
        await queryRunner.query(`ALTER TABLE "mledb"."draft_order" ADD CONSTRAINT "UQ_4fd5ae50f2d3808233b3a73f6eb" UNIQUE ("season_season_number", "league", "round", "pick")`);
        await queryRunner.query(`ALTER TABLE "mledb"."draft_order" ADD CONSTRAINT "FK_52f68d99f225e1938ab35ffa7e5" FOREIGN KEY ("season_season_number") REFERENCES "mledb"."season"("season_number") ON DELETE NO ACTION ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "mledb"."season" ALTER COLUMN "week_length" SET DEFAULT '7'`);
        await queryRunner.query(`ALTER TABLE "mledb"."series_replay" ALTER COLUMN "overtime_seconds" SET DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "mledb"."elo_data" ALTER COLUMN "chain" SET DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "mledb"."player" ALTER COLUMN "peak_mmr" SET DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "mledb"."player" ALTER COLUMN "salary" SET DEFAULT '-1'`);
    }

}
