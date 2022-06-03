import {z} from "zod";

import {ScrimPlayerSchema} from "../../types";

export const LeaveScrim_Request = z.object({
    scrimId: z.string().uuid(),
    player: ScrimPlayerSchema,
});

export const LeaveScrim_Response = z.boolean();
