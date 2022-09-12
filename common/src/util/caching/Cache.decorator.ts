/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import {Logger} from "@nestjs/common";
import type {Redis} from "ioredis";
import IORedis from "ioredis";

import {config} from "../config";

function createKey(constructorName: string, propertyName: string, args: string[]) {
    return `${constructorName}.${propertyName}:${args.join("-")}`;
}

const logger = new Logger("Cache");

export interface CacheOptions {
    ttl: number;
    /**
     * Object that maps transformation functions to parameter names
     * Used to enable caching on objects / arrays
     */
    transformers?: Record<string, (a: any) => string>;
    verbose?: boolean;
}

let redisClient: Redis | undefined;
async function getRedisClient(): Promise<Redis> {
    if (!redisClient) {
        redisClient = new IORedis(config.cache.port, config.cache.host, {
            password: config.cache.password,
            db: 13,
            keyPrefix: "cache__",
            tls: config.cache.secure
                ? {
                        host: config.cache.host,
                        servername: config.cache.host,
                    }
                : {},
        });
    }
    return redisClient;
}

// eslint-disable-next-line arrow-body-style
export const Cache: (co: CacheOptions) => MethodDecorator = ({
    ttl, transformers, verbose,
}: CacheOptions = {ttl: 500}) => function(target: Object, propertyKey: string | symbol, descriptor: PropertyDescriptor) {
    const ratio = {
        total: 0, hits: 0, misses: 0, uniques: {} as Record<string, Set<string>>,
    };

    // Grab a reference to the original function so we can call it later
    const originalFunction = descriptor.value;
    // Get the cache keys from the constructor metadata
    const subject = descriptor.value.name;
    const cacheKeys: number[] = Reflect.getMetadata(`sprocketcommon-cachekey-${subject}`, target) ?? [];
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

    paramNames.forEach(pn => {
        ratio.uniques[pn.trim()] = new Set();
    });

    if (verbose) logger.verbose(`Caching has been attached to ${subject}. Keyed Params: ${JSON.stringify(cacheKeys.map(i => paramNames[i]))}`);

    descriptor.value = async function(...args: any[]) {
        const inUniques: boolean[] = [];

        const cacheValues: string[] = cacheKeys.map(keyIndex => {
            // Lookup the name of the key in question
            const keyName: string = paramNames[keyIndex].toString().trim();
            // Apply transformation function if it exists
            const set = ratio.uniques[keyName];

            // eslint-disable-next-line no-prototype-builtins,@typescript-eslint/no-unsafe-argument
            if (keyName && transformers?.hasOwnProperty(keyName)) {
                const v = transformers[keyName](args[keyIndex]).trim();
                inUniques[keyIndex] = set.has(v);

                set.add(v);
                return v;
            }
            // Otherwise, return direct to string or empty string.
            if (!args[keyIndex].toString) throw new Error("CacheKey value must have a transformer or toString function");
            const v: string = args[keyIndex].toString().trim();
            inUniques[keyIndex] = set.has(v);
            set.add(v);
            return v;
        });

        // Smash all the cache keys together and make one big redis key
        const key = createKey(target.constructor.name, propertyKey.toString(), cacheValues);
        // Grab redis (and connect if we haven't already)
        const r = await getRedisClient();
        // Check for a cached value
        const cachedValue = await r.get(key);

        if (cachedValue) {
            // Return a found cached value

            ratio.hits++;

            if (verbose) {
                logger.verbose(`
Subject: ${target.constructor.name}.${subject}
Key: ${key}
Status: Hit | ${inUniques.join(";")}
Stats: ${ratio.hits} Hits | ${ratio.misses} Misses
Unique Value Stats: ${Object.entries(ratio.uniques).map(([k, v]) => `${k}:${v.size}`)
        .join(";")} 
Cached Value: ${JSON.stringify(cachedValue)}
                  `);
            }

            return JSON.parse(cachedValue);
        }
        // Or run the function
        const v = await originalFunction.apply(this, args);
        // Cache the result
        await r.set(key, JSON.stringify(v), "px", ttl);
        ratio.misses++;

        if (verbose) {
            logger.verbose(`
Subject: ${target.constructor.name}.${subject}
Key: ${key}
Status: Miss | ${inUniques.join(";")}
Stats: ${ratio.hits} Hits | ${ratio.misses} Misses
Unique Value Stats: ${Object.entries(ratio.uniques).map(([k, set]) => `${k}:${set.size}`)
        .join(";")} 
Function Result: ${JSON.stringify(v)}
Re-Fetch: ${await r.get(key)}
TTL: ${ttl}
                  `);
        }

        // Return the result
        return v;
    };

    return descriptor;
};
