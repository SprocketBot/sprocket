import {Injectable, Logger} from "@nestjs/common";
import type {Redis, RedisOptions} from "ioredis";
import IORedis from "ioredis";

import {config} from "../util/config";

@Injectable()
export class RedisService {
    private readonly logger: Logger = new Logger(RedisService.name);

    private _redis: Redis;

    get redis(): Redis {
        return this._redis;
    }

    get redisOptions(): RedisOptions {
        return {
            host: config.redis.host,
            port: config.redis.port,
            password: config.redis.password,
            lazyConnect: true,
            tls: config.redis.secure
                ? {
                        host: config.redis.host,
                        servername: config.redis.host,
                    }
                : undefined,
        };
    }

    async onApplicationBootstrap(): Promise<void> {
        const redis = new IORedis(this.redisOptions);
        this.logger.log(`Connecting to redis @ ${config.redis.host}`);
        await redis.connect();
        this.logger.log("Connected to redis");

        this._redis = redis;
    }

    async setJson<T extends Object>(key: string, input: T): Promise<void> {
        await this.redis.send_command("json.set", key, ".", JSON.stringify(input));
    }

    async setJsonField<T extends Object>(key: string, path: string, input: T): Promise<void> {
        await this.redis.send_command("json.set", key, path, JSON.stringify(input));
    }

    async getJson<T>(key: string, path?: string): Promise<T> {
        const args: string[] = [key];
        if (path) {
            args.push(path);
        }
        return JSON.parse(await this.redis.send_command("json.get", ...args) as string) as T;
    }

    async getString<T = string>(key: string): Promise<T | null> {
        const res = await this.redis.get(key);
        if (res === null) return null;
        return JSON.parse(res) as T;
    }

    async appendToJsonArray<T extends Object>(key: string, path: string, value: T): Promise<void> {
        await this.redis.send_command("json.arrappend", key, path, JSON.stringify(value));
    }

    async deleteJsonField(key: string, path: string): Promise<void> {
        await this.redis.send_command("json.del", key, path);
    }

    async delete(key: string): Promise<void> {
        await this.redis.send_command("json.del", key, "$");
    }

    async getKeys(pattern: string): Promise<string[]> {
        return this.redis.keys(pattern);
    }

    async keyExists(key: string): Promise<boolean> {
        const keys = await this.getKeys(key);
        if (keys.length > 1) throw new Error(`Found multiple keys matching ${key}: ${keys}`);
        return keys.length === 1;
    }
}
