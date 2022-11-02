import {z} from "zod";

import {ScrimSchema} from "../../types";

export const GetScrim_Request = z.object({
    scrimId: z.string().uuid(),
});

export const GetScrim_Response = ScrimSchema.nullable();
