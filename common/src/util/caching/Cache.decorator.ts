/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import type {Redis} from "ioredis";
import IORedis from "ioredis";

import {config} from "../config";
import {cacheKeyMetadatakey} from "./constants";

function createKey(constructorName: string, propertyName: string, args: string[]) {
    return `${constructorName}.${propertyName}:${args.join("-")}`;
}

export interface CacheOptions {
    ttl: number;
    /**
     * Object that maps transformation functions to parameter names
     * Used to enable caching on objects / arrays
     */
    transformers?: Record<string, (a: any) => string>;
}


let redisClient: Redis | undefined;
async function getRedisClient(): Promise<Redis> {
    if (!redisClient) {
        redisClient = new IORedis(config.cache.port, config.cache.host, {
            password: config.cache.password,
            db: 13,
        });
    }
    return redisClient;
}

// eslint-disable-next-line arrow-body-style
export const Cache: (co: CacheOptions) => MethodDecorator = ({ttl, transformers}: CacheOptions = {ttl: 500}) => {
    return (target: Object, propertyKey: string | symbol, descriptor: PropertyDescriptor) => {
        // Grab a reference to the original function so we can call it later
        const originalFunction = descriptor.value;
        // Get the cache keys from the constructor metadata
        const cacheKeys: number[] = Reflect.getMetadata(cacheKeyMetadatakey, target) ?? [];
        /*
         * Convert the function to a string (
         * i.e. myFunction(a,b,c,d) {
         *     console.log(a,b,c,d);
         * }
         *
         * Take the first line
         * i.e. myFunction(a,b,c,d) {
         *
         * Split it until we are left with only parameter names
         * i.e. a,b,c,d
         *
         * Split that, so we get an array of param names
         * i.e. ["a", "b", "c", "d" ]
         *
         * Use that to lookup based on paramter index (which is all that we can get from a parameter decorator)
         */
        const paramNames = descriptor.value.toString().split("\n")[0].split("(")[1].split(")")[0].split(",");

        descriptor.value = async (...args: any[]) => {
            const cacheValues: string[] = cacheKeys.map(keyIndex => {
                // Lookup the name of the key in question
                const keyName = paramNames[keyIndex].toString();
                // Apply transformation function if it exists
                // eslint-disable-next-line no-prototype-builtins,@typescript-eslint/no-unsafe-argument
                if (keyName && transformers?.hasOwnProperty(keyName)) return transformers[keyName](args[keyIndex]);
                // Otherwise, return direct to string or empty string.
                if (!args[keyIndex].toString) throw new Error("CacheKey value must have a transformer or toString function");
                return args[keyIndex].toString();
            });


            // Smash all the cache keys together and make one big redis key
            const key = createKey(target.constructor.name, propertyKey.toString(), cacheValues);
            // Grab redis (and connect if we haven't already)
            const r = await getRedisClient();
            // Check for a cached value
            const cachedValue = await r.get(key);
            if (cachedValue) {
                // Return a found cached value
                return JSON.parse(cachedValue);
            }
            // Or run the function
            const v = await originalFunction(...args);
            // Cache the result
            await r.set(key, JSON.stringify(v), "px", ttl);
            // Return the result
            return v;
        };

        return descriptor;
    };
};
