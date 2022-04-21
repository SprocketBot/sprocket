import {Injectable, Logger} from "@nestjs/common";
import * as minio from "minio";
import type {Readable} from "stream";

import {config} from "../../util/config";

@Injectable()
export class MinioService {
    private readonly logger = new Logger(MinioService.name);

    private readonly minio: minio.Client;

    constructor() {
        this.minio = new minio.Client({
            endPoint: config.minio.endPoint,
            accessKey: config.minio.accessKey,
            secretKey: config.minio.secretKey,
            useSSL: config.minio.useSSL,
            port: config.minio.port,
        });
    }

    /**
     * Upload an object to Minio.
     * @param bucket The bucket to upload the object to.
     * @param objectName The name to give the uploaded object.
     * @param object The data to upload.
     */
    async put(bucket: string, objectName: string, object: Buffer | string): Promise<void> {
        if (object.length === 0) {
            throw new Error(`Cannot upload empty object ${objectName}`);
        }

        this.logger.debug(`put bucket=${bucket} objectName=${objectName}`);
        await this.minio.putObject(bucket, objectName, object, {});
    }

    /**
     * Fetches an object from Minio.
     * @param bucket The bucket to fetch the object from.
     * @param objectName The name of the object to fetch.
     * @returns A readable stream containing the object's data.
     * @throws An error if the object does not exist.
     */
    async get(bucket: string, objectName: string): Promise<Readable> {
        this.logger.debug(`get bucket=${bucket} objectName=${objectName}`);
        return this.minio.getObject(bucket, objectName);
    }
}
