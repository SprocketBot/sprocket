import {z} from "zod";

import {
    ScrimPlayerSchema,
} from "../../types";

export const UpdateLFSScrimPlayers_Request = z.object({
    scrimId: z.string(),
    players: z.array(ScrimPlayerSchema),
    games: z.array(z.array(z.array(ScrimPlayerSchema))),
});

export const UpdateLFSScrimPlayers_Response = z.boolean();

export type UpdateLFSScrimPlayersRequest = z.infer<typeof UpdateLFSScrimPlayers_Request>;
export type UpdateLFSScrimPlayersResponse = z.infer<typeof UpdateLFSScrimPlayers_Response>;

