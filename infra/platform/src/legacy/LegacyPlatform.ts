import * as docker from '@pulumi/docker';
import * as pulumi from '@pulumi/pulumi';

import defaultLogDriver from 'global/helpers/docker/DefaultLogDriver';
import { getImageSha } from 'global/helpers/docker/getImageSha';
import { PlatformDatabase } from '../PlatformDatabase';
import type { RedisConnection } from '../PlatformDatastore';
import { PlatformS3 } from '../PlatformS3';

const config = new pulumi.Config();

export interface LegacyPlatformArgs {
  database: PlatformDatabase,
  minio: PlatformS3,
  postgresPort: number | pulumi.Output<number>
  ingressNetworkId: docker.Network["id"],
  platformNetworkId: docker.Network["id"],
  redis: RedisConnection
}

export class LegacyPlatform extends pulumi.ComponentResource {
  bot?: docker.Service;
  bot2?: docker.Service;
  readonly worker: docker.Service;
  readonly redis: RedisConnection;
  readonly network: docker.Network;

  private readonly dbCredentials: {
    username: string
    password: pulumi.Output<string>
  };

  constructor(name: string, args: LegacyPlatformArgs, opts?: pulumi.ComponentResourceOptions) {
    super('SprocketBot:LegacyPlatform', name, {}, opts);

    // Get credentials from Pulumi config
    this.dbCredentials = {
      username: `sprocket_${pulumi.getStack()}_legacy`,
      password: config.requireSecret("postgres-password-legacy")
    };

    this.network = new docker.Network(`${name}-net`, {
      driver: 'overlay'
    }, { parent: this });

    this.redis = args.redis;

    this.worker = new docker.Service(`${name}-worker`, {
      auth: {
        username: config.require('docker-username'),
        password: config.requireSecret('docker-access-token'),
        serverAddress: 'https://docker.io'
      },
      taskSpec: {
        containerSpec: {
          image: getImageSha('asaxplayinghorse', 'worker', 'master'),
          env: {
            NODE_ENV: 'production',
            NODE_TLS_REJECT_UNAUTHORIZED: '0',
            REDIS_HOST: this.redis.hostname,
            REDIS_PASSWORD: this.redis.credentials.password,
            REDIS_PORT: '6379',
            bot_token: pulumi.getStack() === "prod" ? config.requireSecret('legacy-bot-token-emilia') : config.requireSecret('legacy-bot-token'),
            connstring: pulumi.all([
              this.dbCredentials.username,
              this.dbCredentials.password,
              args.database.host,
              args.database.database.name,
              args.postgresPort
            ])
              .apply(([dbUser, dbPass, host, db, port]) => {
                const connStr = `postgresql://${dbUser}:${dbPass}@${host}:${port}/${db}?ssl=true`;
                console.log(`Worker connstring: ${connStr}`);
                return connStr;
              }),
            file_bucket: args.minio.bucket.bucket,
            file_token: args.minio.s3AccessKey.id,
            file_token_secret: args.minio.s3AccessKey.secret,
            SPROCKET: 'yes'
          },
          configs: [{
            configId: 'lrssxjdhzv953xw6cwb2zn9wf',
            configName: 'postgres-ca-cert-v1',
            fileName: '/run/configs/postgres-ca.crt',
            fileGid: '0',
            fileUid: '0',
            fileMode: 0o444
          }]
        },
        logDriver: defaultLogDriver(`${name}-worker`, false),
        networksAdvanceds: [
          { name: this.network.id },
          { name: args.platformNetworkId },
          { name: args.ingressNetworkId }
        ]
      }
    }, { parent: this });

    this.buildBots(name, args);
  }


  private buildBots(name: string, args: LegacyPlatformArgs) {
    console.log(pulumi.getStack())
    if (pulumi.getStack() === 'prod') {
      this.buildProductionBot(name, args);
    } else {
      this.buildStagingBot(name, args);
    }
  }

  private buildProductionBot(name: string, args: LegacyPlatformArgs) {
    this.bot = new docker.Service(`${name}-bot-service-emilio`, {
      auth: {
        username: config.require('docker-username'),
        password: config.requireSecret('docker-access-token'),
        serverAddress: 'https://docker.io'
      },
      taskSpec: {
        containerSpec: {
          image: getImageSha('asaxplayinghorse', 'bot', 'master'),
          env: {
            NODE_ENV: 'production',
            NODE_TLS_REJECT_UNAUTHORIZED: '0',
            REDIS_HOST: this.redis.hostname,
            REDIS_PASSWORD: this.redis.credentials.password,
            REDIS_PORT: '6379',
            bot: 'Emilio',
            bot_token: config.requireSecret('legacy-bot-token-emilio'),
            connstring: pulumi.all([
              this.dbCredentials.username,
              this.dbCredentials.password,
              args.database.host,
              args.database.database.name,
              args.postgresPort
            ])
              .apply(([dbUser, dbPass, host, db, port]) => {
                const connStr = `postgresql://${dbUser}:${dbPass}@${host}:${port}/${db}?ssl=true`;
                console.log(`Bot Emilio connstring: ${connStr}`);
                return connStr;
              }),
            file_bucket: args.minio.bucket.bucket,
            file_token: args.minio.s3AccessKey.id,
            file_token_secret: args.minio.s3AccessKey.secret,
            SPROCKET: 'yes'
          },
          configs: [{
            configId: 'lrssxjdhzv953xw6cwb2zn9wf',
            configName: 'postgres-ca-cert-v1',
            fileName: '/run/configs/postgres-ca.crt',
            fileGid: '0',
            fileUid: '0',
            fileMode: 0o444
          }]
        },
        networksAdvanceds: [
          { name: this.network.id },
          { name: args.platformNetworkId },
          { name: args.ingressNetworkId }
        ],
        logDriver: defaultLogDriver(`${name}-emilio`, false)
      }
    }, { parent: this });
    this.bot2 = new docker.Service(`${name}-bot-service-emilia`, {
      auth: {
        username: config.require('docker-username'),
        password: config.requireSecret('docker-access-token'),
        serverAddress: 'https://docker.io'
      },
      taskSpec: {
        containerSpec: {
          image: getImageSha('asaxplayinghorse', 'bot', 'master'),
          env: {
            NODE_ENV: 'production',
            NODE_TLS_REJECT_UNAUTHORIZED: '0',
            REDIS_HOST: this.redis.hostname,
            REDIS_PASSWORD: this.redis.credentials.password,
            REDIS_PORT: '6379',
            bot: 'Emilia',
            bot_token: config.requireSecret('legacy-bot-token-emilia'),
            connstring: pulumi.all([
              this.dbCredentials.username,
              this.dbCredentials.password,
              args.database.host,
              args.database.database.name,
              args.postgresPort
            ])
              .apply(([dbUser, dbPass, host, db, port]) => {
                const connStr = `postgresql://${dbUser}:${dbPass}@${host}:${port}/${db}?ssl=true`;
                console.log(`Bot Emilia connstring: ${connStr}`);
                return connStr;
              }),
            file_bucket: args.minio.bucket.bucket,
            file_token: args.minio.s3AccessKey.id,
            file_token_secret: args.minio.s3AccessKey.secret,
            SPROCKET: 'yes'
          },
          configs: [{
            configId: 'lrssxjdhzv953xw6cwb2zn9wf',
            configName: 'postgres-ca-cert-v1',
            fileName: '/run/configs/postgres-ca.crt',
            fileGid: '0',
            fileUid: '0',
            fileMode: 0o444
          }]
        },
        networksAdvanceds: [
          { name: this.network.id },
          { name: args.platformNetworkId },
          { name: args.ingressNetworkId }
        ],
        logDriver: defaultLogDriver(`${name}-emilia`, false)
      }
    }, { parent: this });

  }

  private buildStagingBot(name: string, args: LegacyPlatformArgs) {
    this.bot = new docker.Service(`${name}-bot-service`, {
      auth: {
        username: config.require('docker-username'),
        password: config.requireSecret('docker-access-token'),
        serverAddress: 'https://docker.io'
      },
      taskSpec: {
        containerSpec: {
          image: getImageSha('asaxplayinghorse', 'bot', 'master'),
          env: {
            NODE_ENV: 'production',
            NODE_TLS_REJECT_UNAUTHORIZED: '0',
            REDIS_HOST: this.redis.hostname,
            REDIS_PASSWORD: this.redis.credentials.password,
            REDIS_PORT: '6379',
            bot: 'ProofOfConcept',
            bot_token: config.requireSecret('legacy-bot-token'),
            connstring: pulumi.all([
              this.dbCredentials.username,
              this.dbCredentials.password,
              args.database.host,
              args.database.database.name,
              args.postgresPort
            ])
              .apply(([dbUser, dbPass, host, db, port]) => {
                const connStr = `postgresql://${dbUser}:${dbPass}@${host}:${port}/${db}?ssl=true`;
                console.log(`Staging Bot connstring: ${connStr}`);
                return connStr;
              }),
            file_bucket: args.minio.bucket.bucket,
            file_token: args.minio.s3AccessKey.id,
            file_token_secret: args.minio.s3AccessKey.secret,
            SPROCKET: 'yes'
          },
          configs: [{
            configId: 'lrssxjdhzv953xw6cwb2zn9wf',
            configName: 'postgres-ca-cert-v1',
            fileName: '/run/configs/postgres-ca.crt',
            fileGid: '0',
            fileUid: '0',
            fileMode: 0o444
          }]
        },
        networksAdvanceds: [
          { name: this.network.id },
          { name: args.platformNetworkId },
          { name: args.ingressNetworkId }
        ],
        logDriver: defaultLogDriver(`${name}-bot`, false)
      }
    }, { parent: this });
  }

}
