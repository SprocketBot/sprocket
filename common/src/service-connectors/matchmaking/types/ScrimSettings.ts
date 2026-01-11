import {z} from "zod";

import {ScrimMode} from "./ScrimMode";

export const ScrimSettingsSchema = z.object({
    teamSize: z.number().min(1),
    teamCount: z.number().min(2),
    mode: z.nativeEnum(ScrimMode),
    competitive: z.boolean(),
    observable: z.boolean(),
    lfs: z.boolean().default(false),
    checkinTimeout: z.number(),
});

export type ScrimSettings = z.infer<typeof ScrimSettingsSchema>;
