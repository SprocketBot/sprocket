import { MigrationInterface, QueryRunner } from 'typeorm';

export class PlatformJsonbValidationConstraints1779500000000 implements MigrationInterface {
  name = 'PlatformJsonbValidationConstraints1779500000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add CHECK constraints to reject malformed JSON at the database level
    // This provides a safety net so malformed JSON is rejected on write, not read

    // platform_rpc_queue table
    await queryRunner.query(`
      ALTER TABLE "sprocket"."platform_rpc_queue"
      DROP CONSTRAINT IF EXISTS "CK_platform_rpc_queue_payload_valid_json",
      ADD CONSTRAINT "CK_platform_rpc_queue_payload_valid_json"
      CHECK (payload IS NULL OR jsonb_typeof(payload) IS NOT NULL)
    `);

    await queryRunner.query(`
      ALTER TABLE "sprocket"."platform_rpc_queue"
      DROP CONSTRAINT IF EXISTS "CK_platform_rpc_queue_response_valid_json",
      ADD CONSTRAINT "CK_platform_rpc_queue_response_valid_json"
      CHECK (response IS NULL OR jsonb_typeof(response) IS NOT NULL)
    `);

    await queryRunner.query(`
      ALTER TABLE "sprocket"."platform_rpc_queue"
      DROP CONSTRAINT IF EXISTS "CK_platform_rpc_queue_error_valid_json",
      ADD CONSTRAINT "CK_platform_rpc_queue_error_valid_json"
      CHECK (error IS NULL OR jsonb_typeof(error) IS NOT NULL)
    `);

    // platform_event table
    await queryRunner.query(`
      ALTER TABLE "sprocket"."platform_event"
      DROP CONSTRAINT IF EXISTS "CK_platform_event_payload_valid_json",
      ADD CONSTRAINT "CK_platform_event_payload_valid_json"
      CHECK (payload IS NULL OR jsonb_typeof(payload) IS NOT NULL)
    `);

    // platform_task_queue table
    await queryRunner.query(`
      ALTER TABLE "sprocket"."platform_task_queue"
      DROP CONSTRAINT IF EXISTS "CK_platform_task_queue_args_valid_json",
      ADD CONSTRAINT "CK_platform_task_queue_args_valid_json"
      CHECK (args IS NULL OR jsonb_typeof(args) IS NOT NULL)
    `);

    await queryRunner.query(`
      ALTER TABLE "sprocket"."platform_task_queue"
      DROP CONSTRAINT IF EXISTS "CK_platform_task_queue_result_valid_json",
      ADD CONSTRAINT "CK_platform_task_queue_result_valid_json"
      CHECK (result IS NULL OR jsonb_typeof(result) IS NOT NULL)
    `);

    await queryRunner.query(`
      ALTER TABLE "sprocket"."platform_task_queue"
      DROP CONSTRAINT IF EXISTS "CK_platform_task_queue_error_valid_json",
      ADD CONSTRAINT "CK_platform_task_queue_error_valid_json"
      CHECK (error IS NULL OR jsonb_typeof(error) IS NOT NULL)
    `);

    // platform_task_progress table
    await queryRunner.query(`
      ALTER TABLE "sprocket"."platform_task_progress"
      DROP CONSTRAINT IF EXISTS "CK_platform_task_progress_message_valid_json",
      ADD CONSTRAINT "CK_platform_task_progress_message_valid_json"
      CHECK (message IS NULL OR jsonb_typeof(message) IS NOT NULL)
    `);

    // elo_job_queue table
    await queryRunner.query(`
      ALTER TABLE "sprocket"."elo_job_queue"
      DROP CONSTRAINT IF EXISTS "CK_elo_job_queue_payload_valid_json",
      ADD CONSTRAINT "CK_elo_job_queue_payload_valid_json"
      CHECK (payload IS NULL OR jsonb_typeof(payload) IS NOT NULL)
    `);

    await queryRunner.query(`
      ALTER TABLE "sprocket"."elo_job_queue"
      DROP CONSTRAINT IF EXISTS "CK_elo_job_queue_result_valid_json",
      ADD CONSTRAINT "CK_elo_job_queue_result_valid_json"
      CHECK (result IS NULL OR jsonb_typeof(result) IS NOT NULL)
    `);

    await queryRunner.query(`
      ALTER TABLE "sprocket"."elo_job_queue"
      DROP CONSTRAINT IF EXISTS "CK_elo_job_queue_error_valid_json",
      ADD CONSTRAINT "CK_elo_job_queue_error_valid_json"
      CHECK (error IS NULL OR jsonb_typeof(error) IS NOT NULL)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop all CHECK constraints
    await queryRunner.query(`
      ALTER TABLE "sprocket"."platform_rpc_queue"
      DROP CONSTRAINT IF EXISTS "CK_platform_rpc_queue_payload_valid_json"
    `);
    await queryRunner.query(`
      ALTER TABLE "sprocket"."platform_rpc_queue"
      DROP CONSTRAINT IF EXISTS "CK_platform_rpc_queue_response_valid_json"
    `);
    await queryRunner.query(`
      ALTER TABLE "sprocket"."platform_rpc_queue"
      DROP CONSTRAINT IF EXISTS "CK_platform_rpc_queue_error_valid_json"
    `);

    await queryRunner.query(`
      ALTER TABLE "sprocket"."platform_event"
      DROP CONSTRAINT IF EXISTS "CK_platform_event_payload_valid_json"
    `);

    await queryRunner.query(`
      ALTER TABLE "sprocket"."platform_task_queue"
      DROP CONSTRAINT IF EXISTS "CK_platform_task_queue_args_valid_json"
    `);
    await queryRunner.query(`
      ALTER TABLE "sprocket"."platform_task_queue"
      DROP CONSTRAINT IF EXISTS "CK_platform_task_queue_result_valid_json"
    `);
    await queryRunner.query(`
      ALTER TABLE "sprocket"."platform_task_queue"
      DROP CONSTRAINT IF EXISTS "CK_platform_task_queue_error_valid_json"
    `);

    await queryRunner.query(`
      ALTER TABLE "sprocket"."platform_task_progress"
      DROP CONSTRAINT IF EXISTS "CK_platform_task_progress_message_valid_json"
    `);

    await queryRunner.query(`
      ALTER TABLE "sprocket"."elo_job_queue"
      DROP CONSTRAINT IF EXISTS "CK_elo_job_queue_payload_valid_json"
    `);
    await queryRunner.query(`
      ALTER TABLE "sprocket"."elo_job_queue"
      DROP CONSTRAINT IF EXISTS "CK_elo_job_queue_result_valid_json"
    `);
    await queryRunner.query(`
      ALTER TABLE "sprocket"."elo_job_queue"
      DROP CONSTRAINT IF EXISTS "CK_elo_job_queue_error_valid_json"
    `);
  }
}