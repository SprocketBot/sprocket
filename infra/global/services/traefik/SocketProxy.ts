import * as docker from "@pulumi/docker";
import * as pulumi from "@pulumi/pulumi";

import DefaultLogDriver from "../../helpers/docker/DefaultLogDriver";

export class SocketProxy extends pulumi.ComponentResource {
    private readonly service: docker.Service
    private readonly network: docker.Network

    readonly networkId: docker.Network["id"]
    readonly serviceName: docker.Service["name"]

    constructor(name: string, opts?: pulumi.ComponentResourceOptions) {
        super("SprocketBot:Utilities:SocketProxy", `${name}-sock-proxy`, {} , opts)

        this.network = new docker.Network(`${name}-proxy-network`, {driver: "overlay"}, {parent: this})

        this.service = new docker.Service(`${name}-proxy-service`, {
            name: `${name}-sock-proxy`,
            taskSpec: {
                containerSpec: {
                    image: "tecnativa/docker-socket-proxy:latest",
                    env: {
                        CONTAINERS: "1",
                        SERVICES: "1",
                        SWARM: "1",
                        NETWORKS: "1",
                        TASKS: "1",
                        NODES: "1",
                        EVENTS: "1",
                        PING: "1",
                        VERSION: "1",
                    },
                    mounts: [{
                        type: "bind",
                        readOnly: true,
                        source: "/var/run/docker.sock",
                        target: "/var/run/docker.sock"
                    }],
                },
                logDriver: DefaultLogDriver("socketProxy", true),
                placement: {
                    platforms: [{
                        architecture: "amd64",
                        os: "linux"
                    }]
                },
                networksAdvanceds: [
                    { name: this.network.id }
                ]
            }
        }, { parent: this })

        this.networkId = this.network.id
        this.serviceName = this.service.name

        this.registerOutputs({
            networkId: this.networkId,
            serviceName: this.service.name
        })
    }
}