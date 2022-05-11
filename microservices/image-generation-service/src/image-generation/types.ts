import * as zod from "zod";
const operationTypes = zod.enum(["text", "fill", "stroke", "image"]);

const hAlignOptions = zod.enum(["left", "center", "right"]);
const vAlignOptions = zod.enum(["top", "center", "bottom"]);

export const dataLeafSchema = zod.union([
    zod.object({
        type: zod.literal("text"),
        value: zod.union([zod.string(), zod.number()]),
    }),
    zod.object({
        type: zod.literal("number"),
        value: zod.union([zod.string(), zod.number()]),
    }),
    zod.object({
        type: zod.literal("color"), // Should be color
        value: zod.string(),
    }),
    zod.object({
        type: zod.literal("image"),
        value: zod.string().url(),
    }),
]);
export type DataLeaf = zod.infer<typeof dataLeafSchema>;

const rescaleOnOptions = zod.enum(["height", "width"]);
const imageTransformationOptions = zod.object({
    rescaleOn: zod.enum(["height", "width"]),
});

/**
 * Recursive type that describes the JSON Object Tree with DataLeaf Nodes
 */
// eslint-disable-next-line @typescript-eslint/consistent-indexed-object-style
export type DataStructure = DataLeaf | { [key: string]: DataStructure;} | DataStructure[];
export const templateStructureSchema: zod.ZodType<DataStructure> = zod.lazy(() => zod.union([dataLeafSchema, zod.array(templateStructureSchema), zod.record(templateStructureSchema)]));


export const dimensionSchema = zod.object({
    height: zod.number(),
    width: zod.number(),
});

export type Operation = zod.infer<typeof operationSchema>;
export type Dimension = zod.infer<typeof dimensionSchema>;

const textTransformationOptions = zod.object({
    "h-align": zod.optional(zod.enum(["left", "center", "right"])),
    "v-align": zod.optional(zod.enum(["top", "center", "bottom"])),
});
export type TextTransformationOptions = zod.infer<typeof textTransformationOptions>;

const imageTransformationOptions = zod.object({
    rescaleOn: zod.enum(["height", "width"]),
});
export type ImageTransformationsOptions = zod.infer<typeof imageTransformationOptions>;

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
export type SprocketData = zod.infer<typeof sprocketDataSchema>;


export const dataForLinkType = {
    "text": ["text", "number"],
    "number": ["text", "number"],
    "stroke": ["color"],
    "fill": ["color"],
    "image": ["image"],
};
