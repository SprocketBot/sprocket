import * as docker from "@pulumi/docker"
import * as pulumi from "@pulumi/pulumi"
import * as random from "@pulumi/random"

import {LayerTwo, LayerTwoExports} from "global/refs"
import {PlatformDatastore} from "./PlatformDatastore";
import {PlatformDatabase} from "./PlatformDatabase";


const config = new pulumi.Config()

export interface PlatformSecretsArgs {
    datastore: PlatformDatastore,
    database: PlatformDatabase,
    s3AccessKey: {
        id: pulumi.Output<string>,
        secret: pulumi.Output<string>
    },
    environment: string
}


export class PlatformSecrets extends pulumi.ComponentResource {
    readonly influxToken: docker.Secret
    readonly discordBotToken: docker.Secret

    readonly s3SecretKey: docker.Secret
    readonly s3AccessKey: docker.Secret

    readonly redisPassword: docker.Secret
    readonly postgresPassword: docker.Secret

    readonly jwtSecret: docker.Secret

    readonly googleClientId: docker.Secret
    readonly googleClientSecret: docker.Secret

    readonly discordClientSecret: docker.Secret
    readonly discordClientId: docker.Secret

    readonly epicClientId: docker.Secret;
    readonly epicClientSecret: docker.Secret;

    readonly steamApiKey: docker.Secret;

    readonly ballchasingApiToken: docker.Secret

    readonly chatwootHmacKey: docker.Secret

    constructor(name: string, args: PlatformSecretsArgs, opts?: pulumi.ComponentResourceOptions) {
        super("SprocketBot:Platform:Secrets", name, {}, opts)


        this.influxToken = new docker.Secret(`${name}-influx-token`, {
            data: LayerTwo.stack.requireOutput(LayerTwoExports.InfluxDbToken).apply(btoa)
        }, { parent: this })

        this.s3SecretKey = new docker.Secret(`${name}-s3-secret`, {
            data: args.s3AccessKey.secret.apply(btoa)
        }, { parent: this })

        this.s3AccessKey = new docker.Secret(`${name}-s3-access`, {
            data: args.s3AccessKey.id.apply(btoa)
        }, { parent: this })

        this.redisPassword = new docker.Secret(`${name}-redis-password`, {
            data: args.datastore.redis.credentials.password.apply(btoa)
        }, { parent: this })

        this.discordBotToken = new docker.Secret(`${name}-discord-token`, {
            data: config.requireSecret("discord-bot-token").apply(btoa)
        }, { parent: this })

        this.postgresPassword = new docker.Secret(`${name}-db-password`, {
            data: args.database.credentials.password.apply(btoa)
        }, { parent: this })

        this.jwtSecret = new docker.Secret(`${name}-jwt-secret`, {
            data: new random.RandomPassword(`${name}-jwt-secret-randomizer`, {
                length: 128
            }).result.apply(btoa)
        }, { parent: this })

        // Google

        this.googleClientId = new docker.Secret(`${name}-google-client-id`, {
            data: config.requireSecret("google-client-id").apply(btoa)
        }, { parent: this })

        this.googleClientSecret = new docker.Secret(`${name}-google-secret`, {
            data: config.requireSecret("google-client-secret").apply(btoa)
        }, { parent: this })

        // Epic

        this.epicClientId = new docker.Secret(`${name}-epic-client-id`, {
            data: config.requireSecret("epic-client-id").apply(btoa)
        }, { parent: this })

        this.epicClientSecret = new docker.Secret(`${name}-epic-secret`, {
            data: config.requireSecret("epic-client-secret").apply(btoa)
        }, { parent: this })

        // Steam

        this.steamApiKey = new docker.Secret(`${name}-steam-api-key`, {
            data: config.requireSecret("steam-api-key").apply(btoa)
        }, { parent: this })

        // Discord

        this.discordClientSecret = new docker.Secret(`${name}-discord-secret`, {
            data: config.requireSecret("discord-client-secret").apply(btoa)
        }, { parent: this })

        this.discordClientId = new docker.Secret(`${name}-discord-client-id`, {
            data: config.requireSecret("discord-client-id").apply(btoa)
        }, { parent: this })

        this.ballchasingApiToken = new docker.Secret(`${name}-ballchasing-token`, {
            data: config.requireSecret("ballchasing-token").apply(btoa)
        }, { parent: this })

        this.chatwootHmacKey = new docker.Secret(`${name}-chatwoot-hmac-key`, {
            data: config.requireSecret("chatwoot-hmac-key").apply(btoa)
        }, { parent: this })
    }
}
