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
    cache: {
        get port(): number { return _config.get<number>("cache.port") },
        get host(): string { return _config.get<string>("cache.host") },
        get password(): string { return readFileSync("./secret/cache-password.txt").toString() },
    },
    redis: {
        get port(): number { return _config.get<number>("redis.port") },
        get host(): string { return _config.get<string>("redis.host") },
        get password(): string { return readFileSync("./secret/redis-password.txt").toString() },
        get prefix(): string { return _config.get<string>("redis.prefix") },
    },
};
