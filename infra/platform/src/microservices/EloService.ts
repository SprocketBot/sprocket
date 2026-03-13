import * as pulumi from '@pulumi/pulumi';
import * as docker from '@pulumi/docker';
import { SprocketService, SprocketServiceArgs } from './SprocketService';
import { DGraph } from 'global/services';
import { buildHost } from 'global/helpers/buildHost';

type EloServiceArgs = SprocketServiceArgs & { ingressNetworkId: docker.Network['id'] }//, n8nNetworkId: docker.Network["id"] }

export class EloService extends pulumi.ComponentResource {
  readonly dgraph: DGraph;
  readonly service: SprocketService;
  private readonly dgraphSecret: docker.Secret;

  constructor(name: string, args: EloServiceArgs, opts?: pulumi.ComponentResourceOptions) {
    super('SprocketBot:Application:Microservice:Elo', name, {});

    this.dgraph = new DGraph(`${name}-dgraph`, {
      platformNetworkId: args.platformNetworkId,
      ingressNetworkId: args.ingressNetworkId,
      environment: pulumi.getStack(),
      // additionalNetworks: [args.n8nNetworkId]
    }, { parent: this });

    this.dgraphSecret = new docker.Secret(`${name}-secret`, {
      name: `${name}-creds`,
      data: this.dgraph.credentials.password.apply(v => btoa(v))
    }, { parent: this });

    this.service = new SprocketService(`${name}-sprocketservice`,
      {
        ...args,
        env: {
          ...args.env,
          DGRAPH_DATABASE_URL: this.dgraph.hostname.apply(h => `${h}:9080`)
        },
        secrets: [
          ...(args.secrets ?? []),
          {
            secretId: this.dgraphSecret.id,
            secretName: this.dgraphSecret.name,
            fileName: "/app/secret/dgraph-api-key.txt"
          }],
        // networks: [
        //   args.n8nNetworkId
        // ]
      },
      { parent: this });
  }

}
