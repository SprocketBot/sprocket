import { MigrationInterface, QueryRunner } from 'typeorm';

export class ScrimQueueReadIndexes1779600000000 implements MigrationInterface {
  name = 'ScrimQueueReadIndexes1779600000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'CREATE INDEX IF NOT EXISTS "IDX_scrim_queue_org_status_created" ON "sprocket"."scrim_queue" ("organization_id", "status", "created_at")',
    );
    await queryRunner.query(
      'CREATE INDEX IF NOT EXISTS "IDX_scrim_queue_org_lfs_status_created" ON "sprocket"."scrim_queue" ("organization_id", "settings_lfs", "status", "created_at")',
    );
    await queryRunner.query(
      'CREATE INDEX IF NOT EXISTS "IDX_scrim_queue_org_competitive_skill_status" ON "sprocket"."scrim_queue" ("organization_id", "settings_competitive", "skill_group_id", "status")',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP INDEX IF EXISTS "sprocket"."IDX_scrim_queue_org_competitive_skill_status"');
    await queryRunner.query('DROP INDEX IF EXISTS "sprocket"."IDX_scrim_queue_org_lfs_status_created"');
    await queryRunner.query('DROP INDEX IF EXISTS "sprocket"."IDX_scrim_queue_org_status_created"');
  }
}
