import type { z } from 'zod';

import type { ResponseStatus } from '../../global.types';
import * as Schemas from './schemas';

export enum SubmissionEndpoint {
  GetSubmissionIfExists = 'GetSubmissionIfExists',
  GetAllSubmissions = 'GetAllSubmissions',
  SubmitReplays = 'SubmitReplays',
  CanSubmitReplays = 'CanSubmitReplays',
  RatifySubmission = 'RatifySubmission',
  CanRatifySubmission = 'CanRatifySubmission',
  RejectSubmission = 'RejectSubmission',
  ResetSubmission = 'ResetSubmission',
  RemoveSubmission = 'RemoveSubmission',
  GetSubmissionRedisKey = 'GetSubmissionRedisKey',
  GetSubmissionRejections = 'GetSubmissionRejections',
  ValidateSubmission = 'ValidateSubmission',
  // Enhanced endpoints for cross-franchise validation
  EnhancedRatifySubmission = 'EnhancedRatifySubmission',
  EnhancedCanRatifySubmission = 'EnhancedCanRatifySubmission',
  EnhancedRejectSubmission = 'EnhancedRejectSubmission',
  EnhancedResetSubmission = 'EnhancedResetSubmission',
  EnhancedValidateSubmission = 'EnhancedValidateSubmission',
}

export const SubmissionSchemas = {
  [SubmissionEndpoint.GetSubmissionIfExists]: {
    input: Schemas.GetSubmissionIfExists_Request,
    output: Schemas.GetSubmissionIfExists_Response,
  },
  [SubmissionEndpoint.GetAllSubmissions]: {
    input: Schemas.GetAllSubmissions_Request,
    output: Schemas.GetAllSubmissions_Response,
  },
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
  [SubmissionEndpoint.CanRatifySubmission]: {
    input: Schemas.CanRatifySubmission_Request,
    output: Schemas.CanRatifySubmission_Response,
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
  [SubmissionEndpoint.RemoveSubmission]: {
    input: Schemas.RemoveSubmission_Request,
    output: Schemas.RemoveSubmission_Response,
  },
  [SubmissionEndpoint.GetSubmissionRejections]: {
    input: Schemas.GetSubmissionRejections_Request,
    output: Schemas.GetSubmissionRejections_Response,
  },
  [SubmissionEndpoint.ValidateSubmission]: {
    input: Schemas.EnhancedValidateSubmission_Request,
    output: Schemas.EnhancedValidateSubmission_Response,
  },
  // Enhanced endpoints for cross-franchise validation
  [SubmissionEndpoint.EnhancedRatifySubmission]: {
    input: Schemas.EnhancedRatifySubmission_Request,
    output: Schemas.EnhancedRatifySubmission_Response,
  },
  [SubmissionEndpoint.EnhancedCanRatifySubmission]: {
    input: Schemas.EnhancedCanRatifySubmission_Request,
    output: Schemas.EnhancedCanRatifySubmission_Response,
  },
  [SubmissionEndpoint.EnhancedRejectSubmission]: {
    input: Schemas.EnhancedRejectSubmission_Request,
    output: Schemas.EnhancedRejectSubmission_Response,
  },
  [SubmissionEndpoint.EnhancedResetSubmission]: {
    input: Schemas.EnhancedResetSubmission_Request,
    output: Schemas.EnhancedResetSubmission_Response,
  },
  [SubmissionEndpoint.EnhancedValidateSubmission]: {
    input: Schemas.EnhancedValidateSubmission_Request,
    output: Schemas.EnhancedValidateSubmission_Response,
  },
};

export type SubmissionInput<T extends SubmissionEndpoint> = z.infer<
  typeof SubmissionSchemas[T]['input']
>;
export type SubmissionOutput<T extends SubmissionEndpoint> = z.infer<
  typeof SubmissionSchemas[T]['output']
>;

export interface SubmissionSuccessResponse<T extends SubmissionEndpoint> {
  status: ResponseStatus.SUCCESS;
  data: SubmissionOutput<T>;
}

export interface SubmissionErrorResponse {
  status: ResponseStatus.ERROR;
  error: Error;
}

export type SubmissionResponse<T extends SubmissionEndpoint> =
  | SubmissionSuccessResponse<T>
  | SubmissionErrorResponse;
