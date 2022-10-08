import {Logger} from "@nestjs/common";

const logger = new Logger("CacheKey");

// eslint-disable-next-line @typescript-eslint/ban-types
export function CacheKey(target: Object, name: string | symbol, parameterIndex: number): void {
    let existingKeys: number[] = [];
    try {
        if (Reflect.getMetadataKeys(target).includes(`sprocketcommon-cachekey-${String(name)}`)) {
            existingKeys = Reflect.getMetadata(`sprocketcommon-cachekey-${String(name)}`, target) as number[];
        }
        existingKeys.push(parameterIndex);
        Reflect.defineMetadata(`sprocketcommon-cachekey-${String(name)}`, existingKeys, target);
    } catch (e) {
        logger.error("Failed to create CacheKey", e);
        throw e;
    }

}
