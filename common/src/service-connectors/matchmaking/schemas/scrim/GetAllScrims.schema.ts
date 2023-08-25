import {z} from "zod";

import {ScrimSchema, ScrimStatus} from "../../types";

export const GetAllScrims_Request = z.object({
    organizationId: z.number().optional(),
    skillGroupIds: z.array(z.number()).optional(),
    status: z.nativeEnum(ScrimStatus).optional(),
});

export const GetAllScrims_Response = z.array(ScrimSchema);
