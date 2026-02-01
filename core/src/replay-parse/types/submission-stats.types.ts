import {
    Field, Int, ObjectType,
} from "@nestjs/graphql";
import GraphQLJSON from "graphql-type-json";

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

    @Field(() => String, {nullable: true})
  result?: string;

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
