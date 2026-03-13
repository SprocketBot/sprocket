import {SprocketStackDefinition} from "./types";


export enum LayerTwoExports {
    MonitoringNetworkId = "MonitoringNetworkId",
    PostgresHostname = "PostgresHostname",
    PostgresPort = "PostgresPort",
    PostgresNetworkId = "PostgresNetworkId",
    PostgresUrl = "PostgresUrl",

    InfrastructureVaultToken = "InfrastructureVaultToken",
    PlatformVaultToken = "PlatformVaultToken",
    InfluxDbToken = "InfluxDbToken",
    RedisHostname = "RedisHostname",
    RedisPassword = "RedisPassword",
    RedisPublicHostname = "RedisPublicHostname",
    RedisPublicPort = "RedisPublicPort",
    RedisPublicTls = "RedisPublicTls",
    RedisPublicConnectionString = "RedisPublicConnectionString",
    MinioHostname = "MinioHostname",
    MinioUrl = "MinioUrl",
    MinioAccessKey = "MinioAccessKey",
    MinioSecretKey = "MinioSecretKey",

    N8nNetwork = "N8nNetworkId"
}

export default new SprocketStackDefinition("layer_2", `${__dirname}/../../layer_2`);
