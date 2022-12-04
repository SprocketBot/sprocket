import dotenv from "dotenv";
import path from "path";
// Ensure that we are loading from shared config, as well as application config
const configDirectories = [
    "./config",
    `${__dirname}/../../../shared_config`,
];
process.env.NODE_CONFIG_DIR = configDirectories.join(path.delimiter);

const workspaceEnv = `${__dirname}/../../../.env`;
dotenv.config({path: workspaceEnv});

import _config from "config";
import {existsSync, readFileSync} from "fs";

export const config = {
    auth: {
        google: {
            get clientId(): string {
                if (_config.has("auth.google.clientId")) return _config.get<string>("auth.google.clientId");
                return readFileSync("./secret/googleClientId.txt").toString();
            },
            get secret(): string {
                if (_config.has("auth.google.secret")) return _config.get<string>("auth.google.secret");
                return readFileSync("./secret/googleSecret.txt").toString();
            },
            get callbackUrl(): string {
                return _config.get<string>("auth.google.callbackUrl");
            },
        },
        discord: {
            get clientId(): string {
                if (_config.has("auth.discord.clientId")) return _config.get<string>("auth.discord.clientId");
                return readFileSync("./secret/discord-client.txt").toString();
            },
            get secret(): string {
                if (_config.has("auth.discord.secret")) return _config.get<string>("auth.discord.secret");
                return readFileSync("./secret/discord-secret.txt").toString();
            },
            get callbackURL(): string {
                return _config.get<string>("auth.discord.callbackUrl");
            },
        },
        get jwt_expiry(): string {
            return _config.get<string>("auth.jwt_expiry");
        },
        get jwt_secret(): string {
            if (_config.has("auth.jwt_secret")) return _config.get<string>("auth.jwt_secret");
            return readFileSync("./secret/jwtSecret.txt").toString()
                .trim();
        },
        get access_expiry(): string {
            return _config.get<string>("auth.access_expiry");
        },
        get refresh_expiry(): string {
            return _config.get<string>("auth.refresh_expiry");
        },
        get frontend_callback(): string {
            return _config.get<string>("auth.frontend_callback");
        },
    },
    bot: {
        get prefix(): string {
            return _config.get<string>("bot.prefix");
        },
        get token(): string {
            if (_config.has("bot.token")) return _config.get<string>("bot.token");
            return readFileSync("./secret/bot-token.txt").toString()
                .trim();
        },
    },
    cache: {
        get port(): number {
            if (_config.has("cache.port")) return _config.get<number>("cache.port");
            return _config.get<number>("redis.port");
        },
        get host(): string {
            if (_config.has("cache.host")) return _config.get<string>("cache.host");
            return _config.get<string>("redis.host");
        },
        get password(): string {
            if (_config.has("cache.password")) return _config.get<string>("cache.password");
            if (_config.has("redis.password")) return _config.get<string>("redis.password");

            if (existsSync("./secret/cache-password.txt")) {
                return readFileSync("./secret/cache-password.txt").toString()
                    .trim();
            }
            return readFileSync("./secret/redis-password.txt").toString()
                .trim();
        },
        get secure(): boolean {
            if (_config.has("cache.secure")) return _config.get<boolean>("cache.secure");
            return _config.get<boolean>("redis.secure");
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
        get password(): string {
            if (_config.has("db.password")) return _config.get<string>("db.password");
            return readFileSync("./secret/db-password.txt").toString()
                .trim();
        },
    },
    gql: {
        get url(): string { return _config.get<string>("gql.url") },
        get playground(): boolean { return _config.get<boolean>("gql.playground") },
    },
    influx: {
        get address(): string { return _config.get<string>("influx.address") },
        get org(): string { return _config.get<string>("influx.org") },
        get bucket(): string { return _config.get<string>("influx.bucket") },
        get token(): string {
            if (_config.has("influx.token")) return _config.get<string>("influx.token");
            return readFileSync("./secret/influx-token").toString()
                .trim();
        },
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
            if (_config.has("minio.accessKey")) return _config.get<string>("minio.accessKey");
            return readFileSync("./secret/minio-access.txt").toString()
                .trim();
        },
        get secretKey(): string {
            if (_config.has("minio.secretKey")) return _config.get<string>("minio.secretKey");
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
            if (_config.has("redis.password")) return _config.get<string>("redis.password");
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
            if (!process.env.APP_NAME) throw new Error("Cannot use app events; Environment var APP_NAME is not set");
            return `${_config.get<string>("transport.events_prefix")}_${process.env.APP_NAME}`;
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
        get api_root(): string {
            return _config.get<string>("web.api_root");
        },
    },
    get defaultOrganizationId(): number {
        return _config.get<number>("defaultOrganizationId");
    },
};
