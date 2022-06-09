import {z} from "zod";

import {MemberRestrictionSchema} from "../service-connectors/core";
import {ScrimMetricsSchema, ScrimSchema} from "../service-connectors/matchmaking";

export enum EventTopic {
    // Scrims
    AllScrimEvents = "scrim.*",
    ScrimComplete = "scrim.complete",
    ScrimPopped = "scrim.popped",
    ScrimCreated = "scrim.created",
    ScrimUpdated = "scrim.updated",
    ScrimDestroyed = "scrim.destroyed",
    ScrimStarted = "scrim.started",
    ScrimCancelled = "scrim.cancelled",
    ScrimMetricsUpdate = "scrim.metricsUpdate",

    // Submissions
    SubmissionStarted = "submission.started",
    SubmissionRatificationAdded = "submission.ratification",
    SubmissionRejectionAdded = "submission.rejection",

    // Member
    AllMemberEvents = "member.*",
    MemberRestrictionCreated = "member.restrictionCreated",
    MemberRestrictionExpired = "member.restrictionExpired",

}

export const EventTopicSchema = z.preprocess(v => {
    if (typeof v !== "string") return v;
    return v.split(".").slice(0, 2)
        .join(".");
}, z.nativeEnum(EventTopic));

export const EventSchemas = {
    // Scrim Events
    [EventTopic.ScrimComplete]: ScrimSchema,
    [EventTopic.ScrimPopped]: ScrimSchema,
    [EventTopic.ScrimCreated]: ScrimSchema,
    [EventTopic.ScrimUpdated]: ScrimSchema,
    [EventTopic.ScrimDestroyed]: ScrimSchema,
    [EventTopic.ScrimStarted]: ScrimSchema,
    [EventTopic.ScrimCancelled]: ScrimSchema,
    [EventTopic.AllScrimEvents]: z.union([
        z.number(),
        z.string().uuid(),
        ScrimSchema,
        ScrimMetricsSchema,
    ]),
    [EventTopic.ScrimMetricsUpdate]: ScrimMetricsSchema,
    // Submission Events
    [EventTopic.SubmissionStarted]: z.object({submissionId: z.string()}),
    [EventTopic.SubmissionRatificationAdded]: z.object({
        currentRatifications: z.number(),
        requiredRatifications: z.number(),
        submissionId: z.string(),
    }),
    [EventTopic.SubmissionRejectionAdded]: z.object({
        submissionId: z.string(),
    }),

    // Member Events
    [EventTopic.MemberRestrictionCreated]: MemberRestrictionSchema,
    [EventTopic.MemberRestrictionExpired]: MemberRestrictionSchema,
    [EventTopic.AllMemberEvents]: z.union([
        z.number(),
        z.string().uuid(),
        MemberRestrictionSchema,
    ]),

};

export type EventPayload<T extends EventTopic> = z.infer<typeof EventSchemas[T]>;

export interface EventResponse<T extends EventTopic> {
    topic: T;
    payload: EventPayload<T>;
}
