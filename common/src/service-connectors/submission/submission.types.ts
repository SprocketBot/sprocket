import type {z} from "zod";

import type {ResponseStatus} from "../../global.types";
import * as Schemas from "./schemas";

export enum SubmissionEndpoint {
    SubmitReplays = "SubmitReplays",
    CanSubmitReplays = "CanSubmitReplays",
    RatifySubmission = "RatifySubmission",
    RejectSubmission = "RejectSubmission",
    ResetSubmission = "ResetSubmission",
    GetSubmissionRedisKey = "GetSubmissionRedisKey",
}

export const SubmissionSchemas = {
    [SubmissionEndpoint.SubmitReplays]: {
        input: Schemas.SubmitReplays_Request,
        output: Schemas.SubmitReplays_Response,
    },
    [SubmissionEndpoint.CanSubmitReplays]: {
        input: Schemas.CanSubmitReplays_Request,
        output: Schemas.CanSubmitReplays_Response,
    },
    [SubmissionEndpoint.RatifySubmission]: {
        input: Schemas.RatifySubmission_Request,
        output: Schemas.RatifySubmission_Response,
    },
    [SubmissionEndpoint.RejectSubmission]: {
        input: Schemas.RejectSubmission_Request,
        output: Schemas.RejectSubmission_Response,
    },
    [SubmissionEndpoint.ResetSubmission]: {
        input: Schemas.ResetSubmission_Request,
        output: Schemas.ResetSubmission_Response,
    },
    [SubmissionEndpoint.GetSubmissionRedisKey]: {
        input: Schemas.GetSubmissionRedisKey_Request,
        output: Schemas.GetSubmissionRedisKey_Response,
    },
};

export type SubmissionInput<T extends SubmissionEndpoint> = z.infer<typeof SubmissionSchemas[T]["input"]>;
export type SubmissionOutput<T extends SubmissionEndpoint> = z.infer<typeof SubmissionSchemas[T]["output"]>;

export interface SubmissionSuccessResponse<T extends SubmissionEndpoint> {
    status: ResponseStatus.SUCCESS;
    data: SubmissionOutput<T>;
}

export interface SubmissionErrorResponse {
    status: ResponseStatus.ERROR;
    error: Error;
}

export type SubmissionResponse<T extends SubmissionEndpoint> = SubmissionSuccessResponse<T> | SubmissionErrorResponse;

