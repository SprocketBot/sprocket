import {z} from "zod";

import {
    ScrimPlayerSchema,
} from "../../types";

export const CheckInToScrim_Request = z.object({
    scrimId: z.string().uuid(),
    player: ScrimPlayerSchema,
});

export const CheckInToScrim_Response = z.boolean();
