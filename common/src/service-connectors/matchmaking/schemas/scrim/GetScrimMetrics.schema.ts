import {z} from "zod";

import {ScrimMetricsSchema} from "../../types";

export const GetScrimMetrics_Request = z.object({});

export const GetScrimMetrics_Response = ScrimMetricsSchema;
