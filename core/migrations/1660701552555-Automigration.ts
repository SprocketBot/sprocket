import { MigrationInterface, QueryRunner } from "typeorm";

export class Automigration1660701552555 implements MigrationInterface {
    name = 'Automigration1660701552555'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "mledb_bridge"."division_to_franchise_group" ("id" SERIAL NOT NULL, "divison" character varying NOT NULL, "franchiseGroupId" integer NOT NULL, CONSTRAINT "PK_d8756b189a98d02d751f0ff1132" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "mledb_bridge"."league_to_skill_group" ("id" SERIAL NOT NULL, "league" character varying NOT NULL, "skillGroupId" integer NOT NULL, CONSTRAINT "PK_8512c6e65c876c277627a76b1d6" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "mledb_bridge"."league_to_skill_group"`);
        await queryRunner.query(`DROP TABLE "mledb_bridge"."division_to_franchise_group"`);
    }

}
