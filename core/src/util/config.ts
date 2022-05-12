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
        },
    },
    gql: {
        get url(): string { return _config.get<string>("gql.url") },
        get playground(): boolean { return _config.get<boolean>("gql.playground") },
    },
    cache: {
        get port(): number { return _config.get<number>("cache.port") },
        get host(): string { return _config.get<string>("cache.host") },
        get password(): string { return _config.get<string>("cache.password") },
    },
    auth: {
        google: {
            get clientId(): string { return readFileSync("./secret/googleClientId.txt").toString() },
            get secret(): string { return readFileSync("./secret/googleSecret.txt").toString() },
            get callbackUrl(): string { return _config.get<string>("auth.googleCallbackURL") },
        },
        discord: {
            get clientId(): string { return readFileSync("./secret/discord-client.txt").toString() },
            get secret(): string { return readFileSync("./secret/discord-secret.txt").toString() },
            get callbackURL(): string { return _config.get<string>("auth.discordCallbackURL") },
        },
        get jwt_expiry(): string { return _config.get<string>("auth.jwt_expiry") },
        get frontend_callback(): string { return _config.get<string>("auth.frontend_callback") },
    },
    redis: {
        get port(): string { return _config.get<string>("redis.port") },
        get host(): string { return _config.get<string>("redis.host") },
        get prefix(): string { return _config.get<string>("redis.prefix") },
    },
};
