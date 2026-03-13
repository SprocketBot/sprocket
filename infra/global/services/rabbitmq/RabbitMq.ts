import * as pulumi from "@pulumi/pulumi";
import * as docker from "@pulumi/docker";

import DefaultLogDriver from "../../helpers/docker/DefaultLogDriver"
import {ConfigFile} from "../../helpers/docker/ConfigFile"
import {TraefikLabels} from "../../helpers/docker/TraefikLabels"


export interface RabbitMqArgs {
    configFilepath: string
    ingressNetworkId: docker.Network["id"],
    platformNetworkId: docker.Network["id"],
    url: string;
}

export class RabbitMq extends pulumi.ComponentResource {
    private readonly config: ConfigFile

    private readonly volume: docker.Volume
    private readonly service: docker.Service

    readonly hostname: docker.Service["name"]

    readonly url: string
    readonly managementUrl: string

    constructor(name: string, args: RabbitMqArgs, opts?: pulumi.ComponentResourceOptions) {
        super("SprocketBot:Services:RabbitMq", name, {}, opts)

        this.url = args.url
        this.managementUrl = `management.${args.url}`

        this.config = new ConfigFile(`${name}-config`, {
            filepath: args.configFilepath
        }, {parent: this})

        this.volume = new docker.Volume(`${name}-data`, {
            driver: "local",
            driverOpts: {
                "type": "none",
                "o": "bind",
                "device": "/mnt/sprocketbot_influx_data/rabbitmq"
            }
        }, {retainOnDelete: true, parent: this})

        this.service = new docker.Service(`${name}-service`, {
            taskSpec: {
                containerSpec: {
                    image: "rabbitmq:3.9.14-management-alpine",
                    hostname: "{{.Node.Hostname}}",
                    healthcheck: {
                        tests: ["CMD", "rabbitmq-diagnostics", "-q", "ping"],
                        interval: "10s",
                        timeout: "5s",
                        retries: 3,
                        startPeriod: "30s"
                    },
                    configs: [{
                        configName: this.config.name,
                        configId: this.config.id,
                        fileName: "/etc/rabbitmq/rabbitmq.conf"
                    }],
                    mounts: [{
                        type: "volume",
                        source: this.volume.name,
                        target: "/var/lib/rabbitmq"
                    }],
                },
                logDriver: DefaultLogDriver("rabbitmq", true),
                networksAdvanceds: [
                    { name: args.platformNetworkId },
                    { name: args.ingressNetworkId }
                ]
            },
            endpointSpec: {
                mode: "dnsrr"
            },
            labels: args.url
                ? [
                    ...new TraefikLabels(`${name}-management`)
                        .rule(`Host(\`management.${args.url}\`)`)
                        .tls("lets-encrypt-tls")
                        .targetPort(15672)
                        .complete,
                    ...new TraefikLabels(`${name}-management`, "tcp")
                        .rule(`HostSNI(\`${args.url}\`)`)
                        .tls("lets-encrypt-tls")
                        .targetPort(5672)
                        .complete
                ] : []
        }, {parent: this})

        this.hostname = this.service.name
    }

}