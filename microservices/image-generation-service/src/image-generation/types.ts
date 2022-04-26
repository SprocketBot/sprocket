import * as zod from "zod";
const operationTypes = zod.enum(["text", "fill", "stroke", "image"]);

const hAlignOptions = zod.enum(["left", "center", "right"]);
const vAlignOptions = zod.enum(["top", "center", "bottom"]);

const textTransformationOptions = zod.object({
    "h-align": hAlignOptions,
    "v-align": vAlignOptions,
});

export type HAlignOption = zod.infer<typeof hAlignOptions>;
export type VAlignOption = zod.infer<typeof vAlignOptions>;
export type TextTransformationOptions = zod.infer<typeof textTransformationOptions>;

const rescaleOnOptions = zod.enum(["height", "width"]);
const imageTransformationOptions = zod.object({
    rescaleOn: zod.enum(["height", "width"]),
});

export type RescaleOnOptions = zod.infer<typeof rescaleOnOptions>;
export type ImageTransformationsOptions = zod.infer<typeof imageTransformationOptions>;

export const operationSchema = zod.object({
    value: zod.union([zod.string(), zod.number()]),
    type: operationTypes,
});


export const dimensionSchema = zod.object({
    height: zod.number(),
    width: zod.number(),
});

export type Operation = zod.infer<typeof operationSchema>;
export type Dimension = zod.infer<typeof dimensionSchema>;


/**
 * Recursive type that describes a Tree with Operation Leafs
 */
// eslint-disable-next-line
export interface InputDatum extends Record<string | number, InputDatum | Operation | InputDatum[]> { }

// @ts-expect-error Types are hard, but we can safely consider array indexes as keys for the sake of this program
export const inputDataSchema: zod.ZodSchema<InputDatum> = zod.lazy(() => zod.union([
    zod.array(zod.union([operationSchema, inputDataSchema])),
    zod.record(zod.union([operationSchema, inputDataSchema])),
]));

export const sprocketDataSchema = zod.array(zod.union([
    zod.object({
        varPath: zod.string(),
        type: zod.literal("text"),
        options: textTransformationOptions,
    }),
    zod.object({
        varPath: zod.string(),
        type: zod.literal("fill"),
        options: zod.object({}),
    }),
    zod.object({
        varPath: zod.string(),
        type: zod.literal("stroke"),
        options: zod.object({}),
    }),
    zod.object({
        varPath: zod.string(),
        type: zod.literal("image"),
        options: imageTransformationOptions,
    }),
]));
export type SprocketDataSchema = zod.infer<typeof sprocketDataSchema>;
