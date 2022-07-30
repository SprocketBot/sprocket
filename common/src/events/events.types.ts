import {z} from "zod";

import {MemberRestrictionSchema} from "../service-connectors/core";
import {
    ScrimDatabaseIdsSchema, ScrimMetricsSchema, ScrimSchema,
} from "../service-connectors/matchmaking";
import {SubmissionEventSchema} from "./types/submission.schemas";

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
    ScrimSaved = "scrim.saved",

    ScrimsDisabled = "scrims.disabled",

    // Submissions
    AllSubmissionEvents = "submission.*",
    SubmissionStarted = "submission.started",
    SubmissionProgress = "submission.progress",
    SubmissionValidating = "submission.validating",

    SubmissionRatifying = "submission.ratifying",
    SubmissionRatificationAdded = "submission.ratification",
    SubmissionRatified = "submission.ratified",

    SubmissionRejectionAdded = "submission.rejection",
    SubmissionRejected = "submission.rejected",

    SubmissionReset = "submission.reset",

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

const SubmissionRatificationSchema = SubmissionEventSchema.extend({
    currentRatifications: z.number(),
    requiredRatifications: z.number(),
});
export const EventSchemas = {
    // Scrim Events
    [EventTopic.ScrimComplete]: ScrimSchema,
    [EventTopic.ScrimPopped]: ScrimSchema,
    [EventTopic.ScrimCreated]: ScrimSchema,
    [EventTopic.ScrimUpdated]: ScrimSchema,
    [EventTopic.ScrimDestroyed]: ScrimSchema,
    [EventTopic.ScrimStarted]: ScrimSchema,
    [EventTopic.ScrimCancelled]: ScrimSchema,
    [EventTopic.ScrimSaved]: ScrimSchema.extend({databaseIds: ScrimDatabaseIdsSchema}),
    [EventTopic.AllScrimEvents]: z.union([
        z.number(),
        z.string().uuid(),
        ScrimSchema,
        ScrimMetricsSchema,
    ]),
    [EventTopic.ScrimMetricsUpdate]: ScrimMetricsSchema,

    [EventTopic.ScrimsDisabled]: z.boolean(),

    // Submission Events
    [EventTopic.SubmissionStarted]: SubmissionEventSchema,
    [EventTopic.SubmissionRatificationAdded]: SubmissionRatificationSchema,
    [EventTopic.SubmissionRejectionAdded]: SubmissionEventSchema,
    [EventTopic.SubmissionRatified]: SubmissionEventSchema,
    [EventTopic.SubmissionValidating]: SubmissionEventSchema,
    [EventTopic.SubmissionRatifying]: SubmissionEventSchema.extend({resultPaths: z.array(z.string())}),
    [EventTopic.SubmissionRejected]: SubmissionEventSchema,
    [EventTopic.SubmissionReset]: SubmissionEventSchema,
    [EventTopic.SubmissionProgress]: SubmissionEventSchema,
    [EventTopic.AllSubmissionEvents]: z.union([
        SubmissionRatificationSchema,
        SubmissionEventSchema,
    ]),

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
