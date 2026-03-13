import * as docker from "@pulumi/docker";
import * as pulumi from "@pulumi/pulumi";

import { Influx, Loki, Grafana, GrafanaArgs, Fluentd, Telegraf } from "global/services";

export type MonitoringArgs = {
    exposeInfluxUi: boolean,
    ingressNetworkId: docker.Network["id"],
    providers: GrafanaArgs["providers"]
}

export class Monitoring extends pulumi.ComponentResource {
    // Datastores
    readonly influx: Influx;
    readonly loki: Loki;

    // Applications
    readonly grafana: Grafana
    readonly fluent: Fluentd;
    readonly telegraf_replicated: Telegraf

    readonly network: docker.Network;

    constructor(name: string, { exposeInfluxUi, ingressNetworkId, providers }: MonitoringArgs, opts?: pulumi.ComponentResourceOptions) {
        super("SprocketBot:Monitoring", name, {}, opts)

        this.network = new docker.Network(`${name}-network-v2`, { driver: "overlay" }, { parent: this })

        this.influx = new Influx("influx", {
            monitoringNetworkId: this.network.id,
            exposeUi: exposeInfluxUi,
            ingressNetworkId: ingressNetworkId,
        }, { parent: this })

        this.loki = new Loki("loki", {
            monitoringNetworkId: this.network.id
        }, { parent: this })

        this.grafana = new Grafana("grafana", {
            monitoringNetworkId: this.network.id,
            ingressNetworkId: ingressNetworkId,
            influxToken: this.influx.credentials.password,
            providers
        }, { parent: this })

        this.fluent = new Fluentd("fluent", {
            monitoringNetworkId: this.network.id,
            configFilePath: `${__dirname}/config/fluentd.conf`
        }, { parent: this })

        this.telegraf_replicated = new Telegraf("replicated-telegraf", {
            additionalNetworkIds: [
                //postgres.networkId,
            ],
            configFilePath: `${__dirname}/config/telegraf.conf`,
            monitoringNetworkId: this.network.id,
            additionalEnvironmentVariables: {},
            providers,
            influxToken: this.influx.credentials.password
        }, { parent: this })
    }
}
