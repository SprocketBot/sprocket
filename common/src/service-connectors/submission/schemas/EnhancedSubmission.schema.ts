import {z} from "zod";

import {ReplaySubmissionStatus, ReplaySubmissionType} from "../types";

// Franchise info schema
export const FranchiseInfoSchema = z.object({
    id: z.number(),
    name: z.string(),
});

// Enhanced ratifier info schema
export const RatifierInfoSchema = z.object({
    playerId: z.number(),
    franchiseId: z.number(),
    franchiseName: z.string(),
    ratifiedAt: z.string(),
});

// Franchise validation context schema
export const FranchiseValidationContextSchema = z.object({
    homeFranchiseId: z.number().optional(),
    awayFranchiseId: z.number().optional(),
    requiredFranchises: z.number(),
    currentFranchiseCount: z.number(),
});

// Enhanced base submission schema
export const EnhancedBaseSubmissionSchema = z.object({
    id: z.string(),
    creatorId: z.number(),
    status: z.nativeEnum(ReplaySubmissionStatus),
    taskIds: z.string().array(),
    items: z.any().array(), // TODO: Replace with proper ReplaySubmissionItem schema when available
    validated: z.boolean(),
    stats: z.any().optional(), // TODO: Replace with proper ReplaySubmissionStats schema when available
    ratifiers: RatifierInfoSchema.array(), // Enhanced from number[] to RatifierInfo[]
    requiredRatifications: z.number(),
    rejections: z.any().array(), // TODO: Replace with proper ReplaySubmissionRejection schema when available
    franchiseValidation: FranchiseValidationContextSchema,
});

// Enhanced submission types
export const EnhancedScrimSubmissionSchema = EnhancedBaseSubmissionSchema.extend({
    type: z.literal(ReplaySubmissionType.SCRIM),
    scrimId: z.string(),
});

export const EnhancedMatchSubmissionSchema = EnhancedBaseSubmissionSchema.extend({
    type: z.literal(ReplaySubmissionType.MATCH),
    matchId: z.number(),
});

export const EnhancedLFSSubmissionSchema = EnhancedBaseSubmissionSchema.extend({
    type: z.literal(ReplaySubmissionType.LFS),
    scrimId: z.string(),
});

// Union of all enhanced submission types
export const EnhancedSubmissionSchema = z.union([
    EnhancedScrimSubmissionSchema,
    EnhancedMatchSubmissionSchema,
    EnhancedLFSSubmissionSchema,
]);

// Backward compatibility schema that can handle both old and new formats
export const CompatibleSubmissionSchema = z.union([
    EnhancedSubmissionSchema,
    z.any(), // TODO: Replace with legacy submission schema when available
]);
