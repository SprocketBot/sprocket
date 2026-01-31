/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * @deprecated In memoriam.
 */

/**
 * A union type containing Typescript primitive types.
 */
export type Primitive = string | Function | number | boolean | Symbol | undefined | null;

/**
 * A union type containing the required properties in a given type T.
 */
type RequiredKeys<T> = {
    [K in keyof T]-?: undefined extends T[K] ? never : K;
}[keyof T];

/**
 * A union type containing the optional properties (marked with a ?) in a given type T.
 */
type OptionalKeys<T> = {
    [K in keyof T]-?: undefined extends T[K] ? K : never;
}[keyof T];

/**
 * A type where a union type of required keys (KeysToOmit) are omitted from a type T. If a key in KeysToOmit is optional in type T, it will not be omitted.
 */
type DeepOmitRequired<T, KeysToOmit> = T extends Primitive
    ? T
    : {
            [P in Exclude<RequiredKeys<T>, KeysToOmit>]: T[P] extends infer TP
                ? TP extends Primitive
                    ? TP
                    : TP extends any[]
                        ? DeepOmitArray<TP, KeysToOmit>
                        : DeepOmit<TP, KeysToOmit>
                : never;
        };

/**
 * A type where a union type of optional keys (KeysToOmit) are omitted from a type T. If a key in KeysToOmit is required in type T, it will not be omitted.
 */
type DeepOmitOptional<T, KeysToOmit> = T extends Primitive
    ? T
    : {
            [P in Exclude<OptionalKeys<T>, KeysToOmit>]?: T[P] extends infer TP
                ? TP extends Primitive
                    ? TP
                    : TP extends any[]
                        ? DeepOmitArray<TP, KeysToOmit>
                        : DeepOmit<TP, KeysToOmit>
                : never;
        };

/**
 * Recursively re-types each array element with DeepOmit.
 */
type DeepOmitArray<T extends any[], K> = {
    [P in keyof T]: DeepOmit<T[P], K>;
};

/**
 * Omits a union type of keys KeysToOmit from a type T, recursing down nested objects and arrays.
 * @example
 * interface Class1 {
 *     optional1?: number;
 *     optional2?: number;
 *     required1: number;
 *     required2: number;
 *     other?: Class2;
 * }
 *
 * interface Class2 {
 *     optional1?: number;
 *     optional2?: number;
 *     required1: number;
 *     required2: number;
 * }
 *
 * type MyType = DeepOmit<Class1, "required1" | "optional1">;
 * //          = {
 * //              optional2?: number;
 * //              required2: number;
 * //              other: {
 * //                  optional2?: number;
 * //                  required2: number;
 * //              }
 * //          }
 */
export type DeepOmit<T, KeysToOmit> = Prettify<
DeepOmitRequired<T, KeysToOmit> & DeepOmitOptional<T, KeysToOmit>
>;

/**
 * Forces the compiler to recursively enumerate the types of an object to allow for simpler debugging.
 */
export type Prettify<T> = T extends infer U ? { [K in keyof U]: Prettify<U[K]>} : never;
