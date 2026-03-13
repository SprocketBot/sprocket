import { ServiceCredentials } from "../helpers/ServiceCredentials";
import * as minio from "@pulumi/minio";
import * as pulumi from "@pulumi/pulumi";
import { HOSTNAME } from "../constants";

export interface SprocketMinioProviderArgs extends Omit<minio.ProviderArgs, "minioAccessKey" | "minioSecretKey" | "minioServer" | "minioInsecure"> {
    minioCredentials?: ServiceCredentials,
    minioHostname: pulumi.Output<string> | string,
    useSsl?: boolean,
    accessKey?: pulumi.Output<string> | string,
    secretKey?: pulumi.Output<string> | string
}

export class SprocketMinioProvider extends minio.Provider {
    constructor({ minioCredentials, minioHostname, useSsl = true, accessKey, secretKey, ...args }: SprocketMinioProviderArgs, opts?: pulumi.ResourceOptions) {
        let username, password;

        if (accessKey && secretKey) {
            // Use provided credentials directly
            username = accessKey;
            password = secretKey;
        } else if (minioCredentials) {
            username = minioCredentials.username;
            password = minioCredentials.password;
        } else {
            throw new Error("Must provide either accessKey/secretKey or minioCredentials");
        }

        super("SprocketMinioProvider", {
            ...args,
            minioAccessKey: username,
            minioSecretKey: password,
            minioServer: minioHostname,
            minioSsl: useSsl
        }, opts);
    }
}
