import {ClientProxy} from "@nestjs/microservices";
import type {ReadPacket, WritePacket} from "@nestjs/microservices";
import {randomUUID} from "crypto";

import {closeSharedPostgresPool} from "../postgres";
import {
    PostgresTransportBase,
    PostgresTransportOptions,
    RpcQueueRow,
    toJsonbParam,
} from "./postgres-transport";

export class PostgresClientProxy extends ClientProxy {
    private readonly transport: PostgresTransportBase;

    private connected = false;

    constructor(options: PostgresTransportOptions) {
        super();
        this.transport = new (class extends PostgresTransportBase {
            constructor() {
                super(PostgresClientProxy.name, options);
            }
        })();
    }

    async connect(): Promise<void> {
        if (this.connected) return;
        await this.transport.ensureSchema();
        this.connected = true;
    }

    async close(): Promise<void> {
        await closeSharedPostgresPool();
        this.connected = false;
    }

    protected publish(packet: ReadPacket, callback: (packet: WritePacket) => void): () => void {
        const id = randomUUID();
        let stopped = false;

        this.insertRequest(id, packet)
            .then(() => this.waitForResponse(id, callback, () => stopped))
            .catch(err => callback({err, isDisposed: true}));

        return () => {
            stopped = true;
        };
    }

    protected async dispatchEvent<T = unknown>(packet: ReadPacket): Promise<T> {
        const id = randomUUID();
        await this.insertRequest(id, packet);
        return undefined as unknown as T;
    }

    private async insertRequest(id: string, packet: ReadPacket): Promise<void> {
        await this.connect();
        const pattern = this.normalizePattern(packet.pattern);
        await this.transport.pool.query(
            `
                INSERT INTO sprocket.platform_rpc_queue (id, queue, pattern, payload)
                VALUES ($1, $2, $3, $4)
            `,
            [id, this.transport.queue, pattern, toJsonbParam(packet.data)],
        );
    }

    private async waitForResponse(
        id: string,
        callback: (packet: WritePacket) => void,
        stopped: () => boolean,
    ): Promise<void> {
        while (!stopped()) {
            const result = await this.transport.pool.query<RpcQueueRow>(
                "SELECT status, response, error FROM sprocket.platform_rpc_queue WHERE id = $1",
                [id],
            );
            const row = result.rows[0];
            if (!row) {
                callback({err: new Error(`Postgres RPC request ${id} disappeared`), isDisposed: true});
                return;
            }
            if (row.status === "completed") {
                console.log(`[PostgresClient] Received response for ${id}:`, JSON.stringify(row.response).substring(0, 200));
                callback({response: row.response, isDisposed: true});
                await this.transport.pool.query(
                    "DELETE FROM sprocket.platform_rpc_queue WHERE id = $1",
                    [id],
                );
                return;
            }
            if (row.status === "failed") {
                callback({
                    err: this.deserializeError(row.error),
                    isDisposed: true,
                });
                await this.transport.pool.query(
                    "DELETE FROM sprocket.platform_rpc_queue WHERE id = $1",
                    [id],
                );
                return;
            }
            await new Promise(resolve => setTimeout(resolve, this.transport.pollIntervalMs));
        }
    }

    private deserializeError(error: unknown): Error {
        if (error instanceof Error) return error;
        if (typeof error === "object" && error && "message" in error) {
            return new Error(String((error as {message: unknown;}).message));
        }
        return new Error(String(error));
    }
}
