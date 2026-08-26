import * as pulumi from "@pulumi/pulumi";
import * as docker from "@pulumi/docker";

import {RabbitMq} from "global/services/rabbitmq/RabbitMq";
import {buildHost} from "global/helpers/buildHost";
import {HOSTNAME} from "global/constants";

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
    readonly rabbitmq: RabbitMq;
    readonly redis: RedisConnection;

    constructor(name: string, args: PlatformDatastoresArgs, opts?: pulumi.ComponentResourceOptions ) {
        super("SprocketBot:Platform:Datastores", name, {}, opts)

        this.rabbitmq = new RabbitMq(`${name}-rmq`, {
            configFilepath: `${args.configRoot}/rabbitmq.conf`,
            ingressNetworkId: args.ingressNetworkId,
            platformNetworkId: args.platformNetworkId,
            // HOSTNAME already carries the env segment (e.g. dev.sprocket…); do not also pass subdomain or Traefik doubles it.
            url: buildHost("rabbitMq", HOSTNAME)
        }, { parent: this })

        this.redis = {
            hostname: args.redisHostname,
            credentials: {
                password: args.redisPassword
            }
        }
    }

}
