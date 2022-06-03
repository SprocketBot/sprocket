import {z} from "zod";

import {ScrimStatus} from "../../types";

export const ForceUpdateScrimStatus_Request = z.object({
    scrimId: z.string(),
    status: z.nativeEnum(ScrimStatus),
});

export const ForceUpdateScrimStatus_Response = z.boolean();
