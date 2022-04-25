import * as zod from "zod";

const booleanFieldSchema = zod.tuple([zod.string(), zod.boolean()]);
const floatFieldSchema   = zod.tuple([zod.string(), zod.number()]);
const intFieldSchema     = zod.tuple([zod.string(), zod.number().int()]);
const stringFieldSchema  = zod.tuple([zod.string(), zod.string()]);

export const serverEventSchema = zod.object({
    booleans: zod.array(booleanFieldSchema).optional(),
    floats: zod.array(floatFieldSchema).optional(),
    ints: zod.array(intFieldSchema).optional(),
    name: zod.string(),

    strings: zod.array(stringFieldSchema).optional(),
    tags: zod.array(stringFieldSchema).optional(),
}).nonstrict();
export type ServerEvent = zod.infer<typeof serverEventSchema>;
