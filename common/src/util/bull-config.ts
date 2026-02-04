import type {BullModuleOptions} from "@nestjs/bull";

import {config} from "./config";

/**
 * Shared Bull (job queue) configuration for the monolith application.
 * Uses the Redis configuration from Core service with TLS support.
 *
 * This configuration should be used in BullModule.forRoot() only once
 * at the application root level (MonolithModule).
 */
export const getBullRootConfig = (): BullModuleOptions => ({
    redis: {
        host: config.redis.host,
        port: config.redis.port,
        password: config.redis.password,
        tls: config.redis.secure
            ? {
                    host: config.redis.host,
                    servername: config.redis.host,
                }
            : undefined,
        keyPrefix: `${config.redis.prefix}:bull`,
    },
    prefix: `${config.redis.prefix}:bull`,
});
