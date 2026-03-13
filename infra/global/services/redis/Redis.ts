import * as pulumi from "@pulumi/pulumi";
import * as docker from "@pulumi/docker";

import DefaultLogDriver from "../../helpers/docker/DefaultLogDriver"
import { ConfigFile } from "../../helpers/docker/ConfigFile"
import { ServiceCredentials } from "../../helpers/ServiceCredentials"
import { TraefikLabels } from "../../helpers/docker/TraefikLabels"


export interface RedisArgs {
    configFilepath: string

    platformNetworkId?: docker.Network["id"]
    ingressNetworkId?: docker.Network["id"]

    url?: string;
}

export class Redis extends pulumi.ComponentResource {

    readonly hostname: docker.Service["name"]
    readonly credentials: ServiceCredentials
    readonly url?: string | pulumi.Output<string>
    private readonly config: ConfigFile
    private readonly volume: docker.Volume
    private readonly service: docker.Service

    constructor(name: string, args: RedisArgs, opts?: pulumi.ComponentResourceOptions) {
        super("SprocketBot:Services:Redis", name, {}, opts)
        this.url = args.url
        this.credentials = new ServiceCredentials(`${name}-root-credentials`, {
            username: "",
        }, { parent: this })


        this.config = new ConfigFile(`${name}-config`, {
            filepath: args.configFilepath
        }, { parent: this })

        this.volume = new docker.Volume(`${name}-volume`, {}, { parent: this, retainOnDelete: true })

        const networks: {name: docker.Network["id"]}[] = []
        if (args.platformNetworkId) networks.push({ name: args.platformNetworkId })
        if (args.ingressNetworkId) networks.push({ name: args.ingressNetworkId })

        this.service = new docker.Service(`${name}-redis-primary`, {
            taskSpec: {
                containerSpec: {
                    image: "redislabs/rejson:2.0.7",
                    mounts: [{
                        type: "volume",
                        target: "/data",
                        source: this.volume.id
                    }],
                    args: [
                        "--requirepass",
                        this.credentials.password,
                        "--loadmodule",
                        "/usr/lib/redis/modules/rejson.so",
                        "--loadmodule",
                        "/usr/lib/redis/modules/redisearch.so"
                    ],
                    configs: [{
                        configId: this.config.id,
                        configName: this.config.name,
                        fileName: "/usr/local/etc/redis/redis.conf"
                    }]
                },
                logDriver: DefaultLogDriver(name, true),
                networksAdvanceds: networks
            },
            labels: args.url ? new TraefikLabels(`${name}`, "tcp")
                .rule(`HostSNI(\`${args.url}\`)`)
                .entryPoints("redis")
                .tls("lets-encrypt-tls")
                .targetPort(6379)
                .complete : []

        }, { parent: this })

        this.hostname = this.service.name
    }
}
