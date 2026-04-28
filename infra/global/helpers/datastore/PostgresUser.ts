import * as pulumi from "@pulumi/pulumi";
import * as postgres from "@pulumi/postgresql";
import {ServiceCredentials} from "../ServiceCredentials";
import { EnsureSharedClusterRole, laneScopedPostgresName, usesLegacySharedClusterNames } from "./SharedClusterPostgres";


export interface PostgresUserArgs {
    username: string;
    providers: {
        postgres: postgres.Provider;
    };
    replication?: boolean;
    importId?: string;
}

export class PostgresUser extends pulumi.ComponentResource {
    readonly username: pulumi.Output<string>;
    readonly password: pulumi.Output<string>;

    private readonly credentials: ServiceCredentials;
    private readonly role: EnsureSharedClusterRole | postgres.Role;

    constructor(name: string, args: PostgresUserArgs, opts?: pulumi.ComponentResourceOptions) {
        super("sprocket:PostgresUser", name, {}, opts)

        const scopedUsername = laneScopedPostgresName(args.username);

        this.credentials = new ServiceCredentials(`${name}-pw`, {
            username: scopedUsername,
        }, {parent: this});

        this.username = this.credentials.username;
        this.password = this.credentials.password;

        if (usesLegacySharedClusterNames()) {
            this.role = new postgres.Role(`${name}-role`, {
                name: this.credentials.username,
                login: true,
                password: this.credentials.password,
                replication: args.replication ?? false,
            }, {provider: args.providers.postgres, parent: this, import: args.importId});
            return;
        }

        this.role = new EnsureSharedClusterRole(`${name}-role`, {
            roleName: this.credentials.username,
            rolePassword: this.credentials.password,
            replication: args.replication ?? false,
        }, { parent: this });
    }
}
