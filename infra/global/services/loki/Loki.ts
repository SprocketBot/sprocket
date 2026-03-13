import * as pulumi from "@pulumi/pulumi";
import * as docker from "@pulumi/docker";

import DefaultLogDriver from "../../helpers/docker/DefaultLogDriver"

export interface LokiArgs {
    monitoringNetworkId: docker.Network["id"]
}

export class Loki extends pulumi.ComponentResource {
    private readonly service: docker.Service
    private readonly volume: docker.Volume

    constructor(name: string, args: LokiArgs, opts?: pulumi.ComponentResourceOptions) {
        super("SprocketBot:Services:Loki", name, {}, opts);

        this.volume = new docker.Volume(`${name}-volume`, {
            driver: "local",
            driverOpts: {
                "type": "none",
                "o": "bind",
                "device": "/mnt/sprocketbot_influx_data/loki"
            }
        }, { parent: this })

        this.service = new docker.Service(`${name}-service`, {
            name: name,
            taskSpec: {
                containerSpec: {
                    image: "grafana/loki:main-1a7b170",
                    user: "0",
                    mounts: [{
                        type: "volume",
                        source: this.volume.id,
                        target: "/loki"
                    }]
                },
                logDriver: DefaultLogDriver("loki", true),
                placement: {
                    constraints: [
                        "node.labels.role==storage",
                    ]
                },
                networksAdvanceds: [
                    { name: args.monitoringNetworkId }
                ]
            }
        }, { parent: this })
    }
}
