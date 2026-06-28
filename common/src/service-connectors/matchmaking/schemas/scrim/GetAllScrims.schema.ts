import {z} from "zod";

import {ScrimSchema} from "../../types";
import {ScrimStatus} from "../../types/ScrimStatus.enum";

export const GetAllScrims_Request = z.object({
    organizationId: z.number().optional(),
    status: z.nativeEnum(ScrimStatus).optional(),
    skillGroupId: z.number().optional(),
    skillGroupIds: z.array(z.number()).optional(),
    lfs: z.boolean().optional(),
});

export const GetAllScrims_Response = z.array(ScrimSchema);
