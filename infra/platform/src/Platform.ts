import * as docker from "@pulumi/docker"
import * as pulumi from "@pulumi/pulumi"
import * as aws from "@pulumi/aws"
import * as random from "@pulumi/random";

import { SprocketService, SprocketServiceArgs } from "./microservices/SprocketService";
import { PlatformDatastore } from "./PlatformDatastore";

import { TraefikLabels } from "global/helpers/docker/TraefikLabels";
import { buildHost } from "global/helpers/buildHost";
import { CHATWOOT_SUBDOMAIN, DEV_CHATWOOT_WEBSITE_TOKEN, HOSTNAME, PRODUCTION_CHATWOOT_WEBSITE_TOKEN } from "global/constants"
import { PlatformSecrets } from "./PlatformSecrets";
import { PlatformDatabase } from "./PlatformDatabase";
import { PlatformS3 } from "./PlatformS3";
import { EloService } from "./microservices/EloService";
import { LegacyPlatform } from './legacy/LegacyPlatform';

const config = new pulumi.Config()
const imageNamespace = config.require("image-namespace")

/** When true, core reads legacy mledb.player_to_org only if the user has no Sprocket org-team rows (see issue #726). */
const orgTeamPermissionDualRead = config.getBoolean("org-team-permission-dual-read") ?? false
const orgTeamPermissionDualReadEnv = orgTeamPermissionDualRead ? "true" : "false"

export interface PlatformArgs {
    postgresHostname: string | pulumi.Output<string>
    postgresPort: number | pulumi.Output<number>
    redisHostname: pulumi.Output<string>
    redisPassword: pulumi.Output<string>

    s3Provider: aws.Provider
    s3Endpoint: string | pulumi.Output<string>
    s3AccessKey: pulumi.Output<string>
    s3SecretKey: pulumi.Output<string>

    ingressNetworkId: docker.Network["id"],
    monitoringNetworkId: docker.Network["id"],
    //n8nNetworkId: docker.Network["id"],

    configRoot: string
}

export class Platform extends pulumi.ComponentResource {
    readonly environmentSubdomain: string
    readonly ingressNetworkId: docker.Network["id"]

    readonly datastore: PlatformDatastore
    readonly network: docker.Network

    readonly secrets: PlatformSecrets
    readonly database: PlatformDatabase
    readonly objectStorage: PlatformS3
    readonly postgresPort: number | pulumi.Output<number>

    readonly core?: SprocketService
    readonly monolith?: SprocketService
    readonly clients: {
        discordBot?: SprocketService,
        web?: SprocketService,
        imageGen?: SprocketService
    }


    readonly apiUrl: string
    readonly webUrl: string
    readonly chatwootUrl: string
    readonly igUrl: string

    readonly key: random.RandomUuid


    readonly services: {
        imageGen?: SprocketService,
        analytics?: SprocketService,
        matchmaking?: SprocketService,
        replayParse?: SprocketService,
        elo: EloService,
        notifications?: SprocketService,
        submissions?: SprocketService
    }

    constructor(name: string, args: PlatformArgs, opts?: pulumi.ComponentResourceOptions) {
        super("SprocketBot:Platform", name, {}, opts)

        this.key = new random.RandomUuid(`${name}-key`)

        this.environmentSubdomain = config.require("subdomain")
        this.ingressNetworkId = args.ingressNetworkId
        this.postgresPort = args.postgresPort
        this.network = new docker.Network(`${name}-net`, { driver: "overlay" }, { parent: this })


        this.objectStorage = new PlatformS3(`${name}-s3`, {
            environment: this.environmentSubdomain,
            s3Provider: args.s3Provider,
            s3Endpoint: args.s3Endpoint,
            accessKey: args.s3AccessKey,
            secretKey: args.s3SecretKey
        }, { parent: this })

        this.datastore = new PlatformDatastore(`${name}-datastores`, {
            ingressNetworkId: args.ingressNetworkId,
            platformNetworkId: this.network.id,
            redisHostname: args.redisHostname,
            redisPassword: args.redisPassword,
            configRoot: `${args.configRoot}/datastores`
        }, { parent: this })

        this.database = new PlatformDatabase(`${name}-database`, {
            environmentSubdomain: this.environmentSubdomain,
            postgresHostname: args.postgresHostname
        }, { parent: this })

        this.secrets = new PlatformSecrets(`${name}-secrets`, {
            datastore: this.datastore,
            database: this.database,
            s3AccessKey: this.objectStorage.s3AccessKey,
            environment: this.environmentSubdomain
        }, { parent: this })


        /////////////////
        // Create Clients / Core
        /////////////////
        this.apiUrl = buildHost("api", HOSTNAME)
        this.webUrl = buildHost(HOSTNAME)
        this.chatwootUrl = buildHost(CHATWOOT_SUBDOMAIN, HOSTNAME)
        this.igUrl = buildHost("image-generation", HOSTNAME)

        // Allow access via IP address for remote browsers (optional)
        const serverIp = config.get("server-ip") || ""
        const tailscaleIp = config.get("tailscale-ip") || ""
        const ipRule = [serverIp, tailscaleIp]
            .filter(Boolean)
            .map(ip => `Host(\`${ip}\`)`)
            .join(" || ")
        const fullIpRule = ipRule ? ` || ${ipRule}` : ""

        const coreLabels = new TraefikLabels(`sprocket-core-${this.environmentSubdomain}`)
            .tls("lets-encrypt-tls")
            .rule(`Host(\`${this.apiUrl}\`)`)
            .targetPort(3001)
        const webLabels = new TraefikLabels(`sprocket-web-${this.environmentSubdomain}`)
            .tls("lets-encrypt-tls")
            .rule(`Host(\`${this.webUrl}\`)`)
            .targetPort(3000)
        const imageGenLabels = new TraefikLabels(`sprocket-image-gen-${this.environmentSubdomain}`)
            .tls("lets-encrypt-tls")
            .rule(`Host(\`${this.igUrl}\`)`)
            .targetPort(3000)

        if (config.getBoolean("alpha-restrictions")) {
            webLabels.forwardAuthRule("AlphaTesters")
        }

        const monolithMode = config.getBoolean("monolith-mode") ?? false
        const deployImageGenerationFrontend = monolithMode
            ? (config.getBoolean("deploy-image-generation-frontend") ?? false)
            : true

        if (monolithMode) {
            this.monolith = new SprocketService(`${name}-sprocket-monolith`, {
                ...this.buildDefaultConfiguration("monolith", args.configRoot),
                image: {
                    namespace: imageNamespace,
                    repository: config.get("monolith-image-repository") ?? "monolith",
                    tag: config.require("image-tag")
                },
                labels: [
                    ...coreLabels.complete
                ],
                flags: { database: true },
                commands: ["node", "/app/apps/monolith/dist/apps/monolith/src/main.js"],
                env: {
                    NODE_ENV: "production",
                    ENV: "production",
                    ORG_TEAM_PERMISSION_DUAL_READ: orgTeamPermissionDualReadEnv,
                },
                secrets: [{
                    secretId: this.secrets.jwtSecret.id,
                    secretName: this.secrets.jwtSecret.name,
                    fileName: "/app/secret/jwtSecret.txt"
                }, {
                    secretId: this.secrets.s3SecretKey.id,
                    secretName: this.secrets.s3SecretKey.name,
                    fileName: "/app/secret/minio-secret.txt"
                }, {
                    secretId: this.secrets.s3AccessKey.id,
                    secretName: this.secrets.s3AccessKey.name,
                    fileName: "/app/secret/minio-access.txt"
                }, {
                    secretId: this.secrets.googleClientId.id,
                    secretName: this.secrets.googleClientId.name,
                    fileName: "/app/secret/googleClientId.txt"
                }, {
                    secretId: this.secrets.googleClientSecret.id,
                    secretName: this.secrets.googleClientSecret.name,
                    fileName: "/app/secret/googleSecret.txt"
                }, {
                    secretId: this.secrets.discordClientSecret.id,
                    secretName: this.secrets.discordClientSecret.name,
                    fileName: "/app/secret/discord-secret.txt"
                }, {
                    secretId: this.secrets.discordClientId.id,
                    secretName: this.secrets.discordClientId.name,
                    fileName: "/app/secret/discord-client.txt"
                }, {
                    secretId: this.secrets.discordBotToken.id,
                    secretName: this.secrets.discordBotToken.name,
                    fileName: "/app/secret/bot-token.txt"
                }, {
                    secretId: this.secrets.redisPassword.id,
                    secretName: this.secrets.redisPassword.name,
                    fileName: "/app/secret/redis-password.txt"
                }, {
                    secretId: this.secrets.epicClientId.id,
                    secretName: this.secrets.epicClientId.name,
                    fileName: "/app/secret/epic-client.txt"
                }, {
                    secretId: this.secrets.epicClientSecret.id,
                    secretName: this.secrets.epicClientSecret.name,
                    fileName: "/app/secret/epic-secret.txt"
                }, {
                    secretId: this.secrets.steamApiKey.id,
                    secretName: this.secrets.steamApiKey.name,
                    fileName: "/app/secret/steam-key.txt"
                }, {
                    secretId: this.secrets.influxToken.id,
                    secretName: this.secrets.influxToken.name,
                    fileName: "/app/secret/influx-token"
                }],
                networks: [
                    args.ingressNetworkId,
                    args.monitoringNetworkId
                ]
            }, { parent: this })
        } else {
            this.core = new SprocketService(`${name}-sprocket-core`, {
                ...this.buildDefaultConfiguration("core", args.configRoot),
                labels: [
                    ...coreLabels.complete
                ],
                flags: { database: true },
                commands: ["node", "/app/core/dist/main.js"],
                env: {
                    CACHE_HOST: this.datastore.redis.hostname,
                    CACHE_PORT: "6379",
                    LOGGER_LEVELS: '["error","warn","log","debug"]',
                    ORG_TEAM_PERMISSION_DUAL_READ: orgTeamPermissionDualReadEnv,
                },
                secrets: [{
                    secretId: this.secrets.jwtSecret.id,
                    secretName: this.secrets.jwtSecret.name,
                    fileName: "/app/secret/jwtSecret.txt"
                }, {
                    secretId: this.secrets.s3SecretKey.id,
                    secretName: this.secrets.s3SecretKey.name,
                    fileName: "/app/secret/minio-secret.txt"
                }, {
                    secretId: this.secrets.s3AccessKey.id,
                    secretName: this.secrets.s3AccessKey.name,
                    fileName: "/app/secret/minio-access.txt"
                }, {
                    secretId: this.secrets.googleClientId.id,
                    secretName: this.secrets.googleClientId.name,
                    fileName: "/app/secret/googleClientId.txt"
                }, {
                    secretId: this.secrets.googleClientSecret.id,
                    secretName: this.secrets.googleClientSecret.name,
                    fileName: "/app/secret/googleSecret.txt"
                }, {
                    secretId: this.secrets.discordClientSecret.id,
                    secretName: this.secrets.discordClientSecret.name,
                    fileName: "/app/secret/discord-secret.txt"
                }, {
                    secretId: this.secrets.discordClientId.id,
                    secretName: this.secrets.discordClientId.name,
                    fileName: "/app/secret/discord-client.txt"
                }, {
                    secretId: this.secrets.redisPassword.id,
                    secretName: this.secrets.redisPassword.name,
                    fileName: "/app/secret/redis-password.txt"
                }, {
                    secretId: this.secrets.epicClientId.id,
                    secretName: this.secrets.epicClientId.name,
                    fileName: "/app/secret/epic-client.txt"
                }, {
                    secretId: this.secrets.epicClientSecret.id,
                    secretName: this.secrets.epicClientSecret.name,
                    fileName: "/app/secret/epic-secret.txt"
                }, {
                    secretId: this.secrets.steamApiKey.id,
                    secretName: this.secrets.steamApiKey.name,
                    fileName: "/app/secret/steam-key.txt"
                }],
                networks: [
                    args.ingressNetworkId
                ]
            }, { parent: this })
        }

        this.clients = {
            web: new SprocketService(`${name}-sprocket-web`, {
                ...this.buildDefaultConfiguration("web", args.configRoot),
                labels: [
                    ...webLabels.complete
                ],
                configFile: {
                    destFilePath: "/app/clients/web/config/production.json",
                    sourceFilePath: `${args.configRoot}/services/web.json`,
                },
                secrets: [{
                    secretId: this.secrets.chatwootHmacKey.id,
                    secretName: this.secrets.chatwootHmacKey.name,
                    fileName: "/app/secret/chatwoot-hmac-key.txt"
                }],
                env: {
                    ENV: "production",
                    NODE_ENV: "production",
                    NODE_CONFIG_DIR: "/app/clients/web/config",
                },
                networks: [
                    args.ingressNetworkId
                ],
            }, { parent: this }),

            imageGen: deployImageGenerationFrontend
                ? new SprocketService(`${name}-sprocket-image-generation-frontend`, {
                    ...this.buildDefaultConfiguration("image-generation-frontend", args.configRoot),
                    labels: [
                        ...imageGenLabels.complete
                    ],
                    configFile: {
                        destFilePath: "/app/src/config.json",
                        sourceFilePath: `${args.configRoot}/services/image-generation-frontend.json`,
                    },
                    secrets: [
                        {
                            secretId: this.secrets.s3SecretKey.id,
                            secretName: this.secrets.s3SecretKey.name,
                            fileName: "/app/secret/minio-secret.txt"
                        }, {
                            secretId: this.secrets.s3AccessKey.id,
                            secretName: this.secrets.s3AccessKey.name,
                            fileName: "/app/secret/minio-access.txt"
                        }, {
                            secretId: this.secrets.postgresPassword.id,
                            secretName: this.secrets.postgresPassword.name,
                            fileName: "/app/secret/db-secret.txt"

                        }
                    ],
                    networks: [
                        args.ingressNetworkId
                    ],
                }, { parent: this })
                : undefined,

            discordBot: monolithMode
                ? undefined
                : new SprocketService(`${name}-discord-bot`, {
                    ...this.buildDefaultConfiguration("discord-bot", args.configRoot),
                    secrets: [{
                        secretId: this.secrets.discordBotToken.id,
                        secretName: this.secrets.discordBotToken.name,
                        fileName: "/app/secret/bot-token.txt"
                    }, {
                        secretId: this.secrets.s3SecretKey.id,
                        secretName: this.secrets.s3SecretKey.name,
                        fileName: "/app/secret/minio-secret.txt"
                    }, {
                        secretId: this.secrets.s3AccessKey.id,
                        secretName: this.secrets.s3AccessKey.name,
                        fileName: "/app/secret/minio-access.txt"
                    }]
                }, { parent: this })
        }


        /////////////////
        // Create Microservices
        /////////////////

        this.services = {
            notifications: monolithMode
                ? undefined
                : new SprocketService(`${name}-notification-service`, {
                    ...this.buildDefaultConfiguration("notification-service", args.configRoot),
                    secrets: [{
                        secretId: this.secrets.redisPassword.id,
                        secretName: this.secrets.redisPassword.name,
                        fileName: "/app/secret/redis-password.txt"
                    }]
                }, { parent: this }),
            imageGen: monolithMode
                ? undefined
                : new SprocketService(`${name}-image-generation-service`, {
                    ...this.buildDefaultConfiguration("image-generation-service", args.configRoot),
                    secrets: [{
                        secretId: this.secrets.s3SecretKey.id,
                        secretName: this.secrets.s3SecretKey.name,
                        fileName: "/app/secret/minio-secret.txt"
                    }, {
                        secretId: this.secrets.s3AccessKey.id,
                        secretName: this.secrets.s3AccessKey.name,
                        fileName: "/app/secret/minio-access.txt"
                    }, {
                        secretId: this.secrets.postgresPassword.id,
                        secretName: this.secrets.postgresPassword.name,
                        fileName: "/app/secret/db-secret.txt"
                    }]
                }, { parent: this }),

            analytics: monolithMode
                ? undefined
                : new SprocketService(`${name}-server-analytics-service`, {
                    ...this.buildDefaultConfiguration("server-analytics-service", args.configRoot),
                    networks: [
                        args.monitoringNetworkId,
                        args.ingressNetworkId
                    ],
                    secrets: [{
                        secretId: this.secrets.influxToken.id,
                        secretName: this.secrets.influxToken.name,
                        fileName: "/app/secret/influx-token"
                    }]
                }, { parent: this }),

            matchmaking: monolithMode
                ? undefined
                : new SprocketService(`${name}-matchmaking-service`, {
                    ...this.buildDefaultConfiguration("matchmaking-service", args.configRoot),
                    secrets: [{
                        secretId: this.secrets.redisPassword.id,
                        secretName: this.secrets.redisPassword.name,
                        fileName: "/app/secret/redis-password.txt"
                    }]
                }, { parent: this }),

            replayParse: new SprocketService(`${name}-replay-parse-service`, {
                ...this.buildDefaultConfiguration("replay-parse-service", args.configRoot),
                env: {
                    ENV: "production",
                    CELERY_WORKER_MAX_TASKS_PER_CHILD: "50",
                    CELERY_WORKER_MAX_MEMORY_PER_CHILD: "307200", // 300MB in KB
                    CELERY_WORKER_CONCURRENCY: "4",               // Halving from 8
                },
                secrets: [{
                    secretId: this.secrets.s3SecretKey.id,
                    secretName: this.secrets.s3SecretKey.name,
                    fileName: "/app/secret/minio-secret.txt"
                }, {
                    secretId: this.secrets.ballchasingApiToken.id,
                    secretName: this.secrets.ballchasingApiToken.name,
                    fileName: "/app/secret/ballchasing-token"
                }]
            }, { parent: this }),

            elo: new EloService(`${name}-elo-service`, {
                ...this.buildDefaultConfiguration("elo-service", args.configRoot),
                env: {
                    REDIS_HOST: this.datastore.redis.hostname,
                    REDIS_PORT: "6379",
                    REDIS_PREFIX: this.environmentSubdomain,
                },
                secrets: [
                    {
                        secretId: this.secrets.redisPassword.id,
                        secretName: this.secrets.redisPassword.name,
                        fileName: "/app/secret/redis-password.txt"
                    }
                ],
                ingressNetworkId: args.ingressNetworkId,
                // n8nNetworkId: args.n8nNetworkId
            }, { parent: this }),

            submissions: monolithMode
                ? undefined
                : new SprocketService(`${name}-submission-service`, {
                    ...this.buildDefaultConfiguration("submission-service", args.configRoot),
                    env: {
                        ENV: "production"
                    },
                    secrets: [{
                        secretId: this.secrets.s3SecretKey.id,
                        secretName: this.secrets.s3SecretKey.name,
                        fileName: "/app/secret/minio-secret.txt"
                    }, {
                        secretId: this.secrets.s3AccessKey.id,
                        secretName: this.secrets.s3AccessKey.name,
                        fileName: "/app/secret/minio-access.txt"
                    }, {
                        secretId: this.secrets.redisPassword.id,
                        secretName: this.secrets.redisPassword.name,
                        fileName: "/app/secret/redis-password.txt"
                    }]
                })
        };

        // Monolith deployments omit the legacy worker/bot stack.
        if (monolithMode) return;
        new LegacyPlatform(`${name}-legacy`, {
            database: this.database,
            minio: this.objectStorage,
            postgresPort: this.postgresPort,
            ingressNetworkId: args.ingressNetworkId,
            platformNetworkId: this.network.id,
            redis: this.datastore.redis,
        }, { parent: this })
    }

    buildDefaultConfiguration = (name: string, configRoot: string): SprocketServiceArgs => ({
        image: { namespace: imageNamespace, repository: name, tag: config.require("image-tag") },
        platformNetworkId: this.network.id,
        networks: [
            this.ingressNetworkId
        ],
        configFile: { sourceFilePath: `${configRoot}/services/${name}.json` },
        configValues: {
            transport: pulumi.all([this.datastore.rabbitmq.hostname, this.key.result]).apply(([rmqHost, key]) => JSON.stringify({
                url: `amqp://${rmqHost}:5672?heartbeat=60`,
                matchmaking_queue: `${pulumi.getStack()}-matchmaking`,
                core_queue: `${pulumi.getStack()}-core`,
                bot_queue: `${pulumi.getStack()}-bot`,
                analytics_queue: `${pulumi.getStack()}-analytics`,
                events_queue: `${pulumi.getStack()}-events`,
                events_application_key: `${pulumi.getStack()}-${name}-${key}`,
                "celery-queue": `${pulumi.getStack()}-celery`,
                image_generation_queue: `${pulumi.getStack()}-ig`,
                submission_queue: `${pulumi.getStack()}-submissions`,
                notification_queue: `${pulumi.getStack()}-notifications`
            }, null, 2)),
            logger: {
                levels: pulumi.getStack() === "prod" ? '["error", "warn", "log"]' : '["error", "warn", "log", "debug"]'
            },
            database: {
                host: this.database.host,
                port: this.postgresPort,
                passwordSecret: this.secrets.postgresPassword,
                username: this.database.credentials.username,
                database: this.database.database.name
            },
            redis: {
                port: 6379,
                host: this.datastore.redis.hostname,
                prefix: this.environmentSubdomain,
            },
            rmq: {
                host: this.datastore.rabbitmq.hostname
            },
            influx: {
                host: "http://influx:8086",
                org: "sprocket",
                bucket: "sprocket_" + this.environmentSubdomain,
            },
            s3: {
                endpoint: this.objectStorage.s3Url,
                port: 443,
                ssl: true,
                accessKey: this.objectStorage.s3AccessKey.id,
                bucket: this.objectStorage.bucket.bucket,
                buckets: {
                    imageGeneration: this.objectStorage.imageGenBucket.bucket,
                    replayParse: this.objectStorage.replayBucket.bucket
                }
            },
            celery: {
                broker: this.datastore.rabbitmq?.hostname.apply((h: string) => `amqp://${h}?heartbeat=60`) ?? "",
                backend: pulumi
                    .all([this.datastore.redis?.hostname, this.datastore.redis?.credentials.password])
                    .apply(([h, p]: [string, string]) => `redis://:${p}@${h}`) ?? "",
                queue: `${this.environmentSubdomain}-celery`
            },
            bot: {
                prefix: this.environmentSubdomain === "main" ? "s." : `${this.environmentSubdomain}.`
            },
            gql: {
                internal: this.core?.hostname ? this.core.hostname.apply((h: string) => `${h}:3001/graphql`) : "",
                public: `https://${this.apiUrl}`
            },
            frontend: {
                url: this.webUrl
            },
            api: {
                url: this.apiUrl
            },
            chatwoot: {
                url: this.chatwootUrl,
                websiteToken: pulumi.getStack() === 'prod' ? PRODUCTION_CHATWOOT_WEBSITE_TOKEN : DEV_CHATWOOT_WEBSITE_TOKEN,
            },
            stack: pulumi.getStack(),
        }
    })
}
