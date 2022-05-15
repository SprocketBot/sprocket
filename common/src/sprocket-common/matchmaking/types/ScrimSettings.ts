import {z} from "zod";

import {ScrimLobbySchema} from "./ScrimLobby";
import {ScrimMode} from "./ScrimMode";

export const ScrimSettingsSchema = z.object({
    teamSize: z.number().min(1),
    teamCount: z.number().min(2),
    mode: z.nativeEnum(ScrimMode),
    competitive: z.boolean(),
    observable: z.boolean().default(false),
    lobby: ScrimLobbySchema.optional(),
    checkinTimeout: z.number(),
});

export type ScrimSettings = z.infer<typeof ScrimSettingsSchema>;
