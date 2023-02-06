import {z} from "zod";

import {SubmissionSchema} from "../types";

export const GetAllSubmissions_Request = z.undefined();

export const GetAllSubmissions_Response = z.array(SubmissionSchema);
