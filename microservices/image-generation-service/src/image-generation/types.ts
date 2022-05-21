import * as zod from "zod";

export const dimensionSchema = zod.object({
    height: zod.number(),
    width: zod.number(),
});
export type Dimension = zod.infer<typeof dimensionSchema>;

const textTransformationOptions = zod.object({
    "h-align": zod.optional(zod.enum(["left", "center", "right"])),
    "v-align": zod.optional(zod.enum(["top", "center", "bottom"])),
    "truncate-to": zod.optional(zod.union([zod.number(), zod.literal('as-is')])),
    "case": zod.optional(zod.enum(["lower", "upper", "as-is"])),
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
        type: zod.literal("number"),
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
