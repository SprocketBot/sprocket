import * as pulumi from "@pulumi/pulumi"
import * as minio from "@pulumi/minio"
import * as handlebars from "handlebars";
import { readFileSync } from "fs";


export interface PlatformMinioArgs {
    minioProvider: minio.Provider
    environment: string
}

export class PlatformMinio extends pulumi.ComponentResource {
    readonly bucket: minio.S3Bucket
    readonly imageGenBucket: minio.S3Bucket
    readonly replayBucket: minio.S3Bucket

    readonly minioUser: minio.IamUser

    readonly policy: minio.IamPolicy
    readonly attachment: minio.IamUserPolicyAttachment

    readonly minioUrl: string | pulumi.Output<string>

    constructor(name: string, args: PlatformMinioArgs, opts?: pulumi.ComponentResourceOptions) {
        super("SprocketBot:Platform:Minio", name, {}, opts)


        this.bucket = new minio.S3Bucket(`${name}-bucket`, {
            bucket: `sprocket-${args.environment}`
        }, { parent: this, provider: args.minioProvider })

        this.imageGenBucket = new minio.S3Bucket(`${name}-ig-bucket`, {
            bucket: `sprocket-image-gen-${args.environment}`
        }, { parent: this, provider: args.minioProvider })

        this.replayBucket = new minio.S3Bucket(`${name}-replay-bucket`, {
            bucket: `sprocket-replays-${args.environment}`
        }, { parent: this, provider: args.minioProvider })


        this.minioUser = new minio.IamUser(`${name}-s3-user`, {
            name: `sprocket-${args.environment}-s3-user`
        }, {
            parent: this,
            provider: args.minioProvider,
            dependsOn: [this.bucket, this.imageGenBucket, this.replayBucket]
        })

        const userPolicyContent = readFileSync(`${__dirname}/config/minio/UserPolicy.json`).toString()
        const userPolicyTemplate = handlebars.compile(userPolicyContent.toString(), { noEscape: true })

        const userPolicySectionContent = readFileSync(`${__dirname}/config/minio/BucketSection.json`).toString()
        const userPolicySectionTemplate = handlebars.compile(userPolicySectionContent.toString())


        this.policy = new minio.IamPolicy(`${name}-s3-policy`, {
            policy:
                pulumi.all([
                    this.bucket.bucket,
                    this.imageGenBucket.bucket,
                    this.replayBucket.bucket
                ]).apply(bucketNames =>
                    userPolicyTemplate({
                        content: bucketNames.map(b => userPolicySectionTemplate({ bucket: b })).join(",")
                    })
                )
        }, { parent: this, provider: args.minioProvider })

        this.attachment = new minio.IamUserPolicyAttachment(`${name}-s3-policy-application`, {
            policyName: this.policy.name, userName: this.minioUser.name
        }, { parent: this, provider: args.minioProvider })


        // this.imageGenPolicy = new minio.IamPolicy(`${name}-s3-ig-policy`, {
        //     policy: this.imageGenBucket.bucket.apply(b => userPolicyTemplate({ bucket: b }))
        // }, { parent: this, provider: args.minioProvider})
        //
        // new minio.IamUserPolicyAttachment(`${name}-s3-ig-policy-application`, {
        //     policyName: this.imageGenPolicy.name, userName: this.minioUser.name
        // }, { parent: this, provider: args.minioProvider})
        //
        // this.replayPolicy = new minio.IamPolicy(`${name}-s3-replay-policy`, {
        //     policy: this.replayBucket.bucket.apply(b => userPolicyTemplate({ bucket: b }))
        // }, { parent: this, provider: args.minioProvider })
        // new minio.IamUserPolicyAttachment((`${name}-s3-replay-policy-application`), {
        //     policyName: this.replayPolicy.name, userName: this.minioUser.name,
        // }, { parent: this, provider: args.minioProvider })

        this.minioUrl = args.minioProvider.minioServer

    }
}
