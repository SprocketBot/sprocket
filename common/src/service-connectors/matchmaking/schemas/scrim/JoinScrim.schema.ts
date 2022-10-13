import {z} from "zod";

import {ScrimPlayerSchema} from "../../types";

export const JoinScrim_Request = z.object({
    scrimId: z.string().uuid(),
    player: ScrimPlayerSchema.omit({group: true}),
    /**
     * Boolean -> Should create a new group (or not)
     * String -> Should join an existing group (or fail)
     */
    group: z.union([z.boolean(), z.string()]).optional(),
});

export const JoinScrim_Response = z.boolean();
