import * as zod from "zod";

export const operationSchema = zod.object({
    value: zod.string(),
    type: zod.enum(["text", "fill", "image"]),
});

export const dimensionSchema = zod.object({
    height: zod.number(),
    width: zod.number(),
});

export type Operation = zod.infer<typeof operationSchema>;
export type Dimension = zod.infer<typeof dimensionSchema>;

// Need to use interface for circular referencing
// eslint-disable-next-line @typescript-eslint/consistent-indexed-object-style
export interface InputDatum {
    [key: string]: InputDatum | Operation | InputDatum[];
}

export const inputDataSchema: zod.ZodSchema<InputDatum> = zod.lazy(() =>
    zod.record(zod.union([operationSchema, inputDataSchema])),
);
