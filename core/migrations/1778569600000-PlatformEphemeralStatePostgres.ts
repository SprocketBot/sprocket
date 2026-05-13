import {MigrationInterface, QueryRunner} from "typeorm";

export class PlatformEphemeralStatePostgres1778569600000 implements MigrationInterface {
    name = "PlatformEphemeralStatePostgres1778569600000";

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("CREATE SCHEMA IF NOT EXISTS \"sprocket\"");

        await queryRunner.query(`
            CREATE TABLE "sprocket"."scrim_queue" (
                "id" uuid NOT NULL,
                "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "status" text NOT NULL,
                "unlocked_status" text,
                "author_id" integer NOT NULL,
                "organization_id" integer NOT NULL,
                "game_mode_id" integer NOT NULL,
                "skill_group_id" integer NOT NULL,
                "submission_id" text,
                "timeout_job_id" text,
                "group_invite_opens_at" TIMESTAMP WITH TIME ZONE,
                "popped_at" TIMESTAMP WITH TIME ZONE,
                "lobby_name" text,
                "lobby_password" text,
                "settings_team_size" integer NOT NULL,
                "settings_team_count" integer NOT NULL,
                "settings_mode" text NOT NULL,
                "settings_competitive" boolean NOT NULL,
                "settings_observable" boolean NOT NULL,
                "settings_lfs" boolean NOT NULL DEFAULT false,
                "settings_checkin_timeout" integer NOT NULL,
                CONSTRAINT "PK_scrim_queue" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query("CREATE INDEX \"IDX_scrim_queue_status\" ON \"sprocket\".\"scrim_queue\" (\"status\")");
        await queryRunner.query("CREATE INDEX \"IDX_scrim_queue_submission_id\" ON \"sprocket\".\"scrim_queue\" (\"submission_id\")");
        await queryRunner.query("CREATE INDEX \"IDX_scrim_queue_skill_group_id\" ON \"sprocket\".\"scrim_queue\" (\"skill_group_id\")");
        // Index for scrim clock efficient query - find pending/popped scrims that may need cleanup
        await queryRunner.query("CREATE INDEX \"IDX_scrim_queue_status_updated\" ON \"sprocket\".\"scrim_queue\" (\"status\", \"updated_at\")");

        await queryRunner.query(`
            CREATE TABLE "sprocket"."scrim_queue_player" (
                "scrim_id" uuid NOT NULL,
                "player_id" integer NOT NULL,
                "position" integer NOT NULL,
                "name" text NOT NULL,
                "joined_at" TIMESTAMP WITH TIME ZONE NOT NULL,
                "leave_at" TIMESTAMP WITH TIME ZONE NOT NULL,
                "group_key" text,
                "checked_in" boolean,
                CONSTRAINT "PK_scrim_queue_player" PRIMARY KEY ("scrim_id", "player_id"),
                CONSTRAINT "FK_scrim_queue_player_scrim" FOREIGN KEY ("scrim_id") REFERENCES "sprocket"."scrim_queue"("id") ON DELETE CASCADE
            )
        `);
        await queryRunner.query("CREATE INDEX \"IDX_scrim_queue_player_player_id\" ON \"sprocket\".\"scrim_queue_player\" (\"player_id\")");

        await queryRunner.query(`
            CREATE TABLE "sprocket"."scrim_queue_game" (
                "id" SERIAL NOT NULL,
                "scrim_id" uuid NOT NULL,
                "position" integer NOT NULL,
                CONSTRAINT "PK_scrim_queue_game" PRIMARY KEY ("id"),
                CONSTRAINT "UQ_scrim_queue_game_position" UNIQUE ("scrim_id", "position"),
                CONSTRAINT "FK_scrim_queue_game_scrim" FOREIGN KEY ("scrim_id") REFERENCES "sprocket"."scrim_queue"("id") ON DELETE CASCADE
            )
        `);

        await queryRunner.query(`
            CREATE TABLE "sprocket"."scrim_queue_game_player" (
                "game_id" integer NOT NULL,
                "team_index" integer NOT NULL,
                "position" integer NOT NULL,
                "player_id" integer NOT NULL,
                "name" text NOT NULL,
                "joined_at" TIMESTAMP WITH TIME ZONE NOT NULL,
                "leave_at" TIMESTAMP WITH TIME ZONE NOT NULL,
                "group_key" text,
                "checked_in" boolean,
                CONSTRAINT "PK_scrim_queue_game_player" PRIMARY KEY ("game_id", "team_index", "position"),
                CONSTRAINT "FK_scrim_queue_game_player_game" FOREIGN KEY ("game_id") REFERENCES "sprocket"."scrim_queue_game"("id") ON DELETE CASCADE
            )
        `);

        await queryRunner.query(`
            CREATE TABLE "sprocket"."replay_submission" (
                "id" text NOT NULL,
                "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "creator_id" integer NOT NULL,
                "status" text NOT NULL,
                "type" text NOT NULL,
                "task_ids" text[] NOT NULL DEFAULT '{}',
                "validated" boolean NOT NULL DEFAULT false,
                "stats" jsonb,
                "required_ratifications" integer NOT NULL,
                "scrim_id" uuid,
                "match_id" integer,
                "home_franchise_id" integer,
                "away_franchise_id" integer,
                "required_franchises" integer,
                "current_franchise_count" integer,
                CONSTRAINT "PK_replay_submission" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query("CREATE INDEX \"IDX_replay_submission_status\" ON \"sprocket\".\"replay_submission\" (\"status\")");
        await queryRunner.query("CREATE INDEX \"IDX_replay_submission_scrim_id\" ON \"sprocket\".\"replay_submission\" (\"scrim_id\")");
        await queryRunner.query("CREATE INDEX \"IDX_replay_submission_match_id\" ON \"sprocket\".\"replay_submission\" (\"match_id\")");

        await queryRunner.query(`
            CREATE TABLE "sprocket"."replay_submission_item" (
                "submission_id" text NOT NULL,
                "task_id" text NOT NULL,
                "position" integer NOT NULL,
                "original_filename" text NOT NULL,
                "input_path" text NOT NULL,
                "output_path" text,
                "progress" jsonb,
                CONSTRAINT "PK_replay_submission_item" PRIMARY KEY ("submission_id", "task_id"),
                CONSTRAINT "FK_replay_submission_item_submission" FOREIGN KEY ("submission_id") REFERENCES "sprocket"."replay_submission"("id") ON DELETE CASCADE
            )
        `);

        await queryRunner.query(`
            CREATE TABLE "sprocket"."replay_submission_ratifier" (
                "id" SERIAL NOT NULL,
                "submission_id" text NOT NULL,
                "player_id" integer NOT NULL,
                "franchise_id" integer,
                "franchise_name" text,
                "ratified_at" TIMESTAMP WITH TIME ZONE,
                CONSTRAINT "PK_replay_submission_ratifier" PRIMARY KEY ("id"),
                CONSTRAINT "UQ_replay_submission_ratifier_player" UNIQUE ("submission_id", "player_id"),
                CONSTRAINT "FK_replay_submission_ratifier_submission" FOREIGN KEY ("submission_id") REFERENCES "sprocket"."replay_submission"("id") ON DELETE CASCADE
            )
        `);

        await queryRunner.query(`
            CREATE TABLE "sprocket"."replay_submission_rejection" (
                "id" SERIAL NOT NULL,
                "submission_id" text NOT NULL,
                "player_id" integer NOT NULL,
                "reason" text NOT NULL,
                "rejected_at" TIMESTAMP WITH TIME ZONE NOT NULL,
                "stale" boolean NOT NULL DEFAULT false,
                CONSTRAINT "PK_replay_submission_rejection" PRIMARY KEY ("id"),
                CONSTRAINT "FK_replay_submission_rejection_submission" FOREIGN KEY ("submission_id") REFERENCES "sprocket"."replay_submission"("id") ON DELETE CASCADE
            )
        `);

        await queryRunner.query(`
            CREATE TABLE "sprocket"."replay_submission_rejection_item" (
                "rejection_id" integer NOT NULL,
                "position" integer NOT NULL,
                "task_id" text NOT NULL,
                "original_filename" text NOT NULL,
                "input_path" text NOT NULL,
                "output_path" text,
                CONSTRAINT "PK_replay_submission_rejection_item" PRIMARY KEY ("rejection_id", "position"),
                CONSTRAINT "FK_replay_submission_rejection_item_rejection" FOREIGN KEY ("rejection_id") REFERENCES "sprocket"."replay_submission_rejection"("id") ON DELETE CASCADE
            )
        `);

        await queryRunner.query(`
            CREATE TABLE "sprocket"."platform_rpc_queue" (
                "id" uuid NOT NULL,
                "queue" text NOT NULL,
                "pattern" text NOT NULL,
                "payload" jsonb NOT NULL,
                "response" jsonb,
                "error" jsonb,
                "status" text NOT NULL DEFAULT 'pending',
                "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "locked_at" TIMESTAMP WITH TIME ZONE,
                CONSTRAINT "PK_platform_rpc_queue" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query("CREATE INDEX \"IDX_platform_rpc_queue_pending\" ON \"sprocket\".\"platform_rpc_queue\" (\"queue\", \"status\", \"created_at\")");
        await queryRunner.query("CREATE INDEX \"IDX_platform_rpc_queue_locked_at\" ON \"sprocket\".\"platform_rpc_queue\" (\"status\", \"locked_at\") WHERE \"status\" = 'processing'");

        await queryRunner.query(`
            CREATE TABLE "sprocket"."platform_event" (
                "id" BIGSERIAL NOT NULL,
                "topic" text NOT NULL,
                "payload" jsonb NOT NULL,
                "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                CONSTRAINT "PK_platform_event" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query("CREATE INDEX \"IDX_platform_event_topic\" ON \"sprocket\".\"platform_event\" (\"topic\", \"id\")");
        await queryRunner.query("CREATE INDEX \"IDX_platform_event_created_at\" ON \"sprocket\".\"platform_event\" (\"created_at\")");

        await queryRunner.query(`
            CREATE TABLE "sprocket"."platform_task_queue" (
                "id" text NOT NULL,
                "task" text NOT NULL,
                "args" jsonb NOT NULL,
                "progress_queue" text,
                "status" text NOT NULL DEFAULT 'pending',
                "result" jsonb,
                "error" jsonb,
                "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "locked_at" TIMESTAMP WITH TIME ZONE,
                CONSTRAINT "PK_platform_task_queue" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query("CREATE INDEX \"IDX_platform_task_queue_pending\" ON \"sprocket\".\"platform_task_queue\" (\"status\", \"created_at\")");

        await queryRunner.query(`
            CREATE TABLE "sprocket"."platform_task_progress" (
                "id" BIGSERIAL NOT NULL,
                "task_id" text NOT NULL,
                "progress_queue" text NOT NULL,
                "message" jsonb NOT NULL,
                "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                CONSTRAINT "PK_platform_task_progress" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query("CREATE INDEX \"IDX_platform_task_progress_queue\" ON \"sprocket\".\"platform_task_progress\" (\"progress_queue\", \"id\")");

        await queryRunner.query(`
            CREATE TABLE "sprocket"."elo_job_queue" (
                "id" text NOT NULL,
                "endpoint" text NOT NULL,
                "payload" jsonb NOT NULL,
                "status" text NOT NULL DEFAULT 'pending',
                "result" jsonb,
                "error" jsonb,
                "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "locked_at" TIMESTAMP WITH TIME ZONE,
                CONSTRAINT "PK_elo_job_queue" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query("CREATE INDEX \"IDX_elo_job_queue_pending\" ON \"sprocket\".\"elo_job_queue\" (\"status\", \"created_at\")");

        await queryRunner.query(`
            CREATE TABLE "sprocket"."platform_scheduled_job" (
                "name" text NOT NULL,
                "last_run_at" TIMESTAMP WITH TIME ZONE NOT NULL,
                CONSTRAINT "PK_platform_scheduled_job" PRIMARY KEY ("name")
            )
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("DROP TABLE \"sprocket\".\"platform_scheduled_job\"");
        await queryRunner.query("DROP INDEX \"sprocket\".\"IDX_elo_job_queue_pending\"");
        await queryRunner.query("DROP TABLE \"sprocket\".\"elo_job_queue\"");
        await queryRunner.query("DROP INDEX \"sprocket\".\"IDX_platform_task_progress_queue\"");
        await queryRunner.query("DROP TABLE \"sprocket\".\"platform_task_progress\"");
        await queryRunner.query("DROP INDEX \"sprocket\".\"IDX_platform_task_queue_pending\"");
        await queryRunner.query("DROP TABLE \"sprocket\".\"platform_task_queue\"");
        await queryRunner.query("DROP INDEX \"sprocket\".\"IDX_platform_event_topic\"");
        await queryRunner.query("DROP TABLE \"sprocket\".\"platform_event\"");
        await queryRunner.query("DROP INDEX \"sprocket\".\"IDX_platform_rpc_queue_pending\"");
        await queryRunner.query("DROP TABLE \"sprocket\".\"platform_rpc_queue\"");
        await queryRunner.query("DROP TABLE \"sprocket\".\"replay_submission_rejection_item\"");
        await queryRunner.query("DROP TABLE \"sprocket\".\"replay_submission_rejection\"");
        await queryRunner.query("DROP TABLE \"sprocket\".\"replay_submission_ratifier\"");
        await queryRunner.query("DROP TABLE \"sprocket\".\"replay_submission_item\"");
        await queryRunner.query("DROP INDEX \"sprocket\".\"IDX_replay_submission_match_id\"");
        await queryRunner.query("DROP INDEX \"sprocket\".\"IDX_replay_submission_scrim_id\"");
        await queryRunner.query("DROP INDEX \"sprocket\".\"IDX_replay_submission_status\"");
        await queryRunner.query("DROP TABLE \"sprocket\".\"replay_submission\"");
        await queryRunner.query("DROP TABLE \"sprocket\".\"scrim_queue_game_player\"");
        await queryRunner.query("DROP TABLE \"sprocket\".\"scrim_queue_game\"");
        await queryRunner.query("DROP INDEX \"sprocket\".\"IDX_scrim_queue_player_player_id\"");
        await queryRunner.query("DROP TABLE \"sprocket\".\"scrim_queue_player\"");
        await queryRunner.query("DROP INDEX \"sprocket\".\"IDX_scrim_queue_skill_group_id\"");
        await queryRunner.query("DROP INDEX \"sprocket\".\"IDX_scrim_queue_submission_id\"");
        await queryRunner.query("DROP INDEX \"sprocket\".\"IDX_scrim_queue_status\"");
        await queryRunner.query("DROP TABLE \"sprocket\".\"scrim_queue\"");
    }
}
