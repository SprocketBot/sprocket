import _config from "config";
import {readFileSync} from "fs";

export const config = {
    auth: {
        google: {
            get clientId(): string {
                return readFileSync("./secret/googleClientId.txt").toString();
            },
            get secret(): string {
                return readFileSync("./secret/googleSecret.txt").toString();
            },
            get callbackUrl(): string {
                return _config.get<string>("auth.google.callbackUrl");
            },
        },
        discord: {
            get clientId(): string {
                return readFileSync("./secret/discord-client.txt").toString();
            },
            get secret(): string {
                return readFileSync("./secret/discord-secret.txt").toString();
            },
            get callbackURL(): string {
                return _config.get<string>("auth.discord.callbackUrl");
            },
        },
        get jwt_expiry(): string {
            return _config.get<string>("auth.jwt_expiry");
        },
        get frontend_callback(): string {
            return _config.get<string>("auth.frontend_callback");
        },
    },
    bot: {
        get prefix(): string {
            return _config.get<string>("bot.prefix");
        },
    },
    cache: {
        get port(): number {
            return _config.get<number>("cache.port");
        },
        get host(): string {
            return _config.get<string>("cache.host");
        },
        get password(): string {
            return _config.get<string>("cache.password");
        },
    },
    celery: {
        get broker(): string {
            return _config.get<string>("transport.url");
        },
        get backend(): string {
            const host = config.redis.host;
            const port = config.redis.port;
            const pass = config.redis.password;
            return `redis${config.redis.secure ? "s" : ""}://:${pass}@${host}:${port}`;
        },
        get queue(): string {
            return _config.get<string>("transport.celery-queue");
        },
    },
    db: {
        get host(): string {
            return _config.get<string>("db.host");
        },
        get port(): number {
            return _config.get<number>("db.port");
        },
        get username(): string {
            return _config.get<string>("db.username");
        },
        get database(): string {
            return _config.get<string>("db.database");
        },
        get enable_logs(): boolean {
            return _config.get<boolean>("db.enable_logs");
        },
    },
    gql: {
        get url(): string { return _config.get<string>("gql.url") },
        get playground(): boolean { return _config.get<boolean>("gql.playground") },
    },
    logger: {
        get levels(): boolean | string {
            return _config.get<boolean | string>("logger.levels");
        },
    },
    minio: {
        get endPoint(): string {
            return _config.get<string>("minio.endPoint");
        },
        get accessKey(): string {
            return readFileSync("./secret/minio-access.txt").toString()
                .trim();
        },
        get secretKey(): string {
            return readFileSync("./secret/minio-secret.txt").toString()
                .trim();
        },
        bucketNames: {
            get replays(): string {
                return _config.get<string>("minio.bucketNames.replays");
            },
            get image_generation(): string {
                return _config.get<string>("minio.bucketNames.image_generation");
            },
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
    redis: {
        get port(): number {
            return _config.get<number>("redis.port");
        },
        get host(): string {
            return _config.get<string>("redis.host");
        },
        get password(): string {
            return readFileSync("./secret/redis-password.txt").toString()
                .trim();
        },
        get prefix(): string {
            return _config.get<string>("redis.prefix");
        },
        get secure(): boolean {
            if (_config.has("redis.secure")) return _config.get<boolean>("redis.secure");
            return false;
        },
    },
    transport: {
        get url(): string {
            return _config.get<string>("transport.url");
        },
        get core_queue(): string {
            return _config.get<string>("transport.core_queue");
        },
        get bot_queue(): string {
            return _config.get<string>("transport.bot_queue");
        },
        get analytics_queue(): string {
            return _config.get<string>("transport.analytics_queue");
        },
        get matchmaking_queue(): string {
            return _config.get<string>("transport.matchmaking_queue");
        },
        get notification_queue(): string {
            return _config.get<string>("transport.notification_queue");
        },
        get events_queue(): string {
            return _config.get<string>("transport.events_queue");
        },
        get events_application_key(): string {
            return _config.get<string>("transport.events_application_key");
        },
        get image_generation_queue(): string {
            return _config.get<string>("transport.image_generation_queue");
        },
        get submission_queue(): string {
            return _config.get<string>("transport.submission_queue");
        },
    },
    web: {
        get url(): string {
            return _config.get<string>("web.url");
        },
    },
};
