import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddTokenVersionToUserProfile1787856000000 implements MigrationInterface {
  name = 'AddTokenVersionToUserProfile1787856000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "user_profile" ADD "tokenVersion" integer DEFAULT 0`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "user_profile" DROP COLUMN "tokenVersion"`);
  }
}
