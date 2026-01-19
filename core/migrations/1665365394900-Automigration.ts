import { MigrationInterface, QueryRunner } from 'typeorm';

export class Automigration1665365394900 implements MigrationInterface {
  name = 'Automigration1665365394900';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "match" ADD "invalidationId" integer`);
    await queryRunner.query(
      `ALTER TABLE "match" ADD CONSTRAINT "UQ_d2e8052c65eaaca7a07ff1aa52d" UNIQUE ("invalidationId")`,
    );
    await queryRunner.query(
      `ALTER TABLE "match" ADD CONSTRAINT "FK_d2e8052c65eaaca7a07ff1aa52d" FOREIGN KEY ("invalidationId") REFERENCES "invalidation"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "match" DROP CONSTRAINT "FK_d2e8052c65eaaca7a07ff1aa52d"`);
    await queryRunner.query(`ALTER TABLE "match" DROP CONSTRAINT "UQ_d2e8052c65eaaca7a07ff1aa52d"`);
    await queryRunner.query(`ALTER TABLE "match" DROP COLUMN "invalidationId"`);
  }
}
