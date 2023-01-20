import {BallchasingPlayerSchema} from "@sprocketbot/common";
import {z} from "zod";

export const PlayerStatLineStatsSchema = z.object({
    otherStats: BallchasingPlayerSchema,
    dpi: z.number(),
    gpi: z.number(),
    opi: z.number(),
});
