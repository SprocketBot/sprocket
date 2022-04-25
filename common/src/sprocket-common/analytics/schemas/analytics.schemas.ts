import {z} from "zod";

const booleanFieldSchema = z.tuple([z.string(), z.boolean()]);
const floatFieldSchema   = z.tuple([z.string(), z.number()]);
const intFieldSchema     = z.tuple([z.string(), z.number().int()]);
const stringFieldSchema  = z.tuple([z.string(), z.string()]);

export const Analytics_InputSchema = z.object({
    name: z.string(),
    tags: stringFieldSchema.array().optional(),
    booleans: booleanFieldSchema.array().optional(),
    floats: floatFieldSchema.array().optional(),
    ints: intFieldSchema.array().optional(),
    strings: stringFieldSchema.array().optional(),
});

export const Analytics_OutputSchema = z.undefined();
