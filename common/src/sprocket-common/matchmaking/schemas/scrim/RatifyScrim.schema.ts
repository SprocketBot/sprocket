import {z} from "zod";

import {ScrimPlayerSchema} from "../../types";


export const RatifyScrim_Request = z.object({
    scrimId: z.string(),
    player: ScrimPlayerSchema,
});
export const RatifyScrim_Response = z.unknown();
