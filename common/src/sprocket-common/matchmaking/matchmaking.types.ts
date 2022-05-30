import type {z} from "zod";

import type {ResponseStatus} from "../../global.types";
import * as Schemas from "./schemas";


export enum MatchmakingEndpoint {
    // Scrim
    GetQueueStatus = "GetQueueStatus",
    CreateScrim = "CreateScrim",
    JoinScrim = "JoinScrim",
    LeaveScrim = "LeaveScrim",
    CheckInToScrim = "CheckInToScrim",
    GetAllScrims = "GetAllScrims",
    GetScrim = "GetScrim",
    GetScrimMetrics = "GetScrimMetrics",
    GetScrimByPlayer = "GetScrimByPlayer",
    EndScrim = "EndScrim",
    CompleteScrim = "CompleteScrim",
    GetScrimBySubmissionId = "GetScrimBySubmissionId",
    CancelScrim = "CancelScrim",

    // Validation
    ValidateReplays = "ValidateReplays",
    ForceUpdateScrimStatus = "ForceUpdateScrimStatus",
}

export const MatchmakingSchemas = {
    // Scrim
    [MatchmakingEndpoint.GetQueueStatus]: {
        input: Schemas.GetQueueStatus_Request,
        output: Schemas.GetQueueStatus_Response,
    },
    [MatchmakingEndpoint.CreateScrim]: {
        input: Schemas.CreateScrim_Request,
        output: Schemas.CreateScrim_Response,
    },
    [MatchmakingEndpoint.JoinScrim]: {
        input: Schemas.JoinScrim_Request,
        output: Schemas.JoinScrim_Response,
    },
    [MatchmakingEndpoint.LeaveScrim]: {
        input: Schemas.LeaveScrim_Request,
        output: Schemas.LeaveScrim_Response,
    },
    [MatchmakingEndpoint.GetAllScrims]: {
        input: Schemas.GetAllScrims_Request,
        output: Schemas.GetAllScrims_Response,
    },
    [MatchmakingEndpoint.GetScrim]: {
        input: Schemas.GetScrim_Request,
        output: Schemas.GetScrim_Response,
    },
    [MatchmakingEndpoint.CheckInToScrim]: {
        input: Schemas.CheckInToScrim_Request,
        output: Schemas.CheckInToScrim_Response,
    },
    [MatchmakingEndpoint.GetScrimMetrics]: {
        input: Schemas.GetScrimMetrics_Request,
        output: Schemas.GetScrimMetrics_Response,
    },
    [MatchmakingEndpoint.GetScrimByPlayer]: {
        input: Schemas.GetScrimByPlayer_Request,
        output: Schemas.GetScrimByPlayer_Response,
    },
    [MatchmakingEndpoint.EndScrim]: {
        input: Schemas.EndScrim_Request,
        output: Schemas.EndScrim_Response,
    },
    [MatchmakingEndpoint.CompleteScrim]: {
        input: Schemas.CompleteScrim_Request,
        output: Schemas.CompleteScrim_Response,
    },
    [MatchmakingEndpoint.GetScrimBySubmissionId]: {
        input: Schemas.GetScrimBySubmissionId_Request,
        output: Schemas.GetScrimBySubmissionId_Response,
    },
    [MatchmakingEndpoint.CancelScrim]: {
        input: Schemas.CancelScrim_Request,
        output: Schemas.CancelScrim_Response,
    },
    // Validation
    [MatchmakingEndpoint.ValidateReplays]: {
        input: Schemas.ValidateReplays_Request,
        output: Schemas.ValidateReplays_Response,
    },
    [MatchmakingEndpoint.ForceUpdateScrimStatus]: {
        input: Schemas.ForceUpdateScrimStatus_Request,
        output: Schemas.ForceUpdateScrimStatus_Response,
    },
};

export type MatchmakingInput<T extends MatchmakingEndpoint> = z.infer<typeof MatchmakingSchemas[T]["input"]>;
export type MatchmakingOutput<T extends MatchmakingEndpoint> = z.infer<typeof MatchmakingSchemas[T]["output"]>;

export interface MatchmakingSuccessResponse<T extends MatchmakingEndpoint> {
    status: ResponseStatus.SUCCESS;
    data: MatchmakingOutput<T>;
}

export interface MatchmakingErrorResponse {
    status: ResponseStatus.ERROR;
    error: Error;
}

export type MatchmakingResponse<T extends MatchmakingEndpoint> =
    MatchmakingSuccessResponse<T>
    | MatchmakingErrorResponse;
export * from "./types";
