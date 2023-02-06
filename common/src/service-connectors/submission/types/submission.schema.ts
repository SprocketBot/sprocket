import {z} from "zod";

import {SubmissionItemSchema} from "./submission-item.schema";
import {
    SubmissionRatificationRoundSchema,
    SubmissionRatificationSchema,
    SubmissionRejectionSchema,
} from "./submission-ratification.schema";
import {SubmissionStatsSchema} from "./submission-stats.schema";

export enum SubmissionType {
    Scrim = "Scrim",
    Match = "Match",
}

export enum SubmissionStatus {
    Processing = "Processing",
    Ratifying = "Ratifying",
    Validating = "Validating",
    Ratified = "Ratified",
    Rejected = "Rejected",
}

export const BaseSubmissionSchema = z.object({
    id: z.string(),
    type: z.nativeEnum(SubmissionType),

    status: z.nativeEnum(SubmissionStatus),
    validated: z.boolean(),

    requiredRatifications: z.number(),

    ratifications: z.array(SubmissionRatificationSchema),
    rejections: z.array(SubmissionRejectionSchema),

    uploaderUserId: z.number(),
    items: z.array(SubmissionItemSchema),

    rounds: z.array(SubmissionRatificationRoundSchema),
    stats: SubmissionStatsSchema.optional(),
});

export const MatchSubmissionSchema = BaseSubmissionSchema.extend({
    type: z.literal(SubmissionType.Match),
    matchId: z.number(),
});

export const ScrimSubmissionSchema = BaseSubmissionSchema.extend({
    type: z.literal(SubmissionType.Scrim),
    scrimId: z.string(),
});

export const SubmissionSchema = z.union([MatchSubmissionSchema, ScrimSubmissionSchema]);

export type BaseSubmission = z.infer<typeof BaseSubmissionSchema>;
export type MatchSubmission = z.infer<typeof MatchSubmissionSchema>;
export type ScrimSubmission = z.infer<typeof ScrimSubmissionSchema>;
export type Submission = z.infer<typeof SubmissionSchema>;
