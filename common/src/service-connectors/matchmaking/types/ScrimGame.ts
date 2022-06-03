import {z} from "zod";

import {ScrimTeamSchema} from "./ScrimTeam";

export const ScrimGameSchema = z.object({
    teams: z.array(ScrimTeamSchema),
});

export type ScrimGame = z.infer<typeof ScrimGameSchema>;
