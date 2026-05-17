import {Injectable, Logger} from "@nestjs/common";
import {Observable} from "rxjs";

import {PostgresService} from "../postgres";

interface PostgresEventMessage {
    fields: {
        routingKey: string;
    };
    content: Buffer;
}

interface EventRow {
    id: string;
    topic: string;
    payload: unknown;
}

@Injectable()
export class RmqService {
    private readonly logger = new Logger(RmqService.name);

    constructor(private readonly postgres: PostgresService) {}

    async onApplicationBootstrap(): Promise<void> {
        await this.ensureSchema();
    }

    /**
   * Non-Typesafe Publish function backed by Postgres rows.
   * @param topic {string} Topic to put to (i.e. scrim.complete)
   * @param data {Buffer} Buffer of some JSON artifact (object, array, int, etc)
   * @returns {boolean} Success of message publication
   */
    async pub(topic: string, data: Buffer): Promise<boolean> {
        await this.ensureSchema();
        await this.postgres.query(
            "INSERT INTO sprocket.platform_event (topic, payload) VALUES ($1, $2)",
            [topic, JSON.parse(data.toString())],
        );
        return true;
    }

    /**
   * Non-Typesafe Subscription function backed by polling Postgres event rows.
   * @param topic {string} Topic to sub to (i.e. scrim.complete)
   * @param instanceExclusive {boolean} Identifies if the subscription should be created at an application or instance level
   * @returns {Observable<PostgresEventMessage>} An observable that will complete when the subscription is destroyed
   */
    async sub(topic: string, instanceExclusive: boolean): Promise<Observable<PostgresEventMessage>> {
        await this.ensureSchema();
        const startResult = await this.postgres.query<{id: string}>(
            "SELECT COALESCE(MAX(id), 0)::text AS id FROM sprocket.platform_event",
        );
        let lastSeenId = BigInt(startResult.rows[0]?.id ?? "0");
        this.logger.debug(`Creating Postgres events subscription topic=${topic} exclusive=${instanceExclusive}`);

        return new Observable<PostgresEventMessage>(subscriber => {
            const timer = setInterval(() => {
                this.poll(topic, lastSeenId)
                    .then(rows => {
                        for (const row of rows) {
                            lastSeenId = BigInt(row.id);
                            subscriber.next({
                                fields: {routingKey: row.topic},
                                content: Buffer.from(JSON.stringify(row.payload)),
                            });
                        }
                    })
                    .catch(subscriber.error.bind(subscriber));
            }, 250);
            timer.unref?.();

            return (): void => clearInterval(timer);
        });
    }

    private async poll(topic: string, afterId: bigint): Promise<EventRow[]> {
        const result = await this.postgres.query<EventRow>(
            `
                SELECT id::text, topic, payload
                FROM sprocket.platform_event
                WHERE id > $1 AND topic LIKE $2
                ORDER BY id ASC
            `,
            [afterId.toString(), topic.replace(/\*/g, "%")],
        );
        return result.rows;
    }

    private async ensureSchema(): Promise<void> {
        await this.postgres.query("CREATE SCHEMA IF NOT EXISTS sprocket");
        await this.postgres.query(`
            CREATE TABLE IF NOT EXISTS sprocket.platform_event (
                id BIGSERIAL NOT NULL,
                topic text NOT NULL,
                payload jsonb NOT NULL,
                created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
                CONSTRAINT "PK_platform_event" PRIMARY KEY (id)
            )
        `);
        await this.postgres.query(`
            CREATE INDEX IF NOT EXISTS "IDX_platform_event_topic"
            ON sprocket.platform_event (topic, id)
        `);
        // Index for event cleanup queries
        await this.postgres.query(`
            CREATE INDEX IF NOT EXISTS "IDX_platform_event_created_at"
            ON sprocket.platform_event (created_at)
        `);
    }

    /**
     * Clean up old events older than the specified number of days.
     * Should be called periodically (e.g., daily) to prevent unbounded table growth.
     * @param daysToKeep Number of days to keep events (default: 7)
     * @returns Number of deleted events
     */
    async cleanupOldEvents(daysToKeep: number = 7): Promise<number> {
        const result = await this.postgres.query(
            `
                DELETE FROM sprocket.platform_event
                WHERE created_at < now() - interval '1 day' * $1
                RETURNING id
            `,
            [daysToKeep],
        );
        if ((result.rowCount ?? 0) > 0) {
            this.logger.log(`Cleaned up ${result.rowCount} old events older than ${daysToKeep} days`);
        }
        return result.rowCount ?? 0;
    }
}
