import {Injectable, Logger} from "@nestjs/common";
import * as minio from "minio";
import type {Readable} from "stream";

import {config} from "../util/config";

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
   * @param objectPath The name to give the uploaded object.
   * @param object The data to upload.
   */
    async put(bucket: string, objectPath: string, object: Buffer | string): Promise<void> {
        if (object.length === 0) {
            throw new Error(`Cannot upload empty object ${objectPath}`);
        }

        this.logger.debug(`put bucket=${bucket} objectPath=${objectPath}`);
        await this.minio.putObject(bucket, objectPath, object, {});
    }

    /**
   * Fetches an object from Minio.
   * @param bucket The bucket to fetch the object from.
   * @param objectPath The name of the object to fetch.
   * @returns A readable stream containing the object's data.
   * @throws An error if the object does not exist.
   */
    async get(bucket: string, objectPath: string): Promise<Readable> {
        this.logger.debug(`get bucket=${bucket} objectPath=${objectPath}`);
        return this.minio.getObject(bucket, objectPath);
    }
}
