import { MigrationInterface, QueryRunner } from 'typeorm';

export class TrackCasbinPolicies1709826472787 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `SELECT create_history_table('casbin', true::boolean)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`SELECT remove_history_table('casbin')`);
  }
}
