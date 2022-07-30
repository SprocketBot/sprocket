import {Field, ObjectType} from "@nestjs/graphql";

import type {ReplaySubmissionItem} from "./submission-item.types";

export type RejectedItem = Omit<ReplaySubmissionItem, "progress">;

@ObjectType()
export class SubmissionRejection {
    @Field()
    playerId: number;

    @Field()
    playerName: string;

    @Field()
    reason: string;

    @Field()
    stale: boolean;

    @Field(() => Date)
    rejectedAt: Date | string;

    rejectedItems?: RejectedItem[];
}

