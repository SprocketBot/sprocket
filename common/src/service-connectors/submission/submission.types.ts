import {z} from "zod";

import type {ResponseStatus} from "../../global.types";

export enum SubmissionEndpoint {
    Debug = "Debug",
}

export const SubmissionSchemas = {
    [SubmissionEndpoint.Debug]: {
        input: z.unknown(),
        output: z.unknown(),
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

