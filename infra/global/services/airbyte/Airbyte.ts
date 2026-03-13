import * as pulumi from "@pulumi/pulumi"
import * as docker from "@pulumi/docker"
import DefaultLogDriver from '../../helpers/docker/DefaultLogDriver';
import {
  bootloaderEnv,
  cronEnv,
  dbEnv,
  initEnv,
  serverEnv,
  temporalEnv,
  webappEnv,
  workerEnv
} from './environments/init';
import { TraefikLabels } from '../../helpers/docker/TraefikLabels';
import { HOSTNAME } from '../../constants';


export interface AirbyteArgs {
  ingressNetworkId: string | pulumi.Output<string>
}

export class Airbyte extends pulumi.ComponentResource {
  network: docker.Network


  services: {
    init?: docker.Service,
    bootloader?: docker.Service,
    db?: docker.Service,
    worker?: docker.Service,
    server?: docker.Service,
    webapp?: docker.Service,
    temporal?: docker.Service,
    cron?: docker.Service,
  }

  volumes: {
    workspace?: docker.Volume,
    db?: docker.Volume,
  }

  constructor(name: string, args: AirbyteArgs, opts?: pulumi.ComponentResourceOptions) {
    super("SprocketBot:Services:Airbyte", name, {}, opts)

    this.services = {}
    this.volumes = {}

    this.network = new docker.Network(`${name}-net`, {
      driver: 'overlay'
    }, { parent: this })

    this.volumes.db = new docker.Volume(`${name}-db-vol`, {}, { parent: this })
    this.volumes.workspace = new docker.Volume(`${name}-workspace`, {
      name: "airbyte_workspace",
      driverOpts: {
        "size": "5G"
      }
    }, { parent: this })

    this.services.init = new docker.Service(`${name}-init`, {
      name: "airbyte-init",
      taskSpec: {
        containerSpec: {
          image: "airbyte/init:0.40.4",
          hostname: "init",
          commands: [
            "/bin/sh", "-c", "./scripts/create_mount_directories.sh /local_parent ${HACK_LOCAL_ROOT_PARENT} ${LOCAL_ROOT}"
          ],
          env: initEnv,
          mounts: [{
            type: "bind",
            source: initEnv.HACK_LOCAL_ROOT_PARENT,
            target: "/local_parent"
          }]
        },
        placement: {
          constraints: [
            "node.labels.role==airbyte",
          ]
        },
        logDriver: DefaultLogDriver(`${name}-init`, true),
        networksAdvanceds: [{ name: this.network.id }]
      }
    }, { parent: this })

    this.services.db = new docker.Service(`${name}-db`, {
      name: "airbyte-db",
      taskSpec: {
        containerSpec: {
          image: "airbyte/db:0.40.4",
          hostname: "airbyte-db",
          env: dbEnv,
          mounts: [{
            type: "volume",
            source: this.volumes.db.id,
            target: "/var/lib/postgresql/data"
          }]
        },
        placement: {
          constraints: [
            "node.labels.role==airbyte",
          ]
        },
        logDriver: DefaultLogDriver(`${name}-db`, true),
        networksAdvanceds: [{ name: this.network.id }]
      }
    }, { parent: this })

    this.services.worker = new docker.Service(`${name}-worker`, {
      name: "airbyte-worker",
      taskSpec: {
        containerSpec: {
          image: "airbyte/worker:0.40.4",
          hostname: "airbyte-worker",
          env: {
            ...workerEnv,
            "LOG_LEVEL": "WARN",
            "AIRBYTE_LOG_LEVEL": "WARN",
            "JOB_HISTORY_RETENTION_DAYS": "7",
            "WORKSPACE_RETENTION_DAYS": "3",
            "TEMPORAL_HISTORY_RETENTION_DAYS": "7"
          },
          mounts: [{
            type: "bind",
            source: "/var/run/docker.sock",
            target: "/var/run/docker.sock",
          }, {
            type: "volume",
            source: this.volumes.workspace.id,
            target: workerEnv.WORKSPACE_ROOT
          }, {
            type: "bind",
            source: workerEnv.LOCAL_ROOT,
            target: workerEnv.LOCAL_ROOT
          }]
        },
        placement: {
          constraints: [
            "node.labels.role==airbyte",
          ]
        },
        logDriver: DefaultLogDriver(`${name}-worker`, true),
        networksAdvanceds: [{ name: this.network.id }]
      }
    }, { parent: this })


    this.services.bootloader = new docker.Service(`${name}-bootloader`, {
      name: "airbyte-bootloader",
      taskSpec: {
        containerSpec: {
          image: "airbyte/bootloader:0.40.4",
          hostname: "airbyte-bootloader",
          env: bootloaderEnv
        },
        placement: {
          constraints: [
            "node.labels.role==airbyte",
          ]
        },
        logDriver: DefaultLogDriver(`${name}-bootloader`, true),
        networksAdvanceds: [{ name: this.network.id }]
      }
    }, { parent: this })
    this.services.cron = new docker.Service(`${name}-cron`, {
      name: "airbyte-cron",
      taskSpec: {
        containerSpec: {
          image: "airbyte/cron:0.40.4",
          hostname: "airbyte-cron",
          env: cronEnv,
          mounts: [{
            type: "volume",
            source: this.volumes.workspace.id,
            target: workerEnv.WORKSPACE_ROOT
          }]
        },
        placement: {
          constraints: [
            "node.labels.role==airbyte",
          ]
        },
        logDriver: DefaultLogDriver(`${name}-cron`, true),
        networksAdvanceds: [{ name: this.network.id }]
      }
    }, { parent: this })
    this.services.temporal = new docker.Service(`${name}-temporal`, {
      name: "airbyte-temporal",
      taskSpec: {
        containerSpec: {
          image: "airbyte/temporal:0.40.4",
          hostname: "airbyte-temporal",
          env: temporalEnv,
          mounts: [{
            type: "bind",
            source: "/opt/airbyte/temporal/dynamicconfig",
            target: "/etc/temporal/config/dynamicconfig"
          }]
        },
        placement: {
          constraints: [
            "node.labels.role==airbyte",
          ]
        },
        logDriver: DefaultLogDriver(`${name}-temporal`, true),
        networksAdvanceds: [{ name: this.network.id }]
      }
    }, { parent: this })
    this.services.webapp = new docker.Service(`${name}-webapp`, {
      name: "airbyte-webapp",
      labels: new TraefikLabels("airbyte")
        .tls("lets-encrypt-tls")
        .rule(`Host(\`airbyte.${HOSTNAME}\`)`)
        .forwardAuthRule("SprocketAdmin")
        .targetPort(80)
        .complete,
      taskSpec: {
        containerSpec: {
          image: "airbyte/webapp:0.40.4",
          hostname: "airbyte-webapp",
          env: webappEnv,
        },
        placement: {
          constraints: [
            "node.labels.role==airbyte",
          ]
        },
        logDriver: DefaultLogDriver(`${name}-webapp`, true),
        networksAdvanceds: [{ name: this.network.id }, { name: args.ingressNetworkId }]
      }
    }, { parent: this })

    this.services.server = new docker.Service(`${name}-server`, {
      name: "airbyte-server",
      labels: new TraefikLabels("airbyte-server")
        .tls("lets-encrypt-tls")
        .rule(`Host(\`api.airbyte.${HOSTNAME}\`)`)
        .forwardAuthRule("SprocketAdmin")
        .targetPort(8001)
        .complete,
      taskSpec: {
        containerSpec: {
          image: "airbyte/server:0.40.4",
          hostname: "airbyte-server",
          env: {
            ...serverEnv,
          },
          mounts: [{
            type: "volume",
            source: this.volumes.workspace.id,
            target: workerEnv.WORKSPACE_ROOT
          }]
        },
        placement: {
          constraints: [
            "node.labels.role==airbyte",
          ]
        },
        logDriver: DefaultLogDriver(`${name}-server`, true),
        networksAdvanceds: [{ name: this.network.id }, { name: args.ingressNetworkId }]
      }
    }, { parent: this })
  }
}
