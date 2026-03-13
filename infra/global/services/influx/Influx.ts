import * as docker from "@pulumi/docker";
import * as pulumi from "@pulumi/pulumi";

import DefaultLogDriver from "../../helpers/docker/DefaultLogDriver"
import { ServiceCredentials } from "../../helpers/ServiceCredentials"
import { TraefikLabels } from "../../helpers/docker/TraefikLabels"
import { HOSTNAME } from "../../constants";


export interface InfluxArgs {
    ingressNetworkId: docker.Network["id"]
    monitoringNetworkId: docker.Network["id"]
    exposeUi?: boolean
}

export class Influx extends pulumi.ComponentResource {
    readonly url: string
    readonly hostname: docker.Service["name"]
    readonly credentials: ServiceCredentials
    readonly network: docker.Network
    readonly networkId: pulumi.Output<string>

    private readonly volume: docker.Volume
    private readonly service: docker.Service

    constructor(name: string, args: InfluxArgs, opts?: pulumi.ComponentResourceOptions) {
        super("SprocketBot:Services:Influx", name, {}, opts)

        this.url = "influx.sprocket.mlesports.gg"
        this.credentials = new ServiceCredentials(`${name}-credentials`, {
            username: "admin"
        }, { parent: this })

        this.volume = new docker.Volume(`${name}-volume`, {
            driver: "local",
            driverOpts: {
                "type": "none",
                "o": "bind",
                "device": "/mnt/sprocketbot_influx_data"
            }
        }, { parent: this })

        this.network = new docker.Network(`${name}-network`, { driver: "overlay" }, { parent: this })
        this.networkId = this.network.id

        const traefikLabels = new TraefikLabels(name, "http")
            .rule(`Host(\`influx.${HOSTNAME}\`)`)
            .tls("lets-encrypt-tls")
            .targetPort(8086)
            .entryPoints("websecure")
            .complete


        this.service = new docker.Service(`${name}-service`, {
            // Pin the name to prevent desync when used in applications
            // i.e. if this is updated and the applications are not, they will point to the wrong url
            name: name,
            taskSpec: {
                containerSpec: {
                    image: "influxdb:2.1-alpine",
                    env: {
                        DOCKER_INFLUXDB_INIT_MODE: "setup",
                        DOCKER_INFLUXDB_INIT_USERNAME: this.credentials.username,
                        DOCKER_INFLUXDB_INIT_PASSWORD: this.credentials.password,
                        DOCKER_INFLUXDB_INIT_RETENTION: "7d",  // Reduced from 30d to 7d
                        DOCKER_INFLUXDB_INIT_ORG: "sprocket",
                        DOCKER_INFLUXDB_INIT_BUCKET: "metrics",
                        DOCKER_INFLUXDB_INIT_ADMIN_TOKEN: this.credentials.password,
                        "LOG_LEVEL": "WARN",
                        "INFLUXDB_LOG_LEVEL": "warn"
                    },
                    mounts: [{
                        type: "volume",
                        source: this.volume.id,
                        target: "/var/lib/influxdb2"
                    }]
                },
                logDriver: DefaultLogDriver(`${name}`, true),
                placement: {
                    constraints: [
                        "node.labels.role==storage",
                    ]
                },
                networksAdvanceds: [
                    { name: args.monitoringNetworkId },
                    { name: args.ingressNetworkId },
                    { name: this.network.id },
                ]
            },
            labels: args.exposeUi ? traefikLabels : []
        }, { parent: this })

        this.hostname = this.service.name

        this.registerOutputs({
            networkId: this.networkId
        })
    }
}