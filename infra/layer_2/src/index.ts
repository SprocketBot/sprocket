// Handles self
import { Gatus, Redis } from 'global/services';
import { Monitoring } from './monitoring';
import * as pulumi from '@pulumi/pulumi';
import * as postgres from '@pulumi/postgresql';
import * as docker from '@pulumi/docker';
import { LayerOne, LayerOneExports } from 'global/refs';
import { buildHost } from 'global/helpers/buildHost';
import { HOSTNAME } from 'global/constants';

import { SprocketPostgresProvider } from 'global/providers/SprocketPostgresProvider';

const config = new pulumi.Config();

const ingressNetworkId = LayerOne.stack.requireOutput(LayerOneExports.IngressNetwork) as pulumi.Output<string>;

const chatwootNetwork = new docker.Network('chatwoot-network', {
  driver: 'overlay'
});

export const pg = new SprocketPostgresProvider({
}, {});

export const postgresProvider: postgres.Provider = pg as postgres.Provider;
export const redisPublicHostname = buildHost("redis", HOSTNAME);

export const monitoring = new Monitoring('monitoring', {
  exposeInfluxUi: true,
  ingressNetworkId,
  providers: {
    postgres: postgresProvider
  }
});

export const sharedRedis = new Redis("layer2redis", {
  configFilepath: `${__dirname}/config/redis/redis.conf`,
  ingressNetworkId: ingressNetworkId,
  platformNetworkId: chatwootNetwork.id,
  url: redisPublicHostname,
});

export const GatusInternal = new Gatus("gatus-internal", {
  ingressNetworkId,
  configFilePath: `${__dirname}/config/gatus/config.yml`,
});
