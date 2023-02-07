import {Field, ObjectType} from "@nestjs/graphql";
import type {
    SubmissionItem,
    SubmissionRatification,
    SubmissionRatificationRound,
    SubmissionRejection,
} from "@sprocketbot/common";

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

@ObjectType()
export class SubmissionRoundItemObject implements Omit<SubmissionItem, "progress"> {
    taskId: string;

    originalFilename: string;

    inputPath: string;

    outputPath?: string;
}

@ObjectType()
export class SubmissionRatificationRoundObject implements SubmissionRatificationRound {
    @Field()
    uploaderUserId: number;

    items: SubmissionRoundItemObject[];

    @Field(() => [SubmissionRatificationObject])
    ratifications: SubmissionRatificationObject[];

    @Field(() => [SubmissionRejectionObject])
    rejections: SubmissionRejectionObject[];
}
