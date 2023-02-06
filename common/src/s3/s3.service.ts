import {
    GetObjectCommand,
    ListBucketsCommand,
    PutObjectCommand,
    S3Client,
} from "@aws-sdk/client-s3";
import {Injectable, Logger} from "@nestjs/common";

import {config} from "../util/config";

@Injectable()
export class S3Service {
    private readonly logger = new Logger(S3Service.name);

    private readonly s3: S3Client;

    constructor() {
        const {
            endpoint, accessKeyId, secretAccessKey,
        } = config.s3;

        this.s3 = new S3Client({
            endpoint: endpoint,
            credentials: {accessKeyId, secretAccessKey},
        });
    }

    /**
     * Upload an object to Minio.
     * @param bucket The bucket to upload the object to.
     * @param objectPath The name to give the uploaded object.
     * @param object The data to upload.
     */
    async put(
        bucket: string,
        objectPath: string,
        object: Buffer | string,
    ): Promise<void> {
        if (object.length === 0) {
            throw new Error(`Cannot upload empty object ${objectPath}`);
        }

        this.logger.debug(`put bucket=${bucket} objectPath=${objectPath}`);

        const putCommand = new PutObjectCommand({
            Bucket: bucket,
            Key: objectPath,
            Body: object,
        });
        await this.s3.send(putCommand);
    }

    /**
     * Fetches an object from Minio.
     * @param bucket The bucket to fetch the object from.
     * @param objectPath The name of the object to fetch.
     * @returns A readable stream containing the object's data.
     * @throws An error if the object does not exist.
     */
    async get(bucket: string, objectPath: string): Promise<string> {
        this.logger.debug(`get bucket=${bucket} objectPath=${objectPath}`);

        const getComment = new GetObjectCommand({
            Bucket: bucket,
            Key: objectPath,
        });
        const response = await this.s3.send(getComment);
        const contents = await response.Body?.transformToString();
        return contents ?? "";
    }

    async checkBuckets(): Promise<boolean> {
        const listBucketsCommand = new ListBucketsCommand({});
        const response = await this.s3.send(listBucketsCommand);
        const actualBuckets = response.Buckets?.map(b => b.Name) ?? [];
        const actualBucketsStr = actualBuckets.map(b => `'${b}'`).join(", ");

        const expectedBuckets = Object.values(config.s3.bucketNames);

        for (const bucket of expectedBuckets) {
            if (!actualBuckets.includes(bucket)) {
                this.logger.error(`S3 backend located at '${config.s3.endpoint}' is missing required bucket '${bucket}'. Found buckets ${actualBucketsStr}.`);
                return false;
            }
        }

        this.logger.debug("S3 backend has all required buckets");
        return true;
    }
}
