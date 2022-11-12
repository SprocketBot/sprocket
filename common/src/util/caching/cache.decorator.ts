import {Inject, SetMetadata} from "@nestjs/common";
import {nanoid} from "nanoid";

import {RedisService} from "../../redis";

export type CacheOptions = {y: string};

export const Cache: (co: CacheOptions) => MethodDecorator = (opts: CacheOptions) => {
    /* This is the unique key used by the cache */
    const cacheInstanceId = nanoid();
    const injectYourService = Inject(RedisService);

    return function <X extends object>(
        this: X,
        target: X,
        propertyKey: string | symbol,
        descriptor: PropertyDescriptor,
    ) {
        injectYourService(this, "____redis");
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        const redis: RedisService = this.____redis;

        const originalFunction = descriptor.value;
        const subject = descriptor.value.name;
        const cacheKeys: number[] = Reflect.getMetadata(`sprocketcommon-cachekey-${subject}`, target) ?? [];

        

        const v = redis.getIfExists(cacheInstanceId);

        return descriptor;
    };
};
