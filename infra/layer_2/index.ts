import * as src from "./src";
import { LayerTwoExports } from "global/refs"
import * as pulumi from "@pulumi/pulumi";

const config = new pulumi.Config();

module.exports = {
    [LayerTwoExports.MonitoringNetworkId]: src.monitoring.network.id,
    [LayerTwoExports.PostgresHostname]: src.pg.hostname,
    [LayerTwoExports.PostgresPort]: src.pg.port,
    [LayerTwoExports.PostgresNetworkId]: src.pg.networkId,
    [LayerTwoExports.PostgresUrl]: src.pg.url,
    [LayerTwoExports.InfluxDbToken]: src.monitoring.influx.credentials.password,
    [LayerTwoExports.RedisHostname]: src.sharedRedis.hostname,
    [LayerTwoExports.RedisPassword]: src.sharedRedis.credentials.password,
    [LayerTwoExports.RedisPublicHostname]: src.redisPublicHostname,
    [LayerTwoExports.RedisPublicPort]: 6379,
    [LayerTwoExports.RedisPublicTls]: true,
    [LayerTwoExports.RedisPublicConnectionString]: pulumi.secret(
        pulumi.interpolate`rediss://:${src.sharedRedis.credentials.password}@${src.redisPublicHostname}:6379`
    ),
    [LayerTwoExports.MinioHostname]: config.require('s3-endpoint'),
    [LayerTwoExports.MinioUrl]: config.require('s3-endpoint'),
    [LayerTwoExports.MinioAccessKey]: config.requireSecret('s3-access-key'),
    [LayerTwoExports.MinioSecretKey]: config.requireSecret('s3-secret-key'),
    // [LayerTwoExports.N8nNetwork]: src.n8n.network.id
}
