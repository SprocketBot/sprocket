import { z } from 'zod';

import { FranchiseInfoSchema } from './EnhancedSubmission.schema';

// Enhanced validation request with franchise context
export const EnhancedValidateSubmission_Request = z.object({
  submissionId: z.string(),
  playerId: z.number(),
  memberId: z.number().optional(),
  validateFranchise: z.boolean().optional(), // Flag to enable cross-franchise validation
});

// Enhanced validation response with detailed franchise information
export const EnhancedValidateSubmission_Response = z.object({
  valid: z.boolean(),
  errors: z
    .array(
      z.object({
        code: z.string(),
        message: z.string(),
        field: z.string().optional(),
      }),
    )
    .optional(),
  franchiseValidation: z
    .object({
      eligible: z.boolean(),
      eligibleFranchise: FranchiseInfoSchema.optional(),
      existingFranchises: FranchiseInfoSchema.array(),
      requiredFranchises: z.number(),
      currentFranchiseCount: z.number(),
      canRatify: z.boolean(),
      reason: z.string().optional(),
    })
    .optional(),
});

// Validation error codes for cross-franchise validation
export const FRANCHISE_VALIDATION_ERRORS = {
  NOT_ON_FRANCHISE: 'NOT_ON_FRANCHISE',
  FRANCHISE_ALREADY_RATIFIED: 'FRANCHISE_ALREADY_RATIFIED',
  INSUFFICIENT_FRANCHISE_DIVERSITY: 'INSUFFICIENT_FRANCHISE_DIVERSITY',
  NO_OPPOSING_FRANCHISE_RATIFIERS: 'NO_OPPOSING_FRANCHISE_RATIFIERS',
  SUBMISSION_TYPE_UNSUPPORTED: 'SUBMISSION_TYPE_UNSUPPORTED',
  FRANCHISE_INFO_UNAVAILABLE: 'FRANCHISE_INFO_UNAVAILABLE',
} as const;

export type FranchiseValidationErrorCode =
  typeof FRANCHISE_VALIDATION_ERRORS[keyof typeof FRANCHISE_VALIDATION_ERRORS];

// User-friendly error messages
export const FRANCHISE_VALIDATION_ERROR_MESSAGES: Record<FranchiseValidationErrorCode, string> = {
  NOT_ON_FRANCHISE: 'You must be a member of one of the competing franchises to ratify this match.',
  FRANCHISE_ALREADY_RATIFIED:
    'Your franchise ({franchiseName}) has already ratified this submission. Please wait for a player from the opposing franchise to ratify.',
  INSUFFICIENT_FRANCHISE_DIVERSITY:
    'This submission requires ratification from both competing franchises. Currently only {currentFranchises} of {requiredFranchises} franchises have ratified.',
  NO_OPPOSING_FRANCHISE_RATIFIERS:
    'No players from the opposing franchise are available to ratify. Please contact an administrator.',
  SUBMISSION_TYPE_UNSUPPORTED:
    'Cross-franchise validation is not supported for this submission type.',
  FRANCHISE_INFO_UNAVAILABLE: 'Unable to retrieve franchise information. Please try again later.',
};
