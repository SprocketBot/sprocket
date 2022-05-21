import _config from "config";
import {readFileSync} from "fs";

export const config = {
    transport: {
        get url(): string { return _config.get<string>("transport.url") },
        get core_queue(): string { return _config.get<string>("transport.core_queue") },
        get bot_queue(): string { return _config.get<string>("transport.bot_queue") },
        get analytics_queue(): string { return _config.get<string>("transport.analytics_queue") },
        get matchmaking_queue(): string { return _config.get<string>("transport.matchmaking_queue") },
        get events_queue(): string { return  _config.get<string>("transport.events_queue") },
        get events_application_key(): string { return _config.get<string>("transport.events_application_key") },
        get image_generation_queue(): string { return _config.get<string>("transport.image_generation_queue") },
    },
    logger: {
        get levels(): boolean | string { return _config.get<boolean | string>("logger.levels") },
    },
    db: {
        get host(): string { return _config.get<string>("db.host") },
        get port(): number { return _config.get<number>("db.port") },
        get username(): string { return _config.get<string>("db.username") },
        get database(): string { return _config.get<string>("db.database") },
        get enable_logs(): boolean { return _config.get<boolean>("db.enable_logs") },
    },
    minio: {
        get endPoint(): string { return _config.get<string>("minio.endPoint") },
        get accessKey(): string { return readFileSync("./secret/minio-access.txt").toString() },
        get secretKey(): string { return readFileSync("./secret/minio-secret.txt").toString() },
        bucketNames: {
            get replays(): string { return _config.get<string>("minio.bucketNames.replays") },
            get image_generation(): string { return _config.get<string>("minio.bucketNames.image_generation") },
        },
        get useSSL(): boolean {
            if (_config.has("minio.useSSL")) {
                return _config.get<boolean>("minio.useSSL");
            }
            return false;
        },
        get port(): number {
            if (_config.has("minio.port")) {
                return _config.get<number>("minio.port");
            }
            return 9000;
        },
    },
    celery: {
        get broker(): string { return _config.get<string>("celery.broker") },
        get backend(): string { return _config.get<string>("celery.backend") },
        get queue(): string { return _config.get<string>("celery.queue") },
    },
    redis: {
        get port(): number { return _config.get<number>("redis.port") },
        get host(): string { return _config.get<string>("redis.host") },
        get password(): string { return readFileSync("./secret/redis-password.txt").toString() },
        get prefix(): string { return _config.get<string>("redis.prefix") },
        get secure(): boolean {
            if (_config.has("redis.secure")) return _config.get<boolean>("redis.secure");
            return false;
        },
    },
    gql: {
        get url(): string { return _config.get<string>("gql.url") },
    },
    cache: {
        get port(): number { return _config.get<number>("cache.port") },
        get host(): string { return _config.get<string>("cache.host") },
        get password(): string { return _config.get<string>("cache.password") },
    },
};
