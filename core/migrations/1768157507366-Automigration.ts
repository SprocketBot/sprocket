import { MigrationInterface, QueryRunner } from 'typeorm';

export class Automigration1768157507366 implements MigrationInterface {
  name = 'Automigration1768157507366';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "sprocket"."scrim_meta" ADD "isCompetitive" boolean NOT NULL DEFAULT true`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "sprocket"."scrim_meta" DROP COLUMN "isCompetitive"`);
  }
}
