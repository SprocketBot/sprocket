import * as pulumi from "@pulumi/pulumi"

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
    }
}
