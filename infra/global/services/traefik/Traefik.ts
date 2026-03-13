import * as docker from "@pulumi/docker";
import * as pulumi from "@pulumi/pulumi";
import * as yaml from "yaml";
import DefaultLogDriver from "../../helpers/docker/DefaultLogDriver";

import { HOSTNAME } from "../../constants";
import { ConfigFile } from "../../helpers/docker/ConfigFile";
import { TraefikLabels } from "../../helpers/docker/TraefikLabels";
import { SocketProxy } from "./SocketProxy";
import { DiscordForwardAuth } from "./DiscordForwardAuth";


export interface TraefikArgs {
    staticConfigurationPath: string
    faConfigurationPath: string
}

export class Traefik extends pulumi.ComponentResource {
    private readonly staticConfig: ConfigFile

    private readonly network: docker.Network;
    private readonly volume: docker.Volume;

    private readonly service: docker.Service;
    private readonly socketProxy: SocketProxy;

    readonly forwardAuth: DiscordForwardAuth

    readonly networkId: docker.Network["id"]

    constructor(name: string, args: TraefikArgs, opts?: pulumi.ComponentResourceOptions) {
        super("SprocketBot:Services:Traefik", name, {}, opts)

        // Ensure we declare the socket proxy first so it can be subtituted in properly
        this.socketProxy = new SocketProxy("traefik-socket", { parent: this })

        this.staticConfig = new ConfigFile(`${name}-config`, {
            transformation: this.updateDockerSocketPath.bind(this),
            filepath: args.staticConfigurationPath
        }, { parent: this })

        this.network = new docker.Network(`${name}-network`, {
            driver: "overlay",
            name: `${name}-ingress`
        }, { parent: this });

        this.networkId = this.network.id

        this.volume = new docker.Volume(`${name}-data`, {}, { parent: this })

        this.service = new docker.Service(name, {
            // Build out the rules for the traefik dashboard
            // TODO: Add forward authentication here
            labels: new TraefikLabels(`${name}-dashboard`)
                .rule(`Host(\`traefik.${HOSTNAME}\`)`)
                .service("api@internal")
                .entryPoints("websecure")
                .tls("lets-encrypt-tls")
                .targetPort(9999)
                .forwardAuthRule("SprocketAdmin")
                .complete,
            taskSpec: {
                containerSpec: {
                    // Pin the version to prevent unwanted updates
                    image: "traefik:v2.11",
                    // Ensure our config file is loaded
                    args: ["--configFile=/static.yaml"],

                    // Mount to persist things like certs
                    mounts: [{
                        type: "volume",
                        source: this.volume.id,
                        target: "/data"
                    }],
                    // Mount our config
                    configs: [{
                        configId: this.staticConfig.id,
                        configName: this.staticConfig.name,
                        fileName: "/static.yaml"
                    }]
                },
                logDriver: DefaultLogDriver("traefik", true),
                // Ensure that we are placed on a node that is marked as ingress
                // Putting traefik on an internal only node doesn't help us much
                // Alternatively, using an NFS system this could be changed to a
                // ../.. service, which would mitigate this and ensure we don't
                // overprovision certificates
                // placement: {
                //     constraints: [
                //         "node.labels.role==ingress"
                //     ]
                // },
                // Ensure we are on the ingress network, along with the socket proxy network
                networksAdvanceds: [
                    { name: this.network.id },
                    { name: this.socketProxy.networkId }
                ]
            },
            // Expose ports, because pulumi has decided this is how it works now.
            endpointSpec: {
                ports: [{
                    targetPort: 80,
                    publishedPort: 80,
                    publishMode: "host",
                    protocol: "tcp"
                }, {
                    targetPort: 443,
                    publishedPort: 443,
                    publishMode: "host",
                    protocol: "tcp"
                }, {
                    targetPort: 6379,
                    publishedPort: 6379,
                    publishMode: "host",
                    protocol: "tcp"
                }]
            }
        }, {
            parent: this
        })

        this.forwardAuth = new DiscordForwardAuth(`${name}-fa`, {
            networkId: this.networkId,
            configFilePath: args.faConfigurationPath
        }, { parent: this })

        this.registerOutputs({
            networkId: this.networkId
        })
    }

    private updateDockerSocketPath(data: string) {
        const doc = yaml.parse(data)

        // If HOSTNAME is localhost, remove the redirections for web entryPoint
        if (HOSTNAME === "localhost") {
            if (doc.entryPoints?.web?.http?.redirections) {
                delete doc.entryPoints.web.http.redirections;
            }
            // Check if http section is now empty
            if (doc.entryPoints?.web?.http !== null && typeof doc.entryPoints.web.http === 'object' && Object.keys(doc.entryPoints.web.http).length === 0) {
                delete doc.entryPoints.web.http;
            }
        }

        return this.socketProxy.serviceName.apply(name => {
            if (doc?.providers?.docker) {
                doc.providers.docker.endpoint = `tcp://${name}:2375`
            }

            return yaml.stringify(doc);

        })
    }

}
