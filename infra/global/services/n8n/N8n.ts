import * as pulumi from '@pulumi/pulumi';
import * as docker from '@pulumi/docker';
import * as postgres from '@pulumi/postgresql';
import * as random from '@pulumi/random';
import { PostgresUser } from '../../helpers/datastore/PostgresUser';
import defaultLogDriver from '../../helpers/docker/DefaultLogDriver';
import { TraefikLabels } from '../../helpers/docker/TraefikLabels';
import { buildHost } from '../../helpers/buildHost';
import { UTIL_HOSTNAME } from '../../constants';

const config = new pulumi.Config();

export interface N8nArgs {
  providers: {
    postgres: postgres.Provider
  },
  postgresHostname: pulumi.Output<string> | string,
  ingressNetworkId: pulumi.Output<string> | string,
  postgresNetworkId: docker.Network['id'],
}

export class N8n extends pulumi.ComponentResource {
  readonly database: postgres.Database;
  readonly dbUser: PostgresUser;

  readonly network: docker.Network;
  readonly service: docker.Service;

  private readonly encryptionKey: random.RandomPassword;

  constructor(name: string, args: N8nArgs, opts?: pulumi.ComponentResourceOptions) {
    super('SprocketBot:Services:N8n', name, {}, opts);

    this.dbUser = new PostgresUser(`${name}-user`, {
      providers: args.providers,
      username: `${name}-user`
    }, { parent: this });

    this.database = new postgres.Database(`${name}-db`, {
      name: `${name}-db`,
      owner: this.dbUser.username
    }, { parent: this, provider: args.providers.postgres });

    this.encryptionKey = new random.RandomPassword(`${name}-encryption-key`, {
      length: 128
    }, { parent: this });


    this.network = new docker.Network(`${name}-net`, { driver: 'overlay' }, { parent: this });

    const hostname = buildHost('n8n', UTIL_HOSTNAME);

    this.service = new docker.Service(`${name}-service`, {
      taskSpec: {
        containerSpec: {
          image: 'n8nio/n8n',
          env: {
            DB_TYPE: 'postgresdb',
            DB_POSTGRESDB_DATABASE: this.database.name,
            DB_POSTGRESDB_HOST: args.postgresHostname,
            DB_POSTGRESDB_PORT: config.require('postgres-port'),
            DB_POSTGRESDB_USER: config.require('postgres-username'),
            DB_POSTGRESDB_SCHEMA: 'public',
            DB_POSTGRESDB_PASSWORD: config.requireSecret('postgres-password'),
            N8N_BASIC_AUTH_ACTIVE: 'false',
            WEBHOOK_URL: hostname,
            N8N_HOST: hostname,
            N8N_PORT: '5678',

            N8N_ENCRYPTION_KEY: this.encryptionKey.result,

            N8N_USER_MANAGEMENT_DISABLED: 'true',
            N8N_ENFORCE_SETTINGS_FILE_PERMISSIONS: 'true'
          }
        },
        placement: {
          constraints: [
            'node.labels.role!=ingress'
          ]
        },
        logDriver: defaultLogDriver(name, true),
        networksAdvanceds: [
          { name: args.postgresNetworkId },
          { name: args.ingressNetworkId },
          { name: this.network.id }
        ]
      },
      labels: [
        ...new TraefikLabels('n8n', 'http')
          .tls('lets-encrypt-tls')
          .rule(`Host(\`${hostname}\`)`)
          .targetPort(5678)
          .service('n8n')
          .forwardAuthRule('EloTeam')
          .complete,
        ...new TraefikLabels('n8n-webhooks', 'http')
          .tls('lets-encrypt-tls')
          .rule(`Host(\`${hostname}\`) && PathPrefix(\`/webhook\`)`)
          .service('n8n-webhooks')
          .targetPort(5678)
          .complete
      ]
    }, {
      parent: this
    });

  }
}
