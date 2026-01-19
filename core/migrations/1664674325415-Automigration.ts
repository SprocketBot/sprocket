import { MigrationInterface, QueryRunner } from 'typeorm';

export class Automigration1664674325415 implements MigrationInterface {
  name = 'Automigration1664674325415';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "sprocket"."game_skill_group_profile" ADD "color" character varying NOT NULL DEFAULT '#eeeeee'`,
    );
    await queryRunner.query(
      `ALTER TABLE "sprocket"."game_skill_group_profile" ALTER COLUMN "color" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "sprocket"."game_skill_group_profile" ADD "photoId" integer`,
    );
    await queryRunner.query(
      `ALTER TABLE "sprocket"."game_skill_group_profile" ADD CONSTRAINT "UQ_f7e156a2c53a4ecf5184502665d" UNIQUE ("photoId")`,
    );
    await queryRunner.query(
      `ALTER TABLE "sprocket"."game_skill_group_profile" ADD CONSTRAINT "FK_f7e156a2c53a4ecf5184502665d" FOREIGN KEY ("photoId") REFERENCES "photo"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "sprocket"."game_skill_group_profile" DROP CONSTRAINT "FK_f7e156a2c53a4ecf5184502665d"`,
    );
    await queryRunner.query(
      `ALTER TABLE "sprocket"."game_skill_group_profile" DROP CONSTRAINT "UQ_f7e156a2c53a4ecf5184502665d"`,
    );
    await queryRunner.query(
      `ALTER TABLE "sprocket"."game_skill_group_profile" DROP COLUMN "photoId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "sprocket"."game_skill_group_profile" DROP COLUMN "color"`,
    );
  }
}
