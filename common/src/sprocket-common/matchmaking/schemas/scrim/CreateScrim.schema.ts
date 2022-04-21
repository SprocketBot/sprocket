import {z} from "zod";

import {
    ScrimGameModeSchema,
    ScrimPlayerSchema, ScrimSchema, ScrimSettingsSchema,
} from "../../types";

export const CreateScrim_Request = z.object({
    settings: ScrimSettingsSchema,
    author: ScrimPlayerSchema,
    gameMode: ScrimGameModeSchema,
    createGroup: z.boolean().optional()
        .default(false),
});

export const CreateScrim_Response = ScrimSchema;
