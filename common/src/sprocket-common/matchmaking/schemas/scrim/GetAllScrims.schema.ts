import {z} from "zod";

import {ScrimSchema} from "../../types";

export const GetAllScrims_Request = z.object({});

export const GetAllScrims_Response = z.array(ScrimSchema);
