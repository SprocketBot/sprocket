import * as pulumi from "@pulumi/pulumi"
import * as postgres from "@pulumi/postgresql";

export interface SprocketPostgresProviderArgs extends Omit<postgres.ProviderArgs, "username" | "password" | "host" | "sslmode" | "port"> {
}

const config = new pulumi.Config();

export class SprocketPostgresProvider extends postgres.Provider {
    readonly hostname: string;
    readonly networkId: string;
    readonly url: string;
    readonly port: number;

    constructor({ ...args }: SprocketPostgresProviderArgs, opts?: pulumi.ResourceOptions) {
        
        const username = config.require('postgres-username');
        const password = config.require('postgres-password');
        const host = config.require('postgres-host');
        const port = config.requireNumber('postgres-port');

        super("SprocketPostgresProvider", {
            ...args,
            username: username,
            password: password,
            host: host,
            sslmode: 'require',
            port: port,
            database: 'sprocket_main',
            superuser: false
        }, opts);

        this.hostname = host;
        this.url = host;
        this.port = port;
        this.networkId = '12345';
    }
}
