import {
    Field, Int, ObjectType, registerEnumType,
} from "@nestjs/graphql";
import type {Scrim} from "@sprocketbot/common";

import type {Match} from "../../database";
import {ReplaySubmissionItem} from "./submission-item.types";
import {SubmissionRejection} from "./submission-rejection.types";
import {ReplaySubmissionStats} from "./submission-stats.types";

export enum ReplaySubmissionType {
    MATCH = "MATCH",
    SCRIM = "SCRIM",
}
registerEnumType(ReplaySubmissionType, {name: "ReplaySubmissionType"});

@ObjectType("ReplaySubmission")
export class GqlReplaySubmission {
    @Field(() => Int)
    creatorId: number;

    @Field(() => [String])
    taskIds: string[];

    @Field(() => [ReplaySubmissionItem])
    items: ReplaySubmissionItem[];

    @Field(() => Boolean)
    validated: boolean;

    @Field(() => ReplaySubmissionStats, {nullable: true})
    stats?: ReplaySubmissionStats;

    @Field(() => Number)
    ratifications: number;

    @Field(() => Number)
    requiredRatifications: number;

    @Field(() => Boolean)
    userHasRatified: boolean;

    @Field(() => [SubmissionRejection])
    rejections?: SubmissionRejection[];

    @Field(() => ReplaySubmissionType)
    type: ReplaySubmissionType;

    @Field(() => String, {nullable: true})
    scrimId?: Scrim["id"];

    @Field(() => String, {nullable: true})
    matchId?: Match["id"];

    ratifiers: number[];
}

export class ScrimReplaySubmission extends GqlReplaySubmission {
    type: ReplaySubmissionType.SCRIM = ReplaySubmissionType.SCRIM;

    scrimId: Scrim["id"];
}

export class MatchReplaySubmission extends GqlReplaySubmission {
    type: ReplaySubmissionType.MATCH = ReplaySubmissionType.MATCH;

    matchId: Match["id"];
}

export type ReplaySubmission = MatchReplaySubmission | ScrimReplaySubmission;
