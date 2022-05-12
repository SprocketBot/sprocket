import {z} from "zod";

import {ScrimSchema} from "../../types";

export const CancelScrim_Request = z.object({
    scrimId: z.string().uuid(),
});

export const CancelScrim_Response = ScrimSchema;
