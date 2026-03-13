import * as pulumi from "@pulumi/pulumi"
import { ComponentResourceOptions } from "@pulumi/pulumi"
import * as docker from "@pulumi/docker"

import { DockerProvider } from "global/providers/DockerProvider"
import { ConfigFile, ConfigFileArgs } from "global/helpers/docker/ConfigFile"
import { getImageSha } from "global/helpers/docker/getImageSha"
import * as handlebars from "handlebars";
import defaultLogDriver from "global/helpers/docker/DefaultLogDriver"
const config = new pulumi.Config();


type SecretSpec = docker.types.input.ServiceTaskSpecContainerSpecSecret[]
type EnvSpec = docker.types.input.ServiceTaskSpecContainerSpec["env"]
type ConfigSpec = docker.types.input.ServiceTaskSpecContainerSpecConfig
type LabelSpec = docker.types.input.ServiceLabel

type ConfigInput = {
    sourceFilePath: string,
    destFilePath?: string,
    transformation?: ConfigFileArgs["transformation"]
};

type AdditionalConfigInput = ConfigInput & { destFilePath: string }

export type SprocketServiceConfigTemplateValues = {
    transport: string | pulumi.Output<string>,
    logger: {
        levels: string | pulumi.Output<string> | boolean
    },
    rmq: {
        host: string | pulumi.Output<string>,
    },
    database: {
        host: string | pulumi.Output<string>,
        port: number | pulumi.Output<number>,
        passwordSecret: docker.Secret,
        username: string | pulumi.Output<string>,
        database: string | pulumi.Output<string>,
        networkId?: string | pulumi.Output<string>
    },
    s3: {
        endpoint: string | pulumi.Output<string>,
        port: number,
        ssl: boolean,
        accessKey: string | pulumi.Output<string>,
        bucket: string | pulumi.Output<string>,
        buckets: {
            imageGeneration: string | pulumi.Output<string>,
            replayParse: string | pulumi.Output<string>
        }
    },
    influx: {
        host: string | pulumi.Output<string>,
        org: string | pulumi.Output<string>,
        bucket: string | pulumi.Output<string>,
    },
    redis: {
        port: number | pulumi.Output<number>,
        host: string | pulumi.Output<string>,
        prefix: string | pulumi.Output<string>,
    },
    celery: {
        broker: string | pulumi.Output<string>,
        backend: string | pulumi.Output<string>,
        queue: string | pulumi.Output<string>
    },
    bot: {
        prefix: string | pulumi.Output<string>
    },
    gql: {
        internal: string | pulumi.Output<string>
        public: string | pulumi.Output<string>
    },
    frontend: {
        url: string | pulumi.Output<string>
    },
    api: {
        url: string | pulumi.Output<string>
    },
    chatwoot: {
        url: string | pulumi.Output<string>
        websiteToken: string | pulumi.Output<string>
    }
    stack: string
}

export type SprocketServiceArgs = {
    image: {
        namespace: string,
        repository: string,
        tag: string
    },
    platformNetworkId: docker.Network["id"],

    configFile: ConfigInput

    configValues: SprocketServiceConfigTemplateValues

    flags?: {
        database?: boolean
    },

    // Arbitrary Properties
    networks?: docker.Network["id"][],
    secrets?: SecretSpec
    env?: EnvSpec
    additionalConfigs?: AdditionalConfigInput[]
    labels?: LabelSpec[],
    instanceCount?: number
    commands?: string[]
}

export class SprocketService extends pulumi.ComponentResource {
    protected readonly service: docker.Service
    protected readonly coreConfig: ConfigFile

    readonly hostname: docker.Service["name"]

    constructor(name: string, args: SprocketServiceArgs, opts?: ComponentResourceOptions) {
        super("SprocketBot:Application:Microservice", name, {}, opts);

        this.applyConfigurationValues = (fileContent: string) => {
            return pulumi.output(args.configValues).apply(cv => handlebars.compile(fileContent)(cv))
        }

        const secrets: docker.types.input.ServiceTaskSpecContainerSpecSecret[] = [];
        const networks: docker.Network["id"][] = [];
        const environment: EnvSpec = {}

        this.coreConfig = new ConfigFile(`${name}-config`, {
            filepath: args.configFile.sourceFilePath,
            transformation: x => args.configFile.transformation ? this.applyConfigurationValues(x).apply(args.configFile.transformation) : pulumi.output(this.applyConfigurationValues(x))
        }, { parent: this })

        const configs: ConfigSpec[] = [
            {
                configId: this.coreConfig.id,
                configName: this.coreConfig.name,
                fileName: args.configFile.destFilePath ?? "/app/config/production.json"
            },
            ...this.buildConfigs(args.additionalConfigs)
        ]

        if (args.flags?.database) {
            secrets.push({
                fileName: "/app/secret/db-password.txt",
                secretId: args.configValues.database.passwordSecret.id,
                secretName: args.configValues.database.passwordSecret.name
            })
            if (args.configValues.database.networkId) {
                networks.push(
                    pulumi.output(args.configValues.database.networkId)
                )
            }
        }

        this.service = new docker.Service(`${name}-service`, {
            auth: {
                username: config.require("docker-username"),
                password: config.requireSecret("docker-access-token"),
                serverAddress: "https://docker.io"
            },
            taskSpec: {
                containerSpec: {
                    image: getImageSha(args.image.namespace, args.image.repository, args.image.tag),
                    commands: args.commands,
                    secrets: [
                        ...secrets,
                        ...(args.secrets ?? [])
                    ],
                    env: {
                        NODE_ENV: "production",
                        ...environment,
                        ...(args.env ?? {})
                    },
                    configs
                },
                placement: {
                    maxReplicas: args.instanceCount ?? 2,
                },
                logDriver: defaultLogDriver(name, false),
                networksAdvanceds: [
                    { name: args.platformNetworkId },
                    ...networks.map(n => ({ name: n })),
                    ...(args.networks ?? []).map(n => ({ name: n }))
                ]
            },
            labels: args.labels
        }, { parent: this, provider: DockerProvider })
        this.hostname = this.service.name
    }

    applyConfigurationValues: (fileContent: string) => pulumi.Output<string>;

    buildConfigs(configs: AdditionalConfigInput[] | undefined) {
        if (!configs) return [];

        return configs.map<ConfigSpec>(
            ({
                sourceFilePath,
                destFilePath,
                transformation
            }) => {
                const filename = sourceFilePath.split("/").pop()
                const config = new ConfigFile(`${name}-${filename}`, {
                    filepath: sourceFilePath,
                    transformation: (x) => transformation ? this.applyConfigurationValues(x).apply(transformation) : this.applyConfigurationValues(x)
                }, { parent: this })

                return {
                    configId: config.id,
                    configName: config.name,
                    fileName: destFilePath
                }
            })
    }

}
