import {z} from "zod";

export const dimensionSchema = z.object({
    height: z.number(),
    width: z.number(),
});
export type Dimension = z.infer<typeof dimensionSchema>;

const textTransformationOptions = z.object({
    "h-align": z.optional(z.enum(["left", "center", "right"])),
    "v-align": z.optional(z.enum(["top", "center", "bottom"])),
    "truncate-to": z.optional(z.union([z.number(), z.literal("as-is")])),
    "case": z.optional(z.enum(["lower", "upper", "as-is"])),
});
export type TextTransformationOptions = z.infer<typeof textTransformationOptions>;

const imageTransformationOptions = z.object({
    rescaleOn: z.enum(["height", "width"]),
});
export type ImageTransformationsOptions = z.infer<typeof imageTransformationOptions>;

export const sprocketDataSchema = z.array(z.union([
    z.object({
        varPath: z.string(),
        type: z.literal("text"),
        options: textTransformationOptions,
    }),
    z.object({
        varPath: z.string(),
        type: z.literal("number"),
        options: textTransformationOptions,
    }),
    z.object({
        varPath: z.string(),
        type: z.literal("fill"),
        options: z.object({}),
    }),
    z.object({
        varPath: z.string(),
        type: z.literal("stroke"),
        options: z.object({}),
    }),
    z.object({
        varPath: z.string(),
        type: z.literal("image"),
        options: imageTransformationOptions,
    }),
]));
export type SprocketData = z.infer<typeof sprocketDataSchema>;

export const dataForLinkType = {
    text: ["text", "number"],
    number: ["text", "number"],
    stroke: ["color"],
    fill: ["color"],
    image: ["image"],
};
