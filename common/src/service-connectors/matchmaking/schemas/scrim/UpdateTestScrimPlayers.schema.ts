import {z} from "zod";

import {ScrimGameSchema, ScrimPlayerSchema} from "../../types";

export const UpdateTestScrimPlayers_Request = z.object({
    scrimId: z.string().uuid(),
    testRunId: z.string().uuid(),
    players: z.array(ScrimPlayerSchema),
    games: z.array(ScrimGameSchema),
});

export const UpdateTestScrimPlayers_Response = z.boolean();

export type UpdateTestScrimPlayersRequest = z.infer<typeof UpdateTestScrimPlayers_Request>;
