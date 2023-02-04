import {Field, Int, ObjectType, registerEnumType} from "@nestjs/graphql";
import type {
    BaseReplaySubmission,
    MatchReplaySubmission as CommonMatchReplaySubmission,
    Scrim,
    ScrimReplaySubmission as CommonScrimReplaySubmission,
} from "@sprocketbot/common";
import {ReplaySubmissionStatus, ReplaySubmissionType} from "@sprocketbot/common";

import type {Match} from "../../database/match.entity";
import {SubmissionItemObject} from "./submission-item.object";
import {SubmissionRejectionObject} from "./submission-rejection.object";
import {SubmissionStatsObject} from "./submission-stats.object";

registerEnumType(ReplaySubmissionType, {name: "ReplaySubmissionType"});
registerEnumType(ReplaySubmissionStatus, {name: "ReplaySubmissionStatus"});

@ObjectType()
export class SubmissionObject implements BaseReplaySubmission {
    @Field()
    id: string;

    @Field(() => Int)
    creatorUserId: number;

    @Field(() => [String])
    taskIds: string[];

    @Field(() => ReplaySubmissionStatus)
    status: ReplaySubmissionStatus;

    @Field(() => [SubmissionItemObject])
    items: SubmissionItemObject[];

    @Field(() => Boolean)
    validated: boolean;

    @Field(() => SubmissionStatsObject, {nullable: true})
    stats?: SubmissionStatsObject;

    @Field(() => Number)
    requiredRatifications: number;

    @Field(() => [SubmissionRejectionObject])
    rejections: SubmissionRejectionObject[];

    @Field(() => ReplaySubmissionType)
    type: ReplaySubmissionType;

    @Field(() => String, {nullable: true})
    scrimId?: Scrim["id"];

    @Field(() => String, {nullable: true})
    matchId?: Match["id"];

    @Field(() => [Number])
    ratifiers: number[];
}

export class ScrimReplaySubmission extends SubmissionObject implements CommonScrimReplaySubmission {
    type: ReplaySubmissionType.SCRIM = ReplaySubmissionType.SCRIM;

    scrimId: Scrim["id"];
}

export class MatchReplaySubmission extends SubmissionObject implements CommonMatchReplaySubmission {
    type: ReplaySubmissionType.MATCH = ReplaySubmissionType.MATCH;

    matchId: Match["id"];
}

export type ReplaySubmission = MatchReplaySubmission | ScrimReplaySubmission;
