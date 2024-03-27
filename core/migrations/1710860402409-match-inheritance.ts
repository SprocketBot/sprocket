import { MigrationInterface, QueryRunner } from "typeorm";

export class MatchInheritance1710860402409 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "sprocket"."fixture" INHERIT "match"`)
        await queryRunner.query(`ALTER TABLE "sprocket"."scrim" INHERIT "match"`)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
