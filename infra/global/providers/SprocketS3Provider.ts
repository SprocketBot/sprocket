import * as aws from "@pulumi/aws";
import * as pulumi from "@pulumi/pulumi";

export interface SprocketS3ProviderArgs {
    s3Endpoint: pulumi.Output<string> | string,
    region?: string,
    accessKey: pulumi.Output<string> | string,
    secretKey: pulumi.Output<string> | string
}

export class SprocketS3Provider extends aws.Provider {
    constructor({ s3Endpoint, region = "us-east-1", accessKey, secretKey }: SprocketS3ProviderArgs, opts?: pulumi.ResourceOptions) {
        
        super("SprocketS3Provider", {
            accessKey: accessKey,
            secretKey: secretKey,
            region: region,
            skipCredentialsValidation: true,
            skipMetadataApiCheck: true,
            skipRequestingAccountId: true,
            endpoints: [{
                s3: pulumi.output(s3Endpoint).apply(endpoint => `https://${endpoint}`)
            }],
            s3UsePathStyle: false
        }, opts);
    }
}
