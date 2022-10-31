import {z} from "zod";

import {ScrimSchema} from "../../types";

export const GetAllScrims_Request = z.object({
    organizationId: z.number().optional(),
    skillGroupIds: z.array(z.number()).optional(),
});

export const GetAllScrims_Response = z.array(ScrimSchema);
