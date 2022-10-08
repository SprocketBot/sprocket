import type {z} from "zod";

import type {ResponseStatus} from "../../global.types";
import {Analytics_InputSchema, Analytics_OutputSchema} from "./schemas";

export enum AnalyticsEndpoint {
    Analytics = "analytics",
}

export const AnalyticsSchemas = {
    [AnalyticsEndpoint.Analytics]: {
        input: Analytics_InputSchema,
        output: Analytics_OutputSchema,
    },
};

export type AnalyticsInput<T extends AnalyticsEndpoint> = z.infer<
    typeof AnalyticsSchemas[T]["input"]
>;
export type AnalyticsOutput<T extends AnalyticsEndpoint> = z.infer<
    typeof AnalyticsSchemas[T]["output"]
>;

export interface AnalyticsSuccessResponse<T extends AnalyticsEndpoint> {
    status: ResponseStatus.SUCCESS;
    data: AnalyticsOutput<T>;
}

export interface AnalyticsErrorResponse {
    status: ResponseStatus.ERROR;
    error: Error;
}

export type AnalyticsResponse<T extends AnalyticsEndpoint> =
    | AnalyticsSuccessResponse<T>
    | AnalyticsErrorResponse;
