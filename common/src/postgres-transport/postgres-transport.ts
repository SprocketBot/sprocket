import {Logger} from "@nestjs/common";
import {ClientProxy} from "@nestjs/microservices";
import type {ReadPacket, WritePacket} from "@nestjs/microservices";
import {Server} from "@nestjs/microservices/server/server";
import type {Pool, PoolClient, QueryResultRow} from "pg";
import {Pool as PgPool} from "pg";

import {config} from "../util";

export interface PostgresTransportOptions {
    queue: string;
    pollIntervalMs?: number;
}

export interface RpcQueueRow extends QueryResultRow {
    id: string;
    pattern: string;
    payload: unknown;
    response?: unknown;
    error?: unknown;
    status: "pending" | "processing" | "completed" | "failed";
}

export function createTransportPool(): Pool {
    return new PgPool({
        host: config.db.host,
        port: config.db.port,
        user: config.db.username,
        password: config.db.password,
        database: config.db.database,
        ssl: config.db.host === "postgres" || config.db.host === "localhost"
            ? false
            : {rejectUnauthorized: false},
        max: config.db.pool_size,
    });
}

export function toJsonbParam(value: unknown): string | null {
    if (value === null || value === undefined) return null;

    let jsonValue: unknown = value;
    if (typeof value === "string") {
        try {
            jsonValue = JSON.parse(value);
        } catch {
            jsonValue = value;
        }
    }

    return JSON.stringify(JSON.parse(JSON.stringify(jsonValue)));
}

export abstract class PostgresTransportBase {
    protected readonly logger: Logger;

    readonly queue: string;

    readonly pollIntervalMs: number;

    private _pool?: Pool;

    protected constructor(name: string, options: PostgresTransportOptions) {
        this.logger = new Logger(name);
        this.queue = options.queue;
        this.pollIntervalMs = options.pollIntervalMs ?? 250;
    }

    get pool(): Pool {
        if (!this._pool) this._pool = createTransportPool();
        return this._pool;
    }

    async ensureSchema(): Promise<void> {
        await this.pool.query("CREATE SCHEMA IF NOT EXISTS sprocket");
        await this.pool.query(`
            CREATE TABLE IF NOT EXISTS sprocket.platform_rpc_queue (
                id uuid NOT NULL,
                queue text NOT NULL,
                pattern text NOT NULL,
                payload jsonb NOT NULL,
                response jsonb,
                error jsonb,
                status text NOT NULL DEFAULT 'pending',
                created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
                updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
                locked_at TIMESTAMPTZ,
                CONSTRAINT "PK_platform_rpc_queue" PRIMARY KEY (id)
            )
        `);
        await this.pool.query(`
            CREATE INDEX IF NOT EXISTS "IDX_platform_rpc_queue_pending"
            ON sprocket.platform_rpc_queue (queue, status, created_at)
        `);
        // Index for stale message cleanup - find processing messages with expired locks
        await this.pool.query(`
            CREATE INDEX IF NOT EXISTS "IDX_platform_rpc_queue_locked_at"
            ON sprocket.platform_rpc_queue (status, locked_at)
            WHERE status = 'processing'
        `);
        await this.pool.query(`
            CREATE TABLE IF NOT EXISTS sprocket.platform_event (
                id BIGSERIAL NOT NULL,
                topic text NOT NULL,
                payload jsonb NOT NULL,
                created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
                CONSTRAINT "PK_platform_event" PRIMARY KEY (id)
            )
        `);
        await this.pool.query(`
            CREATE INDEX IF NOT EXISTS "IDX_platform_event_topic"
            ON sprocket.platform_event (topic, id)
        `);
    }
}

export type PostgresClientProxyBase = ClientProxy & PostgresTransportBase & {
    publish(packet: ReadPacket, callback: (packet: WritePacket) => void): () => void;
    dispatchEvent<T = unknown>(packet: ReadPacket): Promise<T>;
};

export type PostgresServerBase = Server & PostgresTransportBase;

export async function withTransaction<T>(
    pool: Pool,
    cb: (client: PoolClient) => Promise<T>,
): Promise<T> {
    const client = await pool.connect();
    try {
        await client.query("BEGIN");
        const result = await cb(client);
        await client.query("COMMIT");
        return result;
    } catch (error) {
        await client.query("ROLLBACK");
        throw error;
    } finally {
        client.release();
    }
}
