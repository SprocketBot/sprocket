import * as pulumi from "@pulumi/pulumi"
import * as aws from "@pulumi/aws"

export interface PlatformS3Args {
    s3Provider: aws.Provider
    s3Endpoint: pulumi.Output<string> | string
    accessKey: pulumi.Output<string>
    secretKey: pulumi.Output<string>
    environment: string
}

export class PlatformS3 extends pulumi.ComponentResource {
    readonly bucket: aws.s3.Bucket
    readonly imageGenBucket: aws.s3.Bucket
    readonly replayBucket: aws.s3.Bucket

    readonly s3AccessKey: { id: pulumi.Output<string>, secret: pulumi.Output<string> }

    readonly s3Url: string | pulumi.Output<string>

    constructor(name: string, args: PlatformS3Args, opts?: pulumi.ComponentResourceOptions) {
        super("SprocketBot:Platform:S3", name, {}, opts)

        // Create buckets (S3 API is supported by DO Spaces)
        this.bucket = new aws.s3.Bucket(`${name}-bucket`, {
            bucket: `sprocket-${args.environment}-1`
        }, { parent: this, provider: args.s3Provider })

        new aws.s3.BucketAcl(`${name}-bucket-acl`, {
            bucket: this.bucket.id,
            acl: "private"
        }, { parent: this, provider: args.s3Provider })

        this.imageGenBucket = new aws.s3.Bucket(`${name}-ig-bucket`, {
            bucket: `sprocket-image-gen-${args.environment}-1`
        }, { parent: this, provider: args.s3Provider })

        new aws.s3.BucketAcl(`${name}-ig-bucket-acl`, {
            bucket: this.imageGenBucket.id,
            acl: "private"
        }, { parent: this, provider: args.s3Provider })

        this.replayBucket = new aws.s3.Bucket(`${name}-replay-bucket`, {
            bucket: `sprocket-replays-${args.environment}-1`
        }, { parent: this, provider: args.s3Provider })

        new aws.s3.BucketAcl(`${name}-replay-bucket-acl`, {
            bucket: this.replayBucket.id,
            acl: "private"
        }, { parent: this, provider: args.s3Provider })

        // Use the root credentials for S3 access
        this.s3AccessKey = {
            id: args.accessKey,
            secret: args.secretKey
        }

        // Use the provided endpoint
        this.s3Url = args.s3Endpoint
    }
}
