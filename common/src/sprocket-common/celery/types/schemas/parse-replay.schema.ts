import {z} from "zod";

import {BallchasingResponseSchema} from "./stats/ballchasing";

export const ParseReplay_Request = z.object({
    replayObjectPath: z.string(),
});

export const ParseReplay_Response = z.object({
    data: BallchasingResponseSchema,
});
