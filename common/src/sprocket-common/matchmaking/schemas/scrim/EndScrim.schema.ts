import {z} from "zod";

import {ScrimPlayerSchema} from "../../types";

export const EndScrim_Request = z.object({
    scrimId: z.string().uuid(),
    player: ScrimPlayerSchema,
});

export const EndScrim_Response = z.boolean();
