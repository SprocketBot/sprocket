import {z} from "zod";

import {ScrimDatabaseIdsSchema} from "../../types";

export const CompleteScrim_Request = z.object({
    scrimId: z.string().uuid(),
    playerId: z.number(),
    databaseIds: ScrimDatabaseIdsSchema,
});

export const CompleteScrim_Response = z.boolean();
