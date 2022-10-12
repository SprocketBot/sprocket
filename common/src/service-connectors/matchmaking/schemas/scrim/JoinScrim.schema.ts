import {z} from "zod";

import {ScrimJoinOptionsSchema} from "../../types";

export const JoinScrim_Request = ScrimJoinOptionsSchema.extend({
    scrimId: z.string().uuid(),
});

export const JoinScrim_Response = z.boolean();
