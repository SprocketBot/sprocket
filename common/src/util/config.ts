import dotenv from "dotenv";
import {existsSync, readFileSync} from "fs";
import path from "path";

// ======================== HELPERS ========================

const readSecretFile = (filepath: string): string => readFileSync(filepath).toString()
    .trim();

const MONOREPO_ROOT = `${__dirname}/../../..`;
const MONOREPO_CONFIG = `${MONOREPO_ROOT}/config`;
const MONOREPO_ENV = `${MONOREPO_ROOT}/.env`;
const MICROSERVICE_CONFIG = "./config";

// ======================== SETUP ==========================

// Ensure that we are loading from root config, as well as local microservice config
// This setup must happen before the "config" package is imported to have an effect
process.env.NODE_CONFIG_DIR = [MICROSERVICE_CONFIG, MONOREPO_CONFIG].join(path.delimiter);
dotenv.config({path: MONOREPO_ENV});
import _config from "config";

// ======================== CONFIG =========================

export const config = {
    auth: {
        google: {
            get clientId(): string {
                if (_config.has("auth.google.clientId")) {
                    return _config.get("auth.google.clientId");
                }
                return readSecretFile("./secret/googleClientId.txt");
            },
            get secret(): string {
                if (_config.has("auth.google.secret")) {
                    return _config.get("auth.google.secret");
                }
                return readSecretFile("./secret/googleSecret.txt");
            },
            get callbackUrl(): string {
                return _config.get("auth.google.callbackUrl");
            },
        },
        discord: {
            get clientId(): string {
                if (_config.has("auth.discord.clientId")) {
                    return _config.get("auth.discord.clientId");
                }
                return readSecretFile("./secret/discord-client.txt");
            },
            get secret(): string {
                if (_config.has("auth.discord.secret")) {
                    return _config.get("auth.discord.secret");
                }
                return readSecretFile("./secret/discord-secret.txt");
            },
            get callbackURL(): string {
                return _config.get("auth.discord.callbackUrl");
            },
        },
        get jwt_expiry(): string {
            return _config.get("auth.jwt_expiry");
        },
        get jwt_secret(): string {
            if (_config.has("auth.jwt_secret")) {
                return _config.get("auth.jwt_secret");
            }
            return readSecretFile("./secret/jwtSecret.txt");
        },
        get access_expiry(): string {
            return _config.get("auth.access_expiry");
        },
        get refresh_expiry(): string {
            return _config.get("auth.refresh_expiry");
        },
        get frontend_callback(): string {
            return _config.get("auth.frontend_callback");
        },
    },
    bot: {
        get prefix(): string {
            return _config.get("bot.prefix");
        },
        get token(): string {
            if (_config.has("bot.token")) {
                return _config.get("bot.token");
            }
            return readSecretFile("./secret/bot-token.txt");
        },
    },
    cache: {
        get port(): number {
            if (_config.has("cache.port")) {
                return _config.get("cache.port");
            }
            return _config.get("redis.port");
        },
        get host(): string {
            if (_config.has("cache.host")) {
                return _config.get("cache.host");
            }
            return _config.get("redis.host");
        },
        get password(): string {
            if (_config.has("cache.password")) {
                return _config.get("cache.password");
            }
            if (_config.has("redis.password")) {
                return _config.get("redis.password");
            }

            if (existsSync("./secret/cache-password.txt")) {
                return readSecretFile("./secret/cache-password.txt");
            }
            return readSecretFile("./secret/redis-password.txt");
        },
        get secure(): boolean {
            if (_config.has("cache.secure")) {
                return _config.get("cache.secure");
            }
            return _config.get("redis.secure");
        },
    },
    celery: {
        get broker(): string {
            return _config.get("transport.url");
        },
        get backend(): string {
            const host = config.redis.host;
            const port = config.redis.port;
            const pass = config.redis.password;
            return `redis${
                config.redis.secure ? "s" : ""
            }://:${pass}@${host}:${port}`;
        },
        get queue(): string {
            return _config.get("transport.celery-queue");
        },
    },
    db: {
        get host(): string {
            return _config.get("db.host");
        },
        get port(): number {
            return _config.get("db.port");
        },
        get username(): string {
            return _config.get("db.username");
        },
        get database(): string {
            return _config.get("db.database");
        },
        get enable_logs(): boolean {
            return _config.get("db.enable_logs");
        },
        get password(): string {
            if (_config.has("db.password")) {
                return _config.get("db.password");
            }
            return readSecretFile("./secret/db-password.txt");
        },
    },
    get defaultOrganizationId(): number {
        return _config.get("defaultOrganizationId");
    },
    gql: {
        get url(): string {
            return _config.get("gql.url");
        },
        get playground(): boolean {
            return _config.get("gql.playground");
        },
    },
    influx: {
        get address(): string {
            return _config.get("influx.address");
        },
        get org(): string {
            return _config.get("influx.org");
        },
        get bucket(): string {
            return _config.get("influx.bucket");
        },
        get token(): string {
            if (_config.has("influx.token")) {
                return _config.get("influx.token");
            }
            return readSecretFile("./secret/influx-token");
        },
    },
    logger: {
        get levels(): boolean | string {
            return _config.get("logger.levels");
        },
    },
    minio: {
        get endPoint(): string {
            return _config.get("minio.endPoint");
        },
        get accessKey(): string {
            if (_config.has("minio.accessKey")) {
                return _config.get("minio.accessKey");
            }
            return readSecretFile("./secret/minio-access.txt");
        },
        get secretKey(): string {
            if (_config.has("minio.secretKey")) {
                return _config.get("minio.secretKey");
            }
            return readSecretFile("./secret/minio-secret.txt");
        },
        bucketNames: {
            get replays(): string {
                return _config.get("minio.bucketNames.replays");
            },
            get image_generation(): string {
                return _config.get("minio.bucketNames.image_generation");
            },
        },
        get useSSL(): boolean {
            if (_config.has("minio.useSSL")) {
                return _config.get("minio.useSSL");
            }
            return false;
        },
        get port(): number {
            if (_config.has("minio.port")) {
                return _config.get("minio.port");
            }
            return 9000;
        },
    },
    redis: {
        get port(): number {
            return _config.get("redis.port");
        },
        get host(): string {
            return _config.get("redis.host");
        },
        get password(): string {
            if (_config.has("redis.password")) {
                return _config.get("redis.password");
            }
            return readSecretFile("./secret/redis-password.txt");
        },
        get prefix(): string {
            return _config.get("redis.prefix");
        },
        get secure(): boolean {
            if (_config.has("redis.secure")) {
                return _config.get("redis.secure");
            }
            return false;
        },
    },
    transport: {
        get url(): string {
            return _config.get("transport.url");
        },
        get core_queue(): string {
            return _config.get("transport.core_queue");
        },
        get bot_queue(): string {
            return _config.get("transport.bot_queue");
        },
        get analytics_queue(): string {
            return _config.get("transport.analytics_queue");
        },
        get matchmaking_queue(): string {
            return _config.get("transport.matchmaking_queue");
        },
        get notification_queue(): string {
            return _config.get("transport.notification_queue");
        },
        get events_queue(): string {
            return _config.get("transport.events_queue");
        },
        get events_application_key(): string {
            if (!process.env.APP_NAME) throw new Error("Cannot use app events; Environment var APP_NAME is not set");
            return `${_config.get("transport.events_prefix")}_${
                process.env.APP_NAME
            }`;
        },
        get image_generation_queue(): string {
            return _config.get("transport.image_generation_queue");
        },
        get submission_queue(): string {
            return _config.get("transport.submission_queue");
        },
    },
    web: {
        get url(): string {
            return _config.get("web.url");
        },
        get api_root(): string {
            return _config.get("web.api_root");
        },
    },
};
