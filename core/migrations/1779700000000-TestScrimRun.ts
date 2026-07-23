import {MigrationInterface, QueryRunner} from "typeorm";

export class TestScrimRun1779700000000 implements MigrationInterface {
    name = "TestScrimRun1779700000000";

    async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            'ALTER TABLE "sprocket"."scrim_queue" ADD COLUMN IF NOT EXISTS "test_run_id" uuid',
        );
        await queryRunner.query(
            'CREATE INDEX IF NOT EXISTS "IDX_scrim_queue_test_run_id" ON "sprocket"."scrim_queue" ("test_run_id")',
        );
    }

    async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query('DROP INDEX IF EXISTS "sprocket"."IDX_scrim_queue_test_run_id"');
        await queryRunner.query(
            'ALTER TABLE "sprocket"."scrim_queue" DROP COLUMN IF EXISTS "test_run_id"',
        );
    }
}
