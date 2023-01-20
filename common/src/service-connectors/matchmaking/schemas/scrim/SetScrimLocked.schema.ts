import {z} from "zod";

export const SetScrimLockedStatusSchema = z.object({
    scrimId: z.string().uuid(),
    locked: z.boolean(),
});

export const SetScrimLockedSchema = SetScrimLockedStatusSchema.extend({
    locked: z.literal(true),
    reason: z.string().optional(),
});

export const SetScrimUnlockedSchema = SetScrimLockedStatusSchema.extend({
    locked: z.literal(false),
});

export const SetScrimLocked_Request = z.union([SetScrimLockedSchema, SetScrimUnlockedSchema]);

export const SetScrimLocked_Response = z.boolean();
