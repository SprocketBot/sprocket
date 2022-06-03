import {z} from "zod";

import {ScrimMetricsSchema, ScrimSchema} from "../matchmaking";

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

    // Member
    AllMemberEvents = "member.*",
    MemberBanned = "member.banned",
}



export const EventTopicSchema = z.preprocess(v => {
    if (typeof v !== "string") return v;
    return v.split(".").slice(0, 2)
        .join(".");
}, z.nativeEnum(EventTopic));

export const EventSchemas = {
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
    [EventTopic.SubmissionStarted]: z.object({submissionId: z.string()}),
    [EventTopic.AllMemberEvents]: z.union([
        z.number(),
        z.string().uuid(),
    ]),
    [EventTopic.MemberBanned]: z.number(),
};

export type EventPayload<T extends EventTopic> = z.infer<typeof EventSchemas[T]>;

export interface EventResponse<T extends EventTopic> {
    topic: T;
    payload: EventPayload<T>;
}
