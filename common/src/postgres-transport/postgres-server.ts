import type {CustomTransportStrategy, ReadPacket, WritePacket} from "@nestjs/microservices";
import {Server} from "@nestjs/microservices/server/server";
import {BaseRpcContext} from "@nestjs/microservices/ctx-host/base-rpc.context";

import {
    PostgresTransportBase,
    PostgresTransportOptions,
    RpcQueueRow,
    withTransaction,
} from "./postgres-transport";

export class PostgresServer extends Server implements CustomTransportStrategy {
    private readonly transport: PostgresTransportBase;

    private stopped = false;

    // Configurable via env vars (defaults: 5 min timeout, 1 min cleanup interval)
    private readonly staleMessageTimeoutMs = parseInt(process.env.RPC_STALE_MESSAGE_TIMEOUT_MS || "300000", 10);
    private readonly staleMessageCleanupIntervalMs = parseInt(process.env.RPC_CLEANUP_INTERVAL_MS || "60000", 10);

    constructor(options: PostgresTransportOptions) {
        super();
        this.transport = new (class extends PostgresTransportBase {
            constructor() {
                super(PostgresServer.name, options);
            }
        })();
    }

    async listen(callback: (...optionalParams: unknown[]) => void): Promise<void> {
        try {
            await this.transport.ensureSchema();
            callback();
            this.poll().catch(error => this.logger.error(error));
            // Start stale message cleanup background job
            this.cleanupStaleMessages().catch(error => this.logger.error(error));
        } catch (error) {
            callback(error);
        }
    }

    async close(): Promise<void> {
        this.stopped = true;
        await this.transport.pool.end();
    }

    private async poll(): Promise<void> {
        while (!this.stopped) {
            const row = await this.reserveNext();
            if (!row) {
                await new Promise(resolve => setTimeout(resolve, this.transport.pollIntervalMs));
                continue;
            }
            await this.handleRow(row);
        }
    }

    /**
     * Background job to clean up stale processing messages.
     * Resets messages that have been locked for longer than staleMessageTimeoutMs back to pending.
     */
    private async cleanupStaleMessages(): Promise<void> {
        while (!this.stopped) {
            try {
                const result = await this.transport.pool.query(
                    `
                        UPDATE sprocket.platform_rpc_queue
                        SET status = 'pending', locked_at = NULL, updated_at = now()
                        WHERE status = 'processing'
                        AND locked_at < now() - interval '1 second' * $1
                        RETURNING id
                    `,
                    [Math.ceil(this.staleMessageTimeoutMs / 1000)],
                );
                if ((result.rowCount ?? 0) > 0) {
                    this.logger.warn(`Reset ${result.rowCount} stale processing messages to pending`);
                }
            } catch (error) {
                this.logger.error('Error cleaning up stale messages', error);
            }
            await new Promise(resolve => setTimeout(resolve, this.staleMessageCleanupIntervalMs));
        }
    }

    private async reserveNext(): Promise<RpcQueueRow | undefined> {
        return withTransaction(this.transport.pool, async client => {
            const result = await client.query<RpcQueueRow>(
                `
                    SELECT *
                    FROM sprocket.platform_rpc_queue
                    WHERE queue = $1 AND status = 'pending'
                    ORDER BY created_at ASC
                    FOR UPDATE SKIP LOCKED
                    LIMIT 1
                `,
                [this.transport.queue],
            );
            const row = result.rows[0];
            if (!row) return undefined;
            await client.query(
                `
                    UPDATE sprocket.platform_rpc_queue
                    SET status = 'processing', locked_at = now(), updated_at = now()
                    WHERE id = $1
                `,
                [row.id],
            );
            return row;
        });
    }

    private async handleRow(row: RpcQueueRow): Promise<void> {
        const packet: ReadPacket = {
            pattern: row.pattern,
            data: row.payload,
        };
        const handler = this.getHandlerByPattern(row.pattern);
        if (!handler) {
            await this.fail(row.id, new Error(`No message handler for ${row.pattern}`));
            return;
        }

        try {
            const handlerResult = await handler(packet.data, new BaseRpcContext([row]));
            console.log(`[PostgresServer] Handler result for ${row.pattern}:`, JSON.stringify(handlerResult).substring(0, 200));
            const response$ = this.transformToObservable(handlerResult);
            const respond = async (packet: WritePacket): Promise<void> => {
                if (packet.err) {
                    await this.fail(row.id, packet.err);
                    return;
                }
                if (packet.isDisposed) {
                    await this.complete(row.id, packet.response);
                }
            };
            response$ && this.send(response$, respond);
        } catch (error) {
            await this.fail(row.id, error);
        }
    }

    private async complete(id: string, response: unknown): Promise<void> {
        // Debug: log what we're about to store
        console.log(`[PostgresServer] Storing response for ${id}:`, JSON.stringify(response).substring(0, 200));
        await this.transport.pool.query(
            `
                UPDATE sprocket.platform_rpc_queue
                SET status = 'completed', response = $2, updated_at = now()
                WHERE id = $1
            `,
            [id, response ?? null],
        );
    }

    private async fail(id: string, error: unknown): Promise<void> {
        await this.transport.pool.query(
            `
                UPDATE sprocket.platform_rpc_queue
                SET status = 'failed', error = $2, updated_at = now()
                WHERE id = $1
            `,
            [id, this.serializeError(error)],
        );
    }

    private serializeError(error: unknown): Record<string, string> {
        if (error instanceof Error) {
            return {message: error.message, stack: error.stack ?? ""};
        }
        return {message: String(error)};
    }
}
