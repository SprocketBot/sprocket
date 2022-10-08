import {Logger} from "@nestjs/common";

const logger = new Logger("CacheKey");

export function CacheKey(target: Object, name: string | symbol, parameterIndex: number): void {
    let existingKeys: number[] = [];
    try {
        if (Reflect.getMetadataKeys(target).includes(`sprocketcommon-cachekey-${name}`)) {
            existingKeys = Reflect.getMetadata(`sprocketcommon-cachekey-${name}`, target) as number[];
        }
        existingKeys.push(parameterIndex);
        Reflect.defineMetadata(`sprocketcommon-cachekey-${name}`, existingKeys, target);
    } catch (e) {
        logger.error("Failed to create CacheKey", e);
        throw e;
    }

}
