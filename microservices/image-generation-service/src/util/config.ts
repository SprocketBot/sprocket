import _config from "config";
import {readFileSync} from "fs";

export const config = {
    transport: {
        get url(): string { return _config.get<string>("transport.url") },
        get image_generation_queue(): string { return _config.get<string>("transport.image_generation_queue")}
    },
    logger: {
        get levels(): boolean | string { return _config.get<boolean | string>("logger.levels") },
    },
    minio: {
        get endPoint(): string { return _config.get<string>("minio.endPoint") },
        get accessKey(): string { return readFileSync("./secret/minio-access.txt").toString() },
        get secretKey(): string { return readFileSync("./secret/minio-secret.txt").toString() },
        bucketNames: {
            get image_generations(): string { return _config.get<string>("minio.bucketNames.image_generation") },
        },
    },
};
