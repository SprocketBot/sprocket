import { z } from 'zod';

import { FranchiseInfoSchema } from '../EnhancedSubmission.schema';

// Enhanced ratify submission request with franchise context
export const EnhancedRatifySubmission_Request = z.object({
  submissionId: z.string(),
  playerId: z.number(),
  memberId: z.number().optional(), // Optional member ID for franchise lookup
});

// Enhanced ratify submission response with detailed information
export const EnhancedRatifySubmission_Response = z.object({
  success: z.literal(true),
  ratifierInfo: z.object({
    playerId: z.number(),
    franchiseId: z.number(),
    franchiseName: z.string(),
    ratifiedAt: z.string(),
  }),
  franchiseValidation: z.object({
    currentFranchiseCount: z.number(),
    requiredFranchises: z.number(),
    isComplete: z.boolean(),
    remainingFranchises: z.number(),
  }),
});

// Enhanced can ratify submission request
export const EnhancedCanRatifySubmission_Request = z.object({
  submissionId: z.string(),
  playerId: z.number(),
  memberId: z.number().optional(),
});

// Enhanced can ratify submission response with detailed franchise information
export const EnhancedCanRatifySubmission_Response = z.object({
  canRatify: z.boolean(),
  reason: z.string().optional(),
  franchiseInfo: z
    .object({
      eligibleFranchise: FranchiseInfoSchema,
      existingFranchises: FranchiseInfoSchema.array(),
      requiredFranchises: z.number(),
      currentFranchiseCount: z.number(),
    })
    .optional(),
  errors: z
    .array(
      z.object({
        code: z.string(),
        message: z.string(),
      }),
    )
    .optional(),
});

// Enhanced reject submission request
export const EnhancedRejectSubmission_Request = z.object({
  submissionId: z.string(),
  playerId: z.number(),
  memberId: z.number().optional(),
  reason: z.string(),
});

export const EnhancedRejectSubmission_Response = z.literal(true);

// Enhanced reset submission request
export const EnhancedResetSubmission_Request = z.object({
  submissionId: z.string(),
  playerId: z.number(),
  memberId: z.number().optional(),
});

export const EnhancedResetSubmission_Response = z.literal(true);

// Enhanced can ratify submission response for backward compatibility
export const CompatibleCanRatifySubmission_Response = z.union([
  z.boolean(), // Legacy response
  EnhancedCanRatifySubmission_Response, // New enhanced response
]);
