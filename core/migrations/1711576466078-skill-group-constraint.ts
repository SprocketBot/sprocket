import { MigrationInterface, QueryRunner } from "typeorm";
export class skillGroupConstraint1711576466078 implements MigrationInterface {
  name = 'skillGroupConstraint1711576466078'

  public async up (queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "sprocket"."skill_group" ADD CONSTRAINT "UQ_6fdf4027ecd26569aa7702ac1eb" UNIQUE ("name", "code", "gameId")`);
  }
  public async down (queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "sprocket"."skill_group" DROP CONSTRAINT "UQ_6fdf4027ecd26569aa7702ac1eb"`);
  }
}