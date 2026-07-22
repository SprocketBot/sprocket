import type {PoolConfig} from "pg";
import {Pool} from "pg";

import {config} from "../util";

let sharedPool: Pool | undefined;
let sharedPoolEnding: Promise<void> | undefined;

function serviceName(): string {
    return process.env.SPROCKET_SERVICE_NAME
        || process.env.SERVICE_NAME
        || process.env.npm_package_name
        || "sprocket";
}

function applicationName(role: string): string {
    const raw = `${config.db.application_name || serviceName()}.${role}`;
    return raw.replace(/[^a-zA-Z0-9_.:-]/g, "_").slice(0, 63);
}

export function buildPostgresPoolConfig(role: string): PoolConfig {
    return {
        host: config.db.host,
        port: config.db.port,
        user: config.db.username,
        password: config.db.password,
        database: config.db.database,
        ssl: config.db.host === "postgres" || config.db.host === "localhost"
            ? false
            : {rejectUnauthorized: false},
        max: config.db.pool_size,
        idleTimeoutMillis: config.db.pool_idle_timeout_ms,
        connectionTimeoutMillis: config.db.pool_connection_timeout_ms,
        maxLifetimeSeconds: config.db.pool_max_lifetime_seconds,
        idle_in_transaction_session_timeout: config.db.idle_in_transaction_timeout_ms,
        application_name: applicationName(role),
    };
}

export function getSharedPostgresPool(): Pool {
    if (!sharedPool) {
        sharedPool = new Pool(buildPostgresPoolConfig("common"));
    }
    return sharedPool;
}

export async function closeSharedPostgresPool(): Promise<void> {
    if (!sharedPool) {
        if (sharedPoolEnding) await sharedPoolEnding;
        return;
    }

    const pool = sharedPool;
    sharedPool = undefined;
    sharedPoolEnding = pool.end().finally(() => {
        sharedPoolEnding = undefined;
    });
    await sharedPoolEnding;
}
