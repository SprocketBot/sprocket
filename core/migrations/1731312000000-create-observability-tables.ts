import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateObservabilityTables1731312000000 implements MigrationInterface {
    name = 'CreateObservabilityTables1731312000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create logs table
        await queryRunner.query(`
            CREATE TABLE "sprocket"."logs" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updateAt" TIMESTAMP NOT NULL DEFAULT now(),
                "timestamp" TIMESTAMP NOT NULL DEFAULT now(),
                "level" character varying NOT NULL,
                "message" text NOT NULL,
                "context" character varying,
                "service" character varying NOT NULL,
                "method" character varying,
                "path" character varying,
                "statusCode" integer,
                "duration" integer,
                "error" text,
                "trace" text,
                "userId" uuid,
                "requestId" character varying,
                "traceId" character varying,
                "spanId" character varying,
                "tags" jsonb,
                CONSTRAINT "PK_logs_id" PRIMARY KEY ("id")
            )
        `);

        // Create metrics table
        await queryRunner.query(`
            CREATE TABLE "sprocket"."metrics" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updateAt" TIMESTAMP NOT NULL DEFAULT now(),
                "timestamp" TIMESTAMP NOT NULL DEFAULT now(),
                "name" character varying NOT NULL,
                "value" numeric NOT NULL,
                "type" character varying NOT NULL,
                "unit" character varying,
                "service" character varying NOT NULL,
                "method" character varying,
                "path" character varying,
                "labels" jsonb,
                "userId" uuid,
                "requestId" character varying,
                "traceId" character varying,
                "spanId" character varying,
                CONSTRAINT "PK_metrics_id" PRIMARY KEY ("id")
            )
        `);

        // Create indexes for logs table
        await queryRunner.query(`CREATE INDEX "IDX_logs_timestamp" ON "sprocket"."logs" ("timestamp")`);
        await queryRunner.query(`CREATE INDEX "IDX_logs_level" ON "sprocket"."logs" ("level")`);
        await queryRunner.query(`CREATE INDEX "IDX_logs_service" ON "sprocket"."logs" ("service")`);
        await queryRunner.query(`CREATE INDEX "IDX_logs_userId" ON "sprocket"."logs" ("userId")`);
        await queryRunner.query(`CREATE INDEX "IDX_logs_traceId" ON "sprocket"."logs" ("traceId")`);
        await queryRunner.query(`CREATE INDEX "IDX_logs_requestId" ON "sprocket"."logs" ("requestId")`);

        // Create indexes for metrics table
        await queryRunner.query(`CREATE INDEX "IDX_metrics_timestamp" ON "sprocket"."metrics" ("timestamp")`);
        await queryRunner.query(`CREATE INDEX "IDX_metrics_name" ON "sprocket"."metrics" ("name")`);
        await queryRunner.query(`CREATE INDEX "IDX_metrics_service" ON "sprocket"."metrics" ("service")`);
        await queryRunner.query(`CREATE INDEX "IDX_metrics_userId" ON "sprocket"."metrics" ("userId")`);
        await queryRunner.query(`CREATE INDEX "IDX_metrics_traceId" ON "sprocket"."metrics" ("traceId")`);

        // Add foreign key constraints
        await queryRunner.query(`ALTER TABLE "sprocket"."logs" ADD CONSTRAINT "FK_logs_userId" FOREIGN KEY ("userId") REFERENCES "sprocket"."user"("id") ON DELETE SET NULL ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "sprocket"."metrics" ADD CONSTRAINT "FK_metrics_userId" FOREIGN KEY ("userId") REFERENCES "sprocket"."user"("id") ON DELETE SET NULL ON UPDATE CASCADE`);

        // Create hypertables for time-series optimization (if TimescaleDB is available)
        try {
            await queryRunner.query(`SELECT create_hypertable('sprocket.logs', 'timestamp', if_not_exists => true)`);
            await queryRunner.query(`SELECT create_hypertable('sprocket.metrics', 'timestamp', if_not_exists => true)`);
        } catch (error) {
            // TimescaleDB extension not available, continue without hypertables
            console.log('TimescaleDB not available, creating regular tables');
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop foreign key constraints
        await queryRunner.query(`ALTER TABLE "sprocket"."metrics" DROP CONSTRAINT "FK_metrics_userId"`);
        await queryRunner.query(`ALTER TABLE "sprocket"."logs" DROP CONSTRAINT "FK_logs_userId"`);

        // Drop indexes for metrics table
        await queryRunner.query(`DROP INDEX "sprocket"."IDX_metrics_traceId"`);
        await queryRunner.query(`DROP INDEX "sprocket"."IDX_metrics_userId"`);
        await queryRunner.query(`DROP INDEX "sprocket"."IDX_metrics_service"`);
        await queryRunner.query(`DROP INDEX "sprocket"."IDX_metrics_name"`);
        await queryRunner.query(`DROP INDEX "sprocket"."IDX_metrics_timestamp"`);

        // Drop indexes for logs table
        await queryRunner.query(`DROP INDEX "sprocket"."IDX_logs_requestId"`);
        await queryRunner.query(`DROP INDEX "sprocket"."IDX_logs_traceId"`);
        await queryRunner.query(`DROP INDEX "sprocket"."IDX_logs_userId"`);
        await queryRunner.query(`DROP INDEX "sprocket"."IDX_logs_service"`);
        await queryRunner.query(`DROP INDEX "sprocket"."IDX_logs_level"`);
        await queryRunner.query(`DROP INDEX "sprocket"."IDX_logs_timestamp"`);

        // Drop tables
        await queryRunner.query(`DROP TABLE "sprocket"."metrics"`);
        await queryRunner.query(`DROP TABLE "sprocket"."logs"`);
    }

}