import {z} from "zod";

import {
    ScrimGameModeSchema,
    ScrimPlayerSchema, ScrimSchema, ScrimSettingsSchema,
} from "../../types";

export const CreateScrim_Request = z.object({
    settings: ScrimSettingsSchema,
    author: ScrimPlayerSchema.omit({joinedAt: true}),
    organizationId: z.number(),
    gameMode: ScrimGameModeSchema,
    skillGroupId: z.number(),
    createGroup: z.boolean().optional()
        .default(false),
});

export const CreateScrim_Response = ScrimSchema;
