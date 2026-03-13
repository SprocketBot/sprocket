import * as pulumi from "@pulumi/pulumi"
import * as postgres from "@pulumi/postgresql"
import * as random from "@pulumi/random"
import * as minio from "@pulumi/minio"
import * as docker from "@pulumi/docker"
import { CHATWOOT_SUBDOMAIN, HOSTNAME } from "../../constants";
import { PostgresUser } from "../../helpers/datastore/PostgresUser";
import { TraefikLabels } from "../../helpers/docker/TraefikLabels";
import { SprocketMinioProvider } from "../../providers/SprocketMinioProvider";
import defaultLogDriver from "../../helpers/docker/DefaultLogDriver";
import { readFileSync } from "fs";

const config = new pulumi.Config();

export interface ChatwootArgs {
    ingressNetworkId: docker.Network["id"],
    networkId: docker.Network["id"]
    postgresNetworkId: docker.Network["id"],
    providers: {
        postgres: postgres.Provider,
        minio: SprocketMinioProvider
    },
    postgres: {
        host: string | pulumi.Output<string>
    },
    redis: {
        password: pulumi.Output<string>,
        host: pulumi.Output<string> | string
    },
    smtp: {
        host: string,
        username: string,
        password: pulumi.Output<string>,
        port: number
        domain: string
    }
}

export class Chatwoot extends pulumi.ComponentResource {
    readonly service: docker.Service
    readonly sidekiq: docker.Service
    readonly bucket: minio.S3Bucket
    readonly s3User: minio.IamUser
    readonly s3Policy: minio.IamPolicy
    readonly s3PolicyAttachment: minio.IamUserPolicyAttachment

    readonly postgresUser: PostgresUser
    readonly postgresDb: postgres.Database

    readonly url: string
    private readonly secretKeyBase: random.RandomPassword


    constructor(name: string, args: ChatwootArgs, opts?: pulumi.ComponentResourceOptions) {
        super("SprocketBot:Services:Chatwoot", name, {}, opts)
        this.secretKeyBase = new random.RandomPassword(`${name}-secret-key`, {
            upper: true,
            lower: true,
            special: true,
            number: true, length: 128
        }, { parent: this })

        this.postgresUser = new PostgresUser(`${name}-db-user`, {
            username: "chatwoot",
            providers: args.providers
        }, { parent: this })

        this.postgresDb = new postgres.Database(`${name}-db`, {
            name: name,
            owner: this.postgresUser.username
        }, { parent: this, provider: args.providers.postgres })

        this.bucket = new minio.S3Bucket(`${name}-s3-bucket`, {
            bucket: name
        }, { parent: this, provider: args.providers.minio })

        this.s3User = new minio.IamUser(`${name}-s3-user`, {
            name: name
        }, { parent: this, provider: args.providers.minio })

        const policyContent = readFileSync(`${__dirname}/minio-policy.txt`).toString().replace(/\{\{\s*bucket\s*\}\}/g, name)

        this.s3Policy = new minio.IamPolicy(`${name}-s3-policy`, {
            policy: policyContent
        }, { parent: this, provider: args.providers.minio })

        this.s3PolicyAttachment = new minio.IamUserPolicyAttachment(`${name}-s3-policy-attachment`, {
            userName: this.s3User.name,
            policyName: this.s3Policy.name
        }, { parent: this, provider: args.providers.minio })

        this.url = `${CHATWOOT_SUBDOMAIN}.${HOSTNAME}`

        const containerSpec = {
            image: "chatwoot/chatwoot:latest-ce",

            // https://www.chatwoot.com/docs/self-hosted/configuration/environment-variables
            env: {
                SECRET_KEY_BASE: this.secretKeyBase.result,
                FRONTEND_URL: this.url,
                FORCE_SSL: "false",
                ENABLE_ACCOUNT_SIGNUP: "false",
                REDIS_URL: pulumi.output(args.redis.host).apply(h => `redis://${h}`),
                REDIS_PASSWORD: args.redis.password,
                POSTGRES_HOST: args.postgres.host,
                POSTGRES_DATABASE: this.postgresDb.name,
                POSTGRES_USERNAME: config.require('postgres-username'),
                POSTGRES_PASSWORD: config.requireSecret('postgres-password'),
                RAILS_MAX_THREADS: "5",
                MAILER_SENDER_EMAIL: "Sprocket Support <support@sprocket.gg>",

                SMTP_ADDRESS: args.smtp.host,
                SMTP_AUTHENTICATION: "plain",
                SMTP_DOMAIN: args.smtp.domain,
                SMTP_ENABLE_STARTTLS_AUTO: "true",
                SMTP_PORT: args.smtp.port.toString(),
                SMTP_USERNAME: args.smtp.username,
                SMTP_PASSWORD: args.smtp.password,

                RAILS_LOG_TO_STDOUT: "true",
                ACTIVE_STORAGE_SERVICE: "s3_compatible",
                STORAGE_BUCKET_NAME: this.bucket.bucket,
                STORAGE_ACCESS_KEY_ID: this.s3User.name,
                STORAGE_SECRET_ACCESS_KEY: this.s3User.secret,
                STORAGE_REGION: "local",
                STORAGE_ENDPOINT: 'https://mle-chatwoot.nyc3.digitaloceanspaces.com',//`https://files.${HOSTNAME}`,
                STORAGE_FORCE_PATH_STYLE: "true",
                NODE_ENV: "production",
                RAILS_ENV: "production",
                INSTALLATION_ENV: "docker",
                // TODO: Twitter (?)
            },
        }

        this.sidekiq = new docker.Service(`${name}-sidekiq`, {
            taskSpec: {
                containerSpec: {
                    ...containerSpec,
                    commands: ['bundle', 'exec', 'sidekiq', '-C', 'config/sidekiq.yml']
                },
                networksAdvanceds: [
                    { name: args.postgresNetworkId },
                    { name: args.networkId }
                ]
            }
        }, { parent: this })

        this.service = new docker.Service(`${name}-service`, {
            taskSpec: {
                containerSpec: {
                    ...containerSpec,
                    commands: [
                        'bundle', 'exec', 'rails', 's', '-p', '3000', '-b', '0.0.0.0'
                    ],
                },
                logDriver: defaultLogDriver(name, true),
                networksAdvanceds: [
                    { name: args.ingressNetworkId },
                    { name: args.networkId },
                    { name: args.postgresNetworkId }
                ]
            },
            labels: new TraefikLabels(name)
                .tls("lets-encrypt-tls")
                .rule(`Host(\`${this.url}\`)`)
                .targetPort(3000)
                .complete
        }, { parent: this })
    }
}
