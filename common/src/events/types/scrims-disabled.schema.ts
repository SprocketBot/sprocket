import {z} from "zod";

const ScrimsDisabledBaseSchema = z.object({
    disabled: z.boolean(),
});

export const DisableScrimsSchema = ScrimsDisabledBaseSchema.extend({
    disabled: z.literal(true),
    reason: z.string().optional(),
});

export const EnableScrimsSchema = ScrimsDisabledBaseSchema.extend({
    disabled: z.literal(false),
});

export const ScrimsDisabledSchema = z.union([DisableScrimsSchema, EnableScrimsSchema]);

export type ScrimsDisabled = z.infer<typeof ScrimsDisabledSchema>;
