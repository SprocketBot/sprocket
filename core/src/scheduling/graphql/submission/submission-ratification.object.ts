import {Field, ObjectType} from "@nestjs/graphql";
import type {SubmissionRatification, SubmissionRejection} from "@sprocketbot/common";

import type {SubmissionItemObject} from "./submission-item.object";

export type RejectedItem = Omit<SubmissionItemObject, "progress">;

@ObjectType()
export class SubmissionRatificationObject implements SubmissionRatification {
    @Field()
    userId: number;

    @Field()
    ratifiedAt: Date;
}

@ObjectType()
export class SubmissionRejectionObject implements SubmissionRejection {
    @Field()
    userId: number;

    @Field()
    reason: string;

    @Field()
    rejectedAt: Date;
}
