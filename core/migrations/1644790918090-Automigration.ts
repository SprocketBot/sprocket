import {MigrationInterface, QueryRunner} from "typeorm";

export class Automigration1644790918090 implements MigrationInterface {
    name = 'Automigration1644790918090'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "public"."game_mode" ADD "teamSize" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "public"."game_mode" ADD "teamCount" integer NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "public"."game_mode" DROP COLUMN "teamCount"`);
        await queryRunner.query(`ALTER TABLE "public"."game_mode" DROP COLUMN "teamSize"`);
    }

}
