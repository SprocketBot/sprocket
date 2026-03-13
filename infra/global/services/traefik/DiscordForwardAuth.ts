import * as docker from "@pulumi/docker";
import * as pulumi from "@pulumi/pulumi";
import {getImageSha} from "../../helpers/docker/getImageSha";
import {ConfigFile} from "../../helpers/docker/ConfigFile";
import {TraefikLabels} from "../../helpers/docker/TraefikLabels";
import {HOSTNAME} from "../../constants";
const config = new pulumi.Config()

export interface DiscordForwardAuthArgs {
    networkId: docker.Network["id"]
    configFilePath: string
}

export class DiscordForwardAuth extends pulumi.ComponentResource {
    readonly config: ConfigFile
    readonly service: docker.Service

    constructor(name: string, args: DiscordForwardAuthArgs, opts?: pulumi.ComponentResourceOptions) {
        super("SprocketBot:Services:Traefik:DiscordForwardAuth", name, {}, opts)

        this.config = new ConfigFile(`${name}-config`, {
            filepath: args.configFilePath
        }, { parent: this })

        this.service = new docker.Service(`${name}-service`, {
            auth: {
                username: config.require("docker-username"),
                password: config.requireSecret("docker-access-token"),
                serverAddress: "https://docker.io"
            },
            taskSpec: {
                containerSpec: {
                    image: getImageSha("asaxplayinghorse", "discord-forward-auth", "latest"),
                    env: {
                        CONFIG_FILE: "/app/config.yaml",
                        CLIENT_SECRET: config.requireSecret("discord-fa-client-secret")
                    },
                    configs: [{
                        configId: this.config.id,
                        configName: this.config.name,
                        fileName: "/app/config.yaml"
                    }],
                },
                networksAdvanceds: [
                    { name: args.networkId }
                ]
            },
            labels: [
                ...new TraefikLabels("http")
                    .tls("lets-encrypt-tls")
                    .targetPort(3000)
                    .rule(`Host(\`fa.${HOSTNAME}\`)`)
                    .complete
            ]
        }, { parent: this })
    }
}
