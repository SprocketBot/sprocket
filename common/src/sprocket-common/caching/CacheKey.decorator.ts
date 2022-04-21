import {cacheKeyMetadatakey} from "./constants";

export const CacheKey: ParameterDecorator = (target: Object, name: string | Symbol, parameterIndex: number): void => {
    let existingKeys: number[] = [];
    if (Reflect.getMetadataKeys(target).includes(cacheKeyMetadatakey)) {
        existingKeys = Reflect.getMetadata(target, cacheKeyMetadatakey) as number[];
    }
    existingKeys.push(parameterIndex);
    Reflect.defineMetadata(cacheKeyMetadatakey, existingKeys, target);
};
