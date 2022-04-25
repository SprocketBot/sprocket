import {z} from "zod";

import {ScrimMode} from "./ScrimMode";

export const ScrimSettingsSchema = z.object({
    teamSize: z.number().min(1),
    teamCount: z.number().min(2),
    mode: z.nativeEnum(ScrimMode),
    competitive: z.boolean(),
});

export type ScrimSettings = z.infer<typeof ScrimSettingsSchema>;
