import * as pulumi from "@pulumi/pulumi";
import * as docker from "@pulumi/docker";

export interface RedisConnection {
    hostname: pulumi.Output<string>
    credentials: {
        password: pulumi.Output<string>
    }
}

interface PlatformDatastoresArgs {
    ingressNetworkId: docker.Network["id"],
    platformNetworkId: docker.Network["id"]
    redisHostname: pulumi.Output<string>
    redisPassword: pulumi.Output<string>

    configRoot: string
}

export class PlatformDatastore extends pulumi.ComponentResource {
    readonly redis: RedisConnection;

    constructor(name: string, args: PlatformDatastoresArgs, opts?: pulumi.ComponentResourceOptions ) {
        super("SprocketBot:Platform:Datastores", name, {}, opts)

        this.redis = {
            hostname: args.redisHostname,
            credentials: {
                password: args.redisPassword
            }
        }
    }

}
