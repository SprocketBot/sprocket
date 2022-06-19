import {MigrationInterface, QueryRunner} from "typeorm";

export class Automigration1655077159398 implements MigrationInterface {
    name = 'Automigration1655077159398'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "mledb"."player_stats_core" ADD "goals_against" integer`);
        await queryRunner.query(`ALTER TABLE "mledb"."player_stats_core" ADD "shots_against" integer`);
        await queryRunner.query(`ALTER TABLE "mledb"."player_stats_core" ADD "opi" real`);
        await queryRunner.query(`ALTER TABLE "mledb"."player_stats_core" ADD "dpi" real`);
        await queryRunner.query(`ALTER TABLE "mledb"."player_stats_core" ADD "gpi" real`);
        await queryRunner.query(`ALTER TABLE "sprocket"."member_restriction" ADD "forgiven" boolean NOT NULL DEFAULT false`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "sprocket"."member_restriction" DROP COLUMN "forgiven"`);
        await queryRunner.query(`ALTER TABLE "mledb"."player_stats_core" DROP COLUMN "gpi"`);
        await queryRunner.query(`ALTER TABLE "mledb"."player_stats_core" DROP COLUMN "dpi"`);
        await queryRunner.query(`ALTER TABLE "mledb"."player_stats_core" DROP COLUMN "opi"`);
        await queryRunner.query(`ALTER TABLE "mledb"."player_stats_core" DROP COLUMN "shots_against"`);
        await queryRunner.query(`ALTER TABLE "mledb"."player_stats_core" DROP COLUMN "goals_against"`);
    }

}
