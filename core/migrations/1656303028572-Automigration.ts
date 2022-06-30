import {MigrationInterface, QueryRunner} from "typeorm";

export class Automigration1656303028572 implements MigrationInterface {
    name = 'Automigration1656303028572'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "sprocket"."game_skill_group" ADD "organizationId" integer`);
        await queryRunner.query(`ALTER TABLE "sprocket"."game_skill_group" ADD CONSTRAINT "FK_0d41e2ff4e742d1af247da56425" FOREIGN KEY ("organizationId") REFERENCES "sprocket"."organization"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "sprocket"."game_skill_group" DROP CONSTRAINT "FK_0d41e2ff4e742d1af247da56425"`);
        await queryRunner.query(`ALTER TABLE "sprocket"."game_skill_group" DROP COLUMN "organizationId"`);
    }

}
