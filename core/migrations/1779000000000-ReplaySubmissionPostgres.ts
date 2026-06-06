import { MigrationInterface, QueryRunner } from 'typeorm';

export class ReplaySubmissionPostgres1779000000000 implements MigrationInterface {
  name = 'ReplaySubmissionPostgres1779000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('CREATE SCHEMA IF NOT EXISTS "sprocket"');

    // Main submission table
    await queryRunner.query(`
      CREATE TABLE "sprocket"."replay_submission" (
        "id" uuid NOT NULL,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "creator_id" integer NOT NULL,
        "status" text NOT NULL,
        "type" text NOT NULL,
        "task_ids" text[] NOT NULL DEFAULT '{}',
        "validated" boolean NOT NULL DEFAULT false,
        "stats" jsonb,
        "required_ratifications" integer NOT NULL DEFAULT 2,
        "scrim_id" text,
        "match_id" integer,
        "home_franchise_id" integer,
        "away_franchise_id" integer,
        "required_franchises" integer,
        "current_franchise_count" integer NOT NULL DEFAULT 0,
        CONSTRAINT "PK_replay_submission" PRIMARY KEY ("id")
      )
    `);

    // Indexes for replay_submission
    await queryRunner.query(`CREATE INDEX "IDX_replay_submission_status" ON "sprocket"."replay_submission" ("status")`);
    await queryRunner.query(`CREATE INDEX "IDX_replay_submission_type" ON "sprocket"."replay_submission" ("type")`);
    await queryRunner.query(`CREATE INDEX "IDX_replay_submission_scrim_id" ON "sprocket"."replay_submission" ("scrim_id")`);
    await queryRunner.query(`CREATE INDEX "IDX_replay_submission_match_id" ON "sprocket"."replay_submission" ("match_id")`);
    await queryRunner.query(`CREATE INDEX "IDX_replay_submission_creator_id" ON "sprocket"."replay_submission" ("creator_id")`);

    // Submission items table (replay files)
    await queryRunner.query(`
      CREATE TABLE "sprocket"."replay_submission_item" (
        "id" SERIAL NOT NULL,
        "submission_id" uuid NOT NULL,
        "task_id" text NOT NULL,
        "position" integer NOT NULL,
        "original_filename" text NOT NULL,
        "input_path" text NOT NULL,
        "output_path" text,
        "progress" jsonb,
        CONSTRAINT "PK_replay_submission_item" PRIMARY KEY ("id"),
        CONSTRAINT "FK_replay_submission_item_submission" FOREIGN KEY ("submission_id") 
          REFERENCES "sprocket"."replay_submission"("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`CREATE INDEX "IDX_replay_submission_item_submission_id" ON "sprocket"."replay_submission_item" ("submission_id")`);

    // Ratifiers table
    await queryRunner.query(`
      CREATE TABLE "sprocket"."replay_submission_ratifier" (
        "id" SERIAL NOT NULL,
        "submission_id" uuid NOT NULL,
        "player_id" integer NOT NULL,
        "franchise_id" integer,
        "franchise_name" text,
        "ratified_at" TIMESTAMP WITH TIME ZONE,
        CONSTRAINT "PK_replay_submission_ratifier" PRIMARY KEY ("id"),
        CONSTRAINT "FK_replay_submission_ratifier_submission" FOREIGN KEY ("submission_id") 
          REFERENCES "sprocket"."replay_submission"("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`CREATE INDEX "IDX_replay_submission_ratifier_submission_id" ON "sprocket"."replay_submission_ratifier" ("submission_id")`);
    await queryRunner.query(`CREATE INDEX "IDX_replay_submission_ratifier_player_id" ON "sprocket"."replay_submission_ratifier" ("player_id")`);

    // Rejections table
    await queryRunner.query(`
      CREATE TABLE "sprocket"."replay_submission_rejection" (
        "id" SERIAL NOT NULL,
        "submission_id" uuid NOT NULL,
        "player_id" integer NOT NULL,
        "reason" text NOT NULL,
        "rejected_at" TIMESTAMP WITH TIME ZONE NOT NULL,
        "stale" boolean NOT NULL DEFAULT false,
        CONSTRAINT "PK_replay_submission_rejection" PRIMARY KEY ("id"),
        CONSTRAINT "FK_replay_submission_rejection_submission" FOREIGN KEY ("submission_id") 
          REFERENCES "sprocket"."replay_submission"("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`CREATE INDEX "IDX_replay_submission_rejection_submission_id" ON "sprocket"."replay_submission_rejection" ("submission_id")`);
    await queryRunner.query(`CREATE INDEX "IDX_replay_submission_rejection_player_id" ON "sprocket"."replay_submission_rejection" ("player_id")`);

    // Rejection items table
    await queryRunner.query(`
      CREATE TABLE "sprocket"."replay_submission_rejection_item" (
        "id" SERIAL NOT NULL,
        "rejection_id" integer NOT NULL,
        "task_id" text NOT NULL,
        "position" integer NOT NULL,
        "original_filename" text NOT NULL,
        "input_path" text NOT NULL,
        "output_path" text,
        CONSTRAINT "PK_replay_submission_rejection_item" PRIMARY KEY ("id"),
        CONSTRAINT "FK_replay_submission_rejection_item_rejection" FOREIGN KEY ("rejection_id") 
          REFERENCES "sprocket"."replay_submission_rejection"("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`CREATE INDEX "IDX_replay_submission_rejection_item_rejection_id" ON "sprocket"."replay_submission_rejection_item" ("rejection_id")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "sprocket"."replay_submission_rejection_item"`);
    await queryRunner.query(`DROP TABLE "sprocket"."replay_submission_rejection"`);
    await queryRunner.query(`DROP TABLE "sprocket"."replay_submission_ratifier"`);
    await queryRunner.query(`DROP TABLE "sprocket"."replay_submission_item"`);
    await queryRunner.query(`DROP TABLE "sprocket"."replay_submission"`);
  }
}
