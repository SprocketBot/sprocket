import * as pulumi from "@pulumi/pulumi";
import { Client } from "pg";

const LEGACY_SHARED_CLUSTER_STACKS = new Set(["layer_1", "layer_2", "prod"]);

type SharedClusterConnection = {
    host: string;
    port: number;
    username: string;
    password: string;
    database: string;
};

type SharedClusterRoleInputs = SharedClusterConnection & {
    roleName: string;
    rolePassword: string;
    replication: boolean;
};

type SharedClusterDatabaseInputs = SharedClusterConnection & {
    databaseName: string;
    ownerRole: string;
};

export function usesLegacySharedClusterNames(stack = pulumi.getStack()): boolean {
    return LEGACY_SHARED_CLUSTER_STACKS.has(stack);
}

export function laneScopedPostgresName(baseName: string, stack = pulumi.getStack()): string {
    if (usesLegacySharedClusterNames(stack)) {
        return baseName;
    }

    return `${baseName}-${normalizeStackName(stack)}`;
}

export function getPostgresManagementDatabaseName(config = new pulumi.Config()): string {
    return config.get("postgres-management-database")?.trim() || "sprocket_main";
}

function normalizeStackName(stack: string): string {
    const normalized = stack
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9_-]+/g, "-")
        .replace(/^-+|-+$/g, "");

    return normalized || "stack";
}

function getSharedClusterConnectionInputs(config = new pulumi.Config()) {
    return {
        host: config.require("postgres-host"),
        port: config.requireNumber("postgres-port"),
        username: config.require("postgres-username"),
        password: config.requireSecret("postgres-password"),
        database: getPostgresManagementDatabaseName(config),
    };
}

function quoteIdentifier(value: string): string {
    return `"${value.replace(/"/g, "\"\"")}"`;
}

function quoteLiteral(value: string): string {
    return `'${value.replace(/'/g, "''")}'`;
}

async function withClient<T>(connection: SharedClusterConnection, callback: (client: Client) => Promise<T>): Promise<T> {
    const client = new Client({
        host: connection.host,
        port: connection.port,
        user: connection.username,
        password: connection.password,
        database: connection.database,
        ssl: {
            rejectUnauthorized: false,
        },
    });

    await client.connect();

    try {
        return await callback(client);
    } finally {
        await client.end();
    }
}

async function ensureRole(inputs: SharedClusterRoleInputs): Promise<void> {
    await withClient(inputs, async (client) => {
        const existingRole = await client.query("select 1 from pg_roles where rolname = $1", [inputs.roleName]);
        const replicationClause = inputs.replication ? "REPLICATION" : "NOREPLICATION";

        if (existingRole.rowCount && existingRole.rowCount > 0) {
            await client.query(
                `ALTER ROLE ${quoteIdentifier(inputs.roleName)} WITH LOGIN ${replicationClause} PASSWORD ${quoteLiteral(inputs.rolePassword)}`,
            );
            return;
        }

        await client.query(
            `CREATE ROLE ${quoteIdentifier(inputs.roleName)} WITH LOGIN ${replicationClause} PASSWORD ${quoteLiteral(inputs.rolePassword)}`,
        );
    });
}

async function ensureDatabase(inputs: SharedClusterDatabaseInputs): Promise<void> {
    await withClient(inputs, async (client) => {
        const existingDatabase = await client.query("select 1 from pg_database where datname = $1", [inputs.databaseName]);

        if (!existingDatabase.rowCount || existingDatabase.rowCount === 0) {
            await client.query(
                `CREATE DATABASE ${quoteIdentifier(inputs.databaseName)}`,
            );
        }

        // Managed Postgres roles cannot reliably take ownership transfers from the admin login,
        // so keep the database owned by the bootstrap user and grant the lane-scoped role access.
        await client.query(
            `GRANT ALL PRIVILEGES ON DATABASE ${quoteIdentifier(inputs.databaseName)} TO ${quoteIdentifier(inputs.ownerRole)}`,
        );
    });
}

class SharedClusterRoleProvider implements pulumi.dynamic.ResourceProvider {
    async create(inputs: SharedClusterRoleInputs) {
        await ensureRole(inputs);

        return {
            id: inputs.roleName,
            outs: {
                ...inputs,
                roleName: inputs.roleName,
            },
        };
    }

    async diff(id: string, olds: SharedClusterRoleInputs, news: SharedClusterRoleInputs) {
        const replaces = olds.roleName !== news.roleName ? ["roleName"] : [];
        const changes = replaces.length > 0
            || olds.rolePassword !== news.rolePassword
            || olds.replication !== news.replication
            || olds.host !== news.host
            || olds.port !== news.port
            || olds.username !== news.username
            || olds.password !== news.password
            || olds.database !== news.database;

        return { changes, replaces };
    }

    async update(id: string, olds: SharedClusterRoleInputs, news: SharedClusterRoleInputs) {
        await ensureRole(news);

        return {
            outs: {
                ...news,
                roleName: news.roleName,
            },
        };
    }

    async delete(id: string, props: SharedClusterRoleInputs) {
        return;
    }
}

class SharedClusterDatabaseProvider implements pulumi.dynamic.ResourceProvider {
    async create(inputs: SharedClusterDatabaseInputs) {
        await ensureDatabase(inputs);

        return {
            id: inputs.databaseName,
            outs: {
                ...inputs,
                databaseName: inputs.databaseName,
            },
        };
    }

    async diff(id: string, olds: SharedClusterDatabaseInputs, news: SharedClusterDatabaseInputs) {
        const replaces = olds.databaseName !== news.databaseName ? ["databaseName"] : [];
        const changes = replaces.length > 0
            || olds.ownerRole !== news.ownerRole
            || olds.host !== news.host
            || olds.port !== news.port
            || olds.username !== news.username
            || olds.password !== news.password
            || olds.database !== news.database;

        return { changes, replaces };
    }

    async update(id: string, olds: SharedClusterDatabaseInputs, news: SharedClusterDatabaseInputs) {
        await ensureDatabase(news);

        return {
            outs: {
                ...news,
                databaseName: news.databaseName,
            },
        };
    }

    async delete(id: string, props: SharedClusterDatabaseInputs) {
        return;
    }
}

export interface EnsureSharedClusterRoleArgs {
    roleName: pulumi.Input<string>;
    rolePassword: pulumi.Input<string>;
    replication?: pulumi.Input<boolean>;
}

export class EnsureSharedClusterRole extends pulumi.dynamic.Resource {
    readonly roleName!: pulumi.Output<string>;

    constructor(name: string, args: EnsureSharedClusterRoleArgs, opts?: pulumi.CustomResourceOptions) {
        const connection = getSharedClusterConnectionInputs();

        super(new SharedClusterRoleProvider(), name, {
            host: connection.host,
            port: connection.port,
            username: connection.username,
            password: connection.password,
            database: connection.database,
            roleName: args.roleName,
            rolePassword: args.rolePassword,
            replication: args.replication ?? false,
        }, {
            ...opts,
            additionalSecretOutputs: ["password", "rolePassword"],
        });
    }
}

export interface EnsureSharedClusterDatabaseArgs {
    databaseName: pulumi.Input<string>;
    ownerRole: pulumi.Input<string>;
}

export class EnsureSharedClusterDatabase extends pulumi.dynamic.Resource {
    readonly databaseName!: pulumi.Output<string>;

    constructor(name: string, args: EnsureSharedClusterDatabaseArgs, opts?: pulumi.CustomResourceOptions) {
        const connection = getSharedClusterConnectionInputs();

        super(new SharedClusterDatabaseProvider(), name, {
            host: connection.host,
            port: connection.port,
            username: connection.username,
            password: connection.password,
            database: connection.database,
            databaseName: args.databaseName,
            ownerRole: args.ownerRole,
        }, {
            ...opts,
            additionalSecretOutputs: ["password"],
        });
    }
}
