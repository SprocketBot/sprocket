import {Injectable, OnModuleDestroy} from "@nestjs/common";
import {config} from "../util";
import {Pool, PoolClient, QueryResult, QueryResultRow} from "pg";

@Injectable()
export class PostgresService implements OnModuleDestroy {
    private _pool?: Pool;

    private get pool(): Pool {
        if (!this._pool) {
            this._pool = new Pool({
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
        return this._pool;
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
        await this._pool?.end();
    }
}
