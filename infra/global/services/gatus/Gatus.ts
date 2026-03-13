import * as pulumi from "@pulumi/pulumi";
import * as docker from "@pulumi/docker";

import { HOSTNAME } from "../../constants";
import { ConfigFile } from "../../helpers/docker/ConfigFile";
import DefaultLogDriver from "../../helpers/docker/DefaultLogDriver";
import { TraefikLabels } from "../../helpers/docker/TraefikLabels";

export interface GatusArgs {
    ingressNetworkId: docker.Network["id"];
    configFilePath: string;
}

export class Gatus extends pulumi.ComponentResource {
    private readonly service: docker.Service;
    private readonly dbVolume: docker.Volume;
    private readonly config: ConfigFile;

    readonly url: string;

    constructor(name: string, args: GatusArgs, opts?: pulumi.ComponentResourceOptions) {
        super("SprocketBot:Services:Gatus", name, {}, opts);

        this.url = `status.${HOSTNAME}`;

        this.dbVolume = new docker.Volume(`${name}-data`, {}, { parent: this });

        this.config = new ConfigFile(`${name}-config`, {
            filepath: args.configFilePath,
        }, { parent: this });

        const traefikLabels = new TraefikLabels(name)
            .rule(`Host(\`${this.url}\`)`)
            .tls("lets-encrypt-tls")
            .targetPort(8080)
            .complete;

        this.service = new docker.Service(name, {
            taskSpec: {
                containerSpec: {
                    image: "twinproduction/gatus:v5.1.0",
                    mounts: [{
                        type: "volume",
                        source: this.dbVolume.id,
                        target: "/data",
                    }],
                    configs: [{
                        configName: this.config.name,
                        configId: this.config.id,
                        fileName: "/config/config.yaml",
                    }],
                },
                logDriver: DefaultLogDriver(name, true),
                networksAdvanceds: [{ name: args.ingressNetworkId }]
            },
            labels: traefikLabels,
        });
    }
}