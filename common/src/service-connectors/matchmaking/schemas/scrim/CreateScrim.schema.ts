import {z} from "zod";

import {ScrimJoinOptionsSchema, ScrimSchema, ScrimSettingsSchema} from "../../types";

export const CreateScrim_Request = z.object({
    authorId: z.number(),
    organizationId: z.number(),
    gameModeId: z.number(),
    skillGroupId: z.number(),
    settings: ScrimSettingsSchema,
    join: ScrimJoinOptionsSchema.optional(),
});

export type CreateScrimOptions = z.infer<typeof CreateScrim_Request>;

export const CreateScrim_Response = ScrimSchema;
