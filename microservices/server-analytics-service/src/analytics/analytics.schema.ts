import * as z from "zod";

const booleanFieldSchema = z.tuple([z.string(), z.boolean()]);
const floatFieldSchema = z.tuple([z.string(), z.number()]);
const intFieldSchema = z.tuple([z.string(), z.number().int()]);
const stringFieldSchema = z.tuple([z.string(), z.string()]);

export const AnalyticsPointSchema = z
    .object({
        // The name of the measurement
        name: z.string(),

        // Fields, at least one field is required
        // https://docs.influxdata.com/influxdb/v1.8/write_protocols/line_protocol_tutorial/#field-set
        booleans: z.array(booleanFieldSchema).optional(),
        floats: z.array(floatFieldSchema).optional(),
        ints: z.array(intFieldSchema).optional(),
        strings: z.array(stringFieldSchema).optional(),

        // Tags, all tags must be strings
        tags: z.array(stringFieldSchema).optional(),
    })
    .refine(
        obj => {
            const hasBooleanField = obj.booleans !== undefined && obj.booleans.length > 0;
            const hasFloatField = obj.floats !== undefined && obj.floats.length > 0;
            const hasIntField = obj.ints !== undefined && obj.ints.length > 0;
            const hasStringField = obj.strings !== undefined && obj.strings.length > 0;
            const hasAtLeastOneField = hasBooleanField || hasFloatField || hasIntField || hasStringField;

            return hasAtLeastOneField;
        },
        {
            message:
                "Analytics points must have at least one field specified in `booleans`, `floats`, `ints`, or `strings`",
        },
    );

export type AnalyticsPoint = z.infer<typeof AnalyticsPointSchema>;
