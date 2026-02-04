import {
    Field, Int, ObjectType, registerEnumType,
} from "@nestjs/graphql";
import GraphQLJSON from "graphql-type-json";

export enum ReplaySubmissionTeamResult {
    WIN = "WIN",
    LOSS = "LOSS",
    DRAW = "DRAW",
    UNKNOWN = "UNKNOWN",
}

registerEnumType(ReplaySubmissionTeamResult, {name: "ReplaySubmissionTeamResult"});

@ObjectType()
export class ReplaySubmissionPlayer {
    @Field(() => String)
  name: string;

    @Field(() => GraphQLJSON, {nullable: true})
  stats?: Record<string, number>;
}

@ObjectType()
export class ReplaySubmissionTeam {
    @Field(() => [ReplaySubmissionPlayer])
  players: ReplaySubmissionPlayer[];

    @Field(() => ReplaySubmissionTeamResult, {nullable: true})
  result?: ReplaySubmissionTeamResult;

    @Field(() => Int, {nullable: true})
  score?: number;

    @Field(() => GraphQLJSON, {nullable: true})
  stats?: Record<string, number>;
}

@ObjectType()
export class ReplaySubmissionGame {
    @Field(() => [ReplaySubmissionTeam])
  teams: ReplaySubmissionTeam[];
}

@ObjectType()
export class ReplaySubmissionStats {
    @Field(() => [ReplaySubmissionGame])
  games: ReplaySubmissionGame[];
}
