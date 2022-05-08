import {MigrationInterface, QueryRunner} from "typeorm";

export class Automigration1652053355792 implements MigrationInterface {
    name = 'Automigration1652053355792'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "sprocket"."member_restriction_type_enum" AS ENUM('SCRIM_BAN')`);
        await queryRunner.query(`CREATE TABLE "sprocket"."member_restriction" ("id" SERIAL NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "type" "sprocket"."member_restriction_type_enum" NOT NULL, "expiration" TIMESTAMP NOT NULL, "manualExpiration" TIMESTAMP, CONSTRAINT "PK_45e411646addd834fb79d1bf26c" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "mledb"."player" ALTER COLUMN "salary" SET DEFAULT '-1.0'`);
        await queryRunner.query(`ALTER TABLE "mledb"."player" ALTER COLUMN "peak_mmr" SET DEFAULT 0`);
        await queryRunner.query(`ALTER TABLE "mledb"."elo_data" ALTER COLUMN "chain" SET DEFAULT 0`);
        await queryRunner.query(`ALTER TABLE "mledb"."series_replay" ALTER COLUMN "overtime_seconds" SET DEFAULT 0`);
        await queryRunner.query(`ALTER TABLE "mledb"."season" ALTER COLUMN "week_length" SET DEFAULT 7`);
        await queryRunner.query(`ALTER TABLE "mledb"."player_history" ALTER COLUMN "salary" SET DEFAULT '-1.0'`);
        await queryRunner.query(`ALTER TABLE "mledb"."player_history" ALTER COLUMN "peak_mmr" SET DEFAULT 0`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "mledb"."player_history" ALTER COLUMN "peak_mmr" SET DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "mledb"."player_history" ALTER COLUMN "salary" SET DEFAULT '-1'`);
        await queryRunner.query(`ALTER TABLE "mledb"."season" ALTER COLUMN "week_length" SET DEFAULT '7'`);
        await queryRunner.query(`ALTER TABLE "mledb"."series_replay" ALTER COLUMN "overtime_seconds" SET DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "mledb"."elo_data" ALTER COLUMN "chain" SET DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "mledb"."player" ALTER COLUMN "peak_mmr" SET DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "mledb"."player" ALTER COLUMN "salary" SET DEFAULT '-1'`);
        await queryRunner.query(`DROP TABLE "sprocket"."member_restriction"`);
        await queryRunner.query(`DROP TYPE "sprocket"."member_restriction_type_enum"`);
    }

}
