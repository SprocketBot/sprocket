import * as pulumi from "@pulumi/pulumi"
import * as docker from "@pulumi/docker";
import * as postgres from "@pulumi/postgresql";

import { HOSTNAME } from "../../constants";
import { TraefikLabels } from "../../helpers/docker/TraefikLabels"
import DefaultLogDriver from "../../helpers/docker/DefaultLogDriver"
import { PostgresUser } from "../../helpers/datastore/PostgresUser"
import { ConfigFile } from "../../helpers/docker/ConfigFile"

const config = new pulumi.Config();

export interface GrafanaArgs {
    monitoringNetworkId: docker.Network["id"],
    ingressNetworkId: docker.Network["id"],
    additionalNetwokIds?: docker.Network["id"][],
    influxToken: pulumi.Output<string>,
    providers: {
        postgres: postgres.Provider
    }
}

export class Grafana extends pulumi.ComponentResource {
    private readonly dbUser: PostgresUser
    private readonly datasourcesConfig: ConfigFile

    private readonly db: postgres.Database
    private readonly service: docker.Service

    constructor(name: string, args: GrafanaArgs, opts?: pulumi.ComponentResourceOptions) {
        super("SprocketBot:Services:Grafana", name, {}, opts)

        this.dbUser = new PostgresUser(`${name}-db-user`, {
            username: "Grafana",
            providers: args.providers,
            importId: "Grafana"
        }, { parent: this })

        this.db = new postgres.Database(`${name}-db`, {
            name: name,
            owner: this.dbUser.username
        }, { parent: this, provider: args.providers.postgres, dependsOn: [this.dbUser], import: name })

        this.datasourcesConfig = new ConfigFile(`${name}-datasources`, {
            filepath: `${__dirname}/config/datasources.yaml`
        }, { parent: this })

        this.service = new docker.Service(`${name}-service`, {
            labels: new TraefikLabels(name)
                .rule(`Host(\`grafana.${HOSTNAME}\`)`)
                .tls("lets-encrypt-tls")
                .targetPort(3000)
                .complete,
            taskSpec: {
                placement: {
                    constraints: [
                        "node.labels.role!=ingress"
                    ]
                },
                containerSpec: {
                    image: "grafana/grafana:main",
                    env: pulumi.output(args.influxToken).apply((influxToken) => ({
                        GF_SERVER_ROOT_URL: `https://grafana.${HOSTNAME}`,
                        GF_DATABASE_TYPE: "postgres",
                        GF_DATABASE_HOST: `${config.require('postgres-host')}:${config.require('postgres-port')}`,
                        GF_DATABASE_NAME: this.db.name,
                        GF_DATABASE_USER: config.require('postgres-username'),
                        GF_DATABASE_PASSWORD: config.requireSecret('postgres-password'),
                        GF_DATABASE_SSL_MODE: "require",
                        GF_SMTP_ENABLED: "true",
                        GF_SMTP_HOST: "smtp.sendgrid.net:465",
                        GF_FROM_ADDRESS: "noreply@sprocket.gg",
                        GF_FROM_NAME: "Sprocket Noreply",
                        GF_SMTP_PASSWORD: "nopassword",
                        GF_SMTP_USER: "nobody",
                        GF_INSTALL_PLUGINS: "grafana-github-datasource,ryantxu-annolist-panel,neocat-cal-heatmap-panel,grafana-polystat-panel,fifemon-graphql-datasource,redis-datasource,marcusolsson-treemap-panel,digiapulssi-breadcrumb-panel",
                        INFLUX_TOKEN: influxToken
                    })),
                    configs: [{
                        configId: this.datasourcesConfig.id,
                        configName: this.datasourcesConfig.name,
                        fileName: "/etc/grafana/provisioning/datasources/datasources.yaml"
                    }]
                },
                logDriver: DefaultLogDriver(name, true),
                networksAdvanceds: [
                    { name: args.monitoringNetworkId },
                    { name: args.ingressNetworkId },
                    ...(args.additionalNetwokIds ?? []).map(id => ({ name: id }))
                ]
            }
        }, { parent: this })
    }
}
