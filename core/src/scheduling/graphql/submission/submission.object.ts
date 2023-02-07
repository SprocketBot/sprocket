import {Field, Int, ObjectType, registerEnumType} from "@nestjs/graphql";
import type {
    BaseSubmission,
    MatchSubmission as CommonMatchSubmission,
    Scrim,
    ScrimSubmission as CommonScrimSubmission,
} from "@sprocketbot/common";
import {SubmissionStatus, SubmissionType} from "@sprocketbot/common";

import type {Match} from "../../database/match.entity";
import {SubmissionItemObject} from "./submission-item.object";
import {SubmissionRatificationObject, SubmissionRejectionObject} from "./submission-ratification.object";
import {SubmissionStatsObject} from "./submission-stats.object";

registerEnumType(SubmissionType, {name: "SubmissionType"});
registerEnumType(SubmissionStatus, {name: "SubmissionStatus"});

@ObjectType()
export class SubmissionObject implements BaseSubmission {
    @Field()
    id: string;

    @Field(() => SubmissionType)
    type: SubmissionType;

    @Field(() => SubmissionStatus)
    status: SubmissionStatus;

    @Field(() => Boolean)
    validated: boolean;

    @Field(() => Number)
    requiredRatifications: number;

    @Field(() => [SubmissionRatificationObject])
    ratifications: SubmissionRatificationObject[];

    @Field(() => [SubmissionRejectionObject])
    rejections: SubmissionRejectionObject[];

    @Field(() => Int)
    rejectionStreak: number;

    @Field(() => Int)
    uploaderUserId: number;

    @Field(() => [SubmissionItemObject])
    items: SubmissionItemObject[];

    // TODO: This!
    @Field(() => Boolean)
    rounds: any[];

    @Field(() => SubmissionStatsObject, {nullable: true})
    stats?: SubmissionStatsObject;

    @Field(() => String, {nullable: true})
    scrimId?: Scrim["id"];

    @Field(() => String, {nullable: true})
    matchId?: Match["id"];
}

export class ScrimSubmission extends SubmissionObject implements CommonScrimSubmission {
    type: SubmissionType.Scrim = SubmissionType.Scrim;

    scrimId: Scrim["id"];
}

export class MatchSubmission extends SubmissionObject implements CommonMatchSubmission {
    type: SubmissionType.Match = SubmissionType.Match;

    matchId: Match["id"];
}

export type ReplaySubmission = MatchSubmission | ScrimSubmission;
