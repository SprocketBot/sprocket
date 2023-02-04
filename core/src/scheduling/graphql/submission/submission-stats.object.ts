import {Field, Int, ObjectType} from "@nestjs/graphql";
import type {ReplaySubmissionStats} from "@sprocketbot/common";

@ObjectType()
export class SubmissionPlayerObject {
    @Field(() => String)
    name: string;

    @Field(() => Int)
    goals: number;
}

@ObjectType()
export class SubmissionTeamObject {
    @Field(() => [SubmissionPlayerObject])
    players: SubmissionPlayerObject[];

    @Field(() => Boolean)
    won: boolean;

    @Field(() => Int)
    score: number;
}

@ObjectType()
export class SubmissionGameObject {
    @Field(() => [SubmissionTeamObject])
    teams: SubmissionTeamObject[];
}

@ObjectType()
export class SubmissionStatsObject implements ReplaySubmissionStats {
    @Field(() => [SubmissionGameObject])
    games: SubmissionGameObject[];
}
