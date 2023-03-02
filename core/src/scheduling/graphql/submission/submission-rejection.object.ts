import {Field, ObjectType} from "@nestjs/graphql";
import type {ReplaySubmissionRejection} from "@sprocketbot/common";

import type {SubmissionItemObject} from "./submission-item.object";

export type RejectedItem = Omit<SubmissionItemObject, "progress">;

@ObjectType()
export class SubmissionRejectionObject implements ReplaySubmissionRejection {
    @Field()
    userId: number;

    @Field()
    reason: string;

    @Field()
    stale: boolean;

    @Field()
    rejectedAt: string;

    rejectedItems: RejectedItem[];
}
