import * as pulumi from "@pulumi/pulumi"
import { EnsureSharedClusterDatabase } from "global/helpers/datastore/SharedClusterPostgres";

const config = new pulumi.Config()

export interface PlatformDatabaseArgs {
    postgresHostname: pulumi.Output<string> | string
    environmentSubdomain: string
}

export class PlatformDatabase extends pulumi.ComponentResource {
    readonly database: { name: string }
    readonly host: string | pulumi.Output<string>
    readonly credentials: {
        username: string
        password: pulumi.Output<string>
    }
    private readonly databaseResource: EnsureSharedClusterDatabase

    constructor(name: string, args: PlatformDatabaseArgs, opts?: pulumi.ComponentResourceOptions) {
        super("SprocketBot:Platform:Database", name, {}, opts)

        this.host = args.postgresHostname

        // Reference the existing database for this environment
        this.database = { name: `sprocket_${args.environmentSubdomain}` }

        // Get credentials from Pulumi config
        this.credentials = {
            username: config.require("postgres-username"),
            password: config.requireSecret("postgres-password")
        }

        this.databaseResource = new EnsureSharedClusterDatabase(`${name}-shared-cluster-db`, {
            databaseName: this.database.name,
            ownerRole: this.credentials.username,
        }, { parent: this })
    }
}
