import * as pulumi from "@pulumi/pulumi";
import * as docker from "@pulumi/docker";
import {ServiceCredentials} from "../../helpers/ServiceCredentials";
import DefaultLogDriver from "../../helpers/docker/DefaultLogDriver";
import {TraefikLabels} from "../../helpers/docker/TraefikLabels";
import {HOSTNAME} from "../../constants";
import {buildHost} from "../../helpers/buildHost";

export interface DGraphArgs {
    platformNetworkId?: docker.Network["id"]
    ingressNetworkId: docker.Network["id"]
    environment: string
    additionalNetworks?: docker.Network["id"][]
}

export class DGraph extends pulumi.ComponentResource {
    readonly credentials: ServiceCredentials
    readonly hostname: docker.Service["name"]
    readonly url: string

    private readonly dgraphNet: docker.Network
    private readonly dataVolume: docker.Volume
    private readonly zeroVolume: docker.Volume
    private readonly zero: docker.Service
    private readonly alpha: docker.Service
    private readonly alphaPort: number

    constructor(name: string, args: DGraphArgs, opts?: pulumi.ComponentResourceOptions) {
        super("SprocketBot:Services:DGraph", name, {}, opts)
        
        this.url = buildHost("dgraph", args.environment, HOSTNAME)

        this.credentials = new ServiceCredentials(`${name}-root-credentials`, {
            username: "dgraph",
        }, {parent: this})

        this.dgraphNet = new docker.Network(`${name}-net`, {
            driver: 'overlay'
        }, {
            parent: this
        })

        this.dataVolume = new docker.Volume(`${name}-data-vol`, {
            name: `${name}-data`,
            driver: "local",
            driverOpts: {
                "type": "none",
                "o": "bind",
                "device": "/mnt/sprocketbot_influx_data/dgraph"
            }
        }, {
            parent: this,
            retainOnDelete: true
        })
        this.zeroVolume = new docker.Volume(`${name}-zero-vol`, {
            name: `${name}-zero-data`,
            driver: "local",
            driverOpts: {
                "type": "none",
                "o": "bind",
                "device": "/mnt/sprocketbot_influx_data/dgraph_zero"
            }
        }, {
            parent: this,
            retainOnDelete: true
        })


        this.zero = new docker.Service(`${name}-service`, {
            name: `${name}-zero`,
            taskSpec: {
                containerSpec: {
                    image: "dgraph/dgraph:v21.12.0",
                    env: {},
                    commands: [
                      `dgraph`,
                      "zero",
                      `--my=${name}-zero:5080`
                    ],
                    mounts: [{
                        type: "volume",
                        target: "/dgraph",
                        source: this.zeroVolume.id
                    }],
                },
                logDriver: DefaultLogDriver(`${name}-zero`, true),
                networksAdvanceds: args.platformNetworkId ? [
                    { name: args.platformNetworkId },
                    { name: args.ingressNetworkId },
                    { name: this.dgraphNet.id }
                ] : [{ name: args.ingressNetworkId }, { name: this.dgraphNet.id }]
            },
        }, {parent: this})

        this.alphaPort = 7080

        this.alpha = new docker.Service(`${name}-alpha`, {
            name: `${name}-alpha`,
            taskSpec: {
                containerSpec: {
                    image: "dgraph/dgraph:v21.12.0",
                    env: {},
                    mounts: [{
                        type: "volume",
                        target: "/dgraph",
                        source: this.dataVolume.id
                    }],
                    commands: [
                        "dgraph",
                        "alpha",
                        `--my=${name}-alpha:${this.alphaPort}`,
                        `--zero=${name}-zero:5080`,
                    ],
                },
                logDriver: DefaultLogDriver(`${name}-alpha`, true),
                networksAdvanceds: args.platformNetworkId ? [
                    { name: args.platformNetworkId },
                    { name: args.ingressNetworkId },
                    { name: this.dgraphNet.id },
                    ...(args.additionalNetworks ?? []).map(n => ({ name: n })),
                ] : [{ name: args.ingressNetworkId }, { name: this.dgraphNet.id }],
            },
            labels: new TraefikLabels(name)
                .tls("lets-encrypt-tls")
                .rule(`Host(\`${this.url}\`)`)
                .targetPort(8080)
                .forwardAuthRule("EloTeam")
                .complete,
        })

        this.hostname = this.alpha.name
    }
}
