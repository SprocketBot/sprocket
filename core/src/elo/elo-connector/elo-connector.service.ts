import {Injectable, Logger} from "@nestjs/common";
import {PostgresService} from "@sprocketbot/common";
import {v4 as uuidv4} from "uuid";

import type {
    EloEndpoint, EloInput, EloJobId, EloOutput,
} from "./elo-connector.types";
import {EloSchemas} from "./elo-connector.types";

@Injectable()
export class EloConnectorService {
    private readonly logger = new Logger(EloConnectorService.name);

    constructor(private readonly postgres: PostgresService) {}

    async createJob<E extends EloEndpoint>(endpoint: E, data: EloInput<E>): Promise<EloJobId> {
        await this.ensureSchema();
        const id = uuidv4();
        await this.postgres.query(
            `
                INSERT INTO sprocket.elo_job_queue (id, endpoint, payload)
                VALUES ($1, $2, $3)
            `,
            [id, endpoint, data],
        );
        return id;
    }

    async createJobAndWait<E extends EloEndpoint>(
        endpoint: E,
        data: EloInput<E>,
    ): Promise<EloOutput<E>> {
        const jobId = await this.createJob(endpoint, data);
        return this.waitForJob(endpoint, jobId);
    }

    private async waitForJob<E extends EloEndpoint>(endpoint: E, jobId: EloJobId): Promise<EloOutput<E>> {
        while (true) {
            const result = await this.postgres.query<{
                status: string;
                result: unknown;
                error: {message?: string;} | null;
            }>(
                "SELECT status, result, error FROM sprocket.elo_job_queue WHERE id = $1",
                [jobId],
            );
            const row = result.rows[0];
            if (!row) throw new Error(`Elo job ${jobId} not found`);
            if (row.status === "completed") {
                return EloSchemas[endpoint].output.parse(row.result) as EloOutput<E>;
            }
            if (row.status === "failed") {
                throw new Error(row.error?.message ?? `Elo job ${jobId} failed`);
            }
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
    }

    private async ensureSchema(): Promise<void> {
        await this.postgres.query("CREATE SCHEMA IF NOT EXISTS sprocket");
        await this.postgres.query(`
            CREATE TABLE IF NOT EXISTS sprocket.elo_job_queue (
                id text NOT NULL,
                endpoint text NOT NULL,
                payload jsonb NOT NULL,
                status text NOT NULL DEFAULT 'pending',
                result jsonb,
                error jsonb,
                created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
                updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
                locked_at TIMESTAMPTZ,
                CONSTRAINT "PK_elo_job_queue" PRIMARY KEY (id)
            )
        `);
        await this.postgres.query(`
            CREATE INDEX IF NOT EXISTS "IDX_elo_job_queue_pending"
            ON sprocket.elo_job_queue (status, created_at)
        `);
    }
}
