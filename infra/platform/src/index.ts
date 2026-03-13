import * as pulumi from "@pulumi/pulumi"
import * as aws from "@pulumi/aws"

import { LayerOne, LayerOneExports, LayerTwo, LayerTwoExports } from "global/refs"
import { SprocketS3Provider } from "global/providers/SprocketS3Provider"


import { Platform } from "./Platform";

const s3Provider = new SprocketS3Provider({
    s3Endpoint: LayerTwo.stack.requireOutput(LayerTwoExports.MinioUrl) as pulumi.Output<string>,
    accessKey: LayerTwo.stack.requireOutput(LayerTwoExports.MinioAccessKey) as pulumi.Output<string>,
    secretKey: LayerTwo.stack.requireOutput(LayerTwoExports.MinioSecretKey) as pulumi.Output<string>
})

//const n8nNetworkId = LayerTwo.stack.requireOutput(LayerTwoExports.N8nNetwork) as pulumi.Output<string>

export const platform = new Platform(pulumi.getStack(), {
    //n8nNetworkId,
    postgresHostname: LayerTwo.stack.requireOutput(LayerTwoExports.PostgresHostname) as pulumi.Output<string>,
    postgresPort: LayerTwo.stack.requireOutput(LayerTwoExports.PostgresPort) as pulumi.Output<number>,
    redisHostname: LayerTwo.stack.requireOutput(LayerTwoExports.RedisHostname) as pulumi.Output<string>,
    redisPassword: LayerTwo.stack.requireOutput(LayerTwoExports.RedisPassword) as pulumi.Output<string>,

    s3Provider: s3Provider as aws.Provider,
    s3Endpoint: LayerTwo.stack.requireOutput(LayerTwoExports.MinioUrl) as pulumi.Output<string>,
    s3AccessKey: LayerTwo.stack.requireOutput(LayerTwoExports.MinioAccessKey) as pulumi.Output<string>,
    s3SecretKey: LayerTwo.stack.requireOutput(LayerTwoExports.MinioSecretKey) as pulumi.Output<string>,

    configRoot: `${__dirname}/config`,

    ingressNetworkId: LayerOne.stack.requireOutput(LayerOneExports.IngressNetwork) as pulumi.Output<string>,
    monitoringNetworkId: LayerTwo.stack.requireOutput(LayerTwoExports.MonitoringNetworkId) as pulumi.Output<string>,
})

export const redisPublicHostname = LayerTwo.stack.requireOutput(LayerTwoExports.RedisPublicHostname) as pulumi.Output<string>;
export const redisPublicPort = LayerTwo.stack.requireOutput(LayerTwoExports.RedisPublicPort) as pulumi.Output<number>;
export const redisPublicTls = LayerTwo.stack.requireOutput(LayerTwoExports.RedisPublicTls) as pulumi.Output<boolean>;
export const redisPassword = LayerTwo.stack.requireOutput(LayerTwoExports.RedisPassword) as pulumi.Output<string>;
export const redisPublicConnectionString = LayerTwo.stack.requireOutput(LayerTwoExports.RedisPublicConnectionString) as pulumi.Output<string>;
