import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateScrimQueueTable1762982605179 implements MigrationInterface {
    name = 'CreateScrimQueueTable1762982605179'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create QueueStatus enum
        await queryRunner.query(`CREATE TYPE "sprocket"."scrim_queue_status_enum" AS ENUM('QUEUED', 'MATCHED', 'EXPIRED', 'CANCELLED')`);

        // Create scrim_queue table
        await queryRunner.query(`CREATE TABLE "sprocket"."scrim_queue" (
            "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
            "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
            "updateAt" TIMESTAMP NOT NULL DEFAULT now(),
            "skillRating" numeric NOT NULL,
            "queuedAt" TIMESTAMP NOT NULL,
            "status" "sprocket"."scrim_queue_status_enum" NOT NULL,
            "matchedAt" TIMESTAMP,
            "playerId" uuid NOT NULL,
            "gameId" uuid NOT NULL,
            "matchId" uuid,
            CONSTRAINT "PK_5e3c5c3a0c6b7b3b4b4b4b4b4b" PRIMARY KEY ("id")
        )`);

        // Add foreign key constraints
        await queryRunner.query(`ALTER TABLE "sprocket"."scrim_queue" ADD CONSTRAINT "FK_8f3b9b9b9b9b9b9b9b9b9b9b9b" FOREIGN KEY ("playerId") REFERENCES "sprocket"."player"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "sprocket"."scrim_queue" ADD CONSTRAINT "FK_9c4c4c4c4c4c4c4c4c4c4c4c4c" FOREIGN KEY ("gameId") REFERENCES "sprocket"."game"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "sprocket"."scrim_queue" ADD CONSTRAINT "FK_7a5a5a5a5a5a5a5a5a5a5a5a5a" FOREIGN KEY ("matchId") REFERENCES "sprocket"."match"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);

        // Add indexes for performance
        await queryRunner.query(`CREATE INDEX "IDX_3b3b3b3b3b3b3b3b3b3b3b3b3" ON "sprocket"."scrim_queue" ("playerId")`);
        await queryRunner.query(`CREATE INDEX "IDX_4d4d4d4d4d4d4d4d4d4d4d4d4" ON "sprocket"."scrim_queue" ("gameId")`);
        await queryRunner.query(`CREATE INDEX "IDX_5e5e5e5e5e5e5e5e5e5e5e5e5" ON "sprocket"."scrim_queue" ("status")`);
        await queryRunner.query(`CREATE INDEX "IDX_6f6f6f6f6f6f6f6f6f6f6f6f6" ON "sprocket"."scrim_queue" ("queuedAt")`);

        // Add history tracking
        await queryRunner.query(`SELECT create_history_table('scrim_queue', true)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Remove history tracking
        await queryRunner.query(`SELECT remove_history_table('scrim_queue')`);

        // Drop indexes
        await queryRunner.query(`DROP INDEX "sprocket"."IDX_3b3b3b3b3b3b3b3b3b3b3b3b3"`);
        await queryRunner.query(`DROP INDEX "sprocket"."IDX_4d4d4d4d4d4d4d4d4d4d4d4d4"`);
        await queryRunner.query(`DROP INDEX "sprocket"."IDX_5e5e5e5e5e5e5e5e5e5e5e5e5"`);
        await queryRunner.query(`DROP INDEX "sprocket"."IDX_6f6f6f6f6f6f6f6f6f6f6f6f6"`);

        // Drop foreign key constraints
        await queryRunner.query(`ALTER TABLE "sprocket"."scrim_queue" DROP CONSTRAINT "FK_8f3b9b9b9b9b9b9b9b9b9b9b9b"`);
        await queryRunner.query(`ALTER TABLE "sprocket"."scrim_queue" DROP CONSTRAINT "FK_9c4c4c4c4c4c4c4c4c4c4c4c4c"`);
        await queryRunner.query(`ALTER TABLE "sprocket"."scrim_queue" DROP CONSTRAINT "FK_7a5a5a5a5a5a5a5a5a5a5a5a5a"`);

        // Drop table
        await queryRunner.query(`DROP TABLE "sprocket"."scrim_queue"`);

        // Drop enum type
        await queryRunner.query(`DROP TYPE "sprocket"."scrim_queue_status_enum"`);
    }

}
