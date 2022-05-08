import {MigrationInterface, QueryRunner} from "typeorm";

export class Automigration1652045128667 implements MigrationInterface {
    name = 'Automigration1652045128667'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "sprocket"."user_profile" ADD "displayName" character varying NOT NULL DEFAULT 'Sprocket User'`);
        await queryRunner.query(`ALTER TABLE "mledb"."player" ALTER COLUMN "salary" SET DEFAULT '-1.0'`);
        await queryRunner.query(`ALTER TABLE "mledb"."player" ALTER COLUMN "peak_mmr" SET DEFAULT 0`);
        await queryRunner.query(`ALTER TABLE "mledb"."season" ALTER COLUMN "week_length" SET DEFAULT 7`);
        await queryRunner.query(`ALTER TABLE "mledb"."elo_data" ALTER COLUMN "chain" SET DEFAULT 0`);
        await queryRunner.query(`ALTER TABLE "mledb"."series_replay" ALTER COLUMN "overtime_seconds" SET DEFAULT 0`);
        await queryRunner.query(`ALTER TABLE "mledb"."player_history" ALTER COLUMN "salary" SET DEFAULT '-1.0'`);
        await queryRunner.query(`ALTER TABLE "mledb"."player_history" ALTER COLUMN "peak_mmr" SET DEFAULT 0`);
        await queryRunner.query(`ALTER TABLE "sprocket"."user_profile" ALTER COLUMN "firstName" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "sprocket"."user_profile" ALTER COLUMN "lastName" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "sprocket"."user_profile" ALTER COLUMN "description" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "sprocket"."user_profile" ALTER COLUMN "description" DROP DEFAULT`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "sprocket"."user_profile" ALTER COLUMN "description" SET DEFAULT ''`);
        await queryRunner.query(`ALTER TABLE "sprocket"."user_profile" ALTER COLUMN "description" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "sprocket"."user_profile" ALTER COLUMN "lastName" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "sprocket"."user_profile" ALTER COLUMN "firstName" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "mledb"."player_history" ALTER COLUMN "peak_mmr" SET DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "mledb"."player_history" ALTER COLUMN "salary" SET DEFAULT '-1'`);
        await queryRunner.query(`ALTER TABLE "mledb"."series_replay" ALTER COLUMN "overtime_seconds" SET DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "mledb"."elo_data" ALTER COLUMN "chain" SET DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "mledb"."season" ALTER COLUMN "week_length" SET DEFAULT '7'`);
        await queryRunner.query(`ALTER TABLE "mledb"."player" ALTER COLUMN "peak_mmr" SET DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "mledb"."player" ALTER COLUMN "salary" SET DEFAULT '-1'`);
        await queryRunner.query(`ALTER TABLE "sprocket"."user_profile" DROP COLUMN "displayName"`);
    }

}
