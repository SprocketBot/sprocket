import {z} from "zod";

import {ScrimSchema, ScrimSettingsSchema} from "../../types";

export const CreateTestScrim_Request = z.object({
    authorId: z.number(),
    organizationId: z.number(),
    gameModeId: z.number(),
    skillGroupId: z.number(),
    settings: ScrimSettingsSchema,
    testRunId: z.string().uuid(),
});

export const CreateTestScrim_Response = ScrimSchema;

export type CreateTestScrimRequest = z.infer<typeof CreateTestScrim_Request>;
