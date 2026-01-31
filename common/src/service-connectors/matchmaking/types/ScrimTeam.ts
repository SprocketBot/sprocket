import {z} from "zod";

import {ScrimPlayerSchema} from "./ScrimPlayer";

export const ScrimTeamSchema = z.object({
    players: z.array(ScrimPlayerSchema),
});

export type ScrimTeam = z.infer<typeof ScrimTeamSchema>;
