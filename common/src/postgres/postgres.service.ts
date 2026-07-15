import {Injectable, OnModuleDestroy} from "@nestjs/common";
import type {Pool, PoolClient, QueryResult, QueryResultRow} from "pg";

import {closeSharedPostgresPool, getSharedPostgresPool} from "./pool";

@Injectable()
export class PostgresService implements OnModuleDestroy {
    private get pool(): Pool {
        return getSharedPostgresPool();
    }

    query<T extends QueryResultRow = QueryResultRow>(
        text: string,
        values: unknown[] = [],
    ): Promise<QueryResult<T>> {
        return this.pool.query<T>(text, values);
    }

    async transaction<T>(cb: (client: PoolClient) => Promise<T>): Promise<T> {
        const client = await this.pool.connect();
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

    async onModuleDestroy(): Promise<void> {
        await closeSharedPostgresPool();
    }
}
