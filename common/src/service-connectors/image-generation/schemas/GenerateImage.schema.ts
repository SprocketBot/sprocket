import {z} from "zod";

// Hex color with or without alpha -- not quite right..
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const hexColorRegex = /#[a-f\d]{3}(?:[a-f\d]?|(?:[a-f\d]{3}(?:[a-f\d]{2})?)?)\b/i;

export const dataLeafSchema = z.union([
    z.object({
        type: z.literal("text"),
        value: z.union([z.string(), z.number()]),
    }),
    z.object({
        type: z.literal("number"),
        value: z.union([z.string(), z.number()]),
    }),
    z.object({
        type: z.literal("color"), // Should be color
        value: z.string(),
    }),
    z.object({
        type: z.literal("image"),
        value: z.string().url(),
    }),
]);
export type DataLeaf = z.infer<typeof dataLeafSchema>;

/**
 * Recursive type that describes the JSON Object Tree with DataLeaf Nodes
 */
// eslint-disable-next-line @typescript-eslint/consistent-indexed-object-style
export type Template = DataLeaf | {[key: string]: Template} | Template[];
export const templateStructureSchema: z.ZodType<Template> = z.lazy(() =>
    z.union([dataLeafSchema, z.array(templateStructureSchema), z.record(templateStructureSchema)]),
);

export type TemplateStructure = z.infer<typeof templateStructureSchema>;

export const GenerateImage_Request = z.object({
    inputFile: z.string(),
    outputFile: z.string(),
    template: templateStructureSchema,
});

export const GenerateImage_Response = z.string();
