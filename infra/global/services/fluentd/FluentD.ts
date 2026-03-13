import * as pulumi from "@pulumi/pulumi"
import * as docker from "@pulumi/docker"

import {ConfigFile} from "../../helpers/docker/ConfigFile"

export interface FluentdArgs {
    configFilePath: string,
    monitoringNetworkId: docker.Network["id"]
}

export class Fluentd extends pulumi.ComponentResource {
    private readonly startupScript: ConfigFile
    private readonly config: ConfigFile

    private readonly service: docker.Service


    constructor(name: string, args: FluentdArgs, opts?: pulumi.ComponentResourceOptions) {
        super("SprocketBot:Services:Grafana", name, {}, opts)
        this.startupScript = new ConfigFile(`${name}-startup-script`, {
            filepath: `${__dirname}/startup-script.sh`
        }, { parent: this })
        this.config = new ConfigFile(`${name}-config`, {
            filepath: args.configFilePath
        }, { parent: this })


        this.service = new docker.Service(`${name}-service`, {
            mode: {
                global: true
            },
            updateConfig: {
                parallelism: 0
            },
            endpointSpec: {
                ports: [{
                    publishedPort: 24224,
                    targetPort: 24224,
                    publishMode: "host",
                    protocol: "tcp"
                }]
            },
            taskSpec: {
                resources: {
                    limits: {
                        // ~256mb
                        memoryBytes: 256 * 1024 * 1024,
                        // ~1/4 of a core
                        nanoCpus: 0.25 * 1e9
                    }
                },
                containerSpec: {
                    image: "fluentd:latest",
                    commands: ["sh", "/startup.sh"],
                    user: "root",
                    env: {
                        FLUENTD_HOSTNAME: "{{.Node.Hostname}}"
                    },
                    configs: [{
                        configName: this.startupScript.name,
                        configId: this.startupScript.id,
                        fileName: "/startup.sh",
                    }, {
                        configName: this.config.name,
                        configId: this.config.id,
                        fileName: "/etc/fluent/fluent.conf"
                    }]
                },
                networksAdvanceds: [{
                    name: args.monitoringNetworkId
                }]
            }
        }, { parent: this })

    }
}