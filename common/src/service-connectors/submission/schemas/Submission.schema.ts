import {z} from "zod";

import {ReplaySubmissionStatus, ReplaySubmissionType} from "../types";

const BaseSubmission = z.object({
    id: z.string(),
    creatorUserId: z.number(),
    status: z.nativeEnum(ReplaySubmissionStatus),
    taskIds: z.string().array(),
    items: z.any().array(), // TODO ReplaySubmissionItem schema
    validated: z.boolean(),
    stats: z.any().optional(), // TODO ReplaySubmissionStatus schema
    ratifiers: z.number().array(),
    requiredRatifications: z.number(),
    rejections: z.any().array(), // TODO ReplaySubmissionRejection schema
});

const ScrimSubmission = BaseSubmission.extend({
    type: z.literal(ReplaySubmissionType.SCRIM),
    scrimId: z.string(),
});

const MatchSubmission = BaseSubmission.extend({
    type: z.literal(ReplaySubmissionType.MATCH),
    matchId: z.number(),
});

export const SubmissionSchema = z.union([ScrimSubmission, MatchSubmission]);
