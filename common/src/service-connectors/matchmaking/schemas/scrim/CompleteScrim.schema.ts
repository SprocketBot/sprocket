import {z} from "zod";

import {ScrimDatabaseIdsSchema} from "../../../../events";

export const CompleteScrim_Request = z.object({
    scrimId: z.string().uuid(),
    userId: z.number(),
    databaseIds: ScrimDatabaseIdsSchema,
});

export const CompleteScrim_Response = z.boolean();
