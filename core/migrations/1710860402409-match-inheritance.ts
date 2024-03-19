import { MigrationInterface, QueryRunner } from "typeorm";

export class MatchInheritance1710860402409 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "fixture" INHERIT "match"`)
        await queryRunner.query(`ALTER TABLE "scrim" INHERIT "match"`)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
